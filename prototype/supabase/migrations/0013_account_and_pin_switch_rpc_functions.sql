-- 0013 (phase 03): account admin (SC-02-03) and shared-device PIN switch (SC-00-02).
-- Expert M3: demo accounts (is_demo_protected) cannot be changed through the app.
-- Expert N1: PIN switch only between role-list P12 users; never to SYSADM / RULE / SETTLE without a head
-- authority; target must be active and not banned; verify RPC executable by service_role ONLY.

-- role-list P12 eligibility: INTAKE / JUDGE / TRADE / DELIVERY, or a head authority — never SYSADM / RULE.
create or replace function public.is_pin_switch_eligible(p_user_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    join auth.users u on u.id = p.user_id
    where p.user_id = p_user_id and p.is_active
      and (u.banned_until is null or u.banned_until <= now())
      and p.role not in ('SYSADM', 'RULE')
      and (p.role in ('INTAKE', 'JUDGE', 'TRADE', 'DELIVERY')
           or exists (select 1 from public.user_authorities a
                      where a.user_id = p.user_id and a.authority in ('DEL_HEAD', 'STL_HEAD', 'OPS_HEAD')))
  );
$$;

-- SYSADM creates / updates a profile (the Auth user itself is created by the route with the secret key).
create or replace function public.admin_upsert_account(
  p_user_id uuid, p_employee_no text, p_display_name text, p_role public.app_role_code,
  p_authorities public.authority_code[], p_is_active boolean)
returns void language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_protected boolean; v_old_role public.app_role_code;
begin
  v_caller := public.assert_caller(array['SYSADM']::public.app_role_code[], array[]::public.authority_code[]);
  select is_demo_protected, role into v_protected, v_old_role from public.profiles where user_id = p_user_id;
  if coalesce(v_protected, false) then
    raise exception using errcode = 'P0001', message = 'DEMO_PROTECTED: demo account cannot be changed';
  end if;
  if p_user_id = v_caller and (p_role is distinct from v_old_role or not p_is_active) then
    raise exception using errcode = 'P0001', message = 'FORBIDDEN: cannot change own role or deactivate self';
  end if;
  insert into public.profiles (user_id, employee_no, display_name, role, is_active, is_demo_protected)
  values (p_user_id, p_employee_no, p_display_name, p_role, p_is_active, false)
  on conflict (user_id) do update
    set employee_no = excluded.employee_no, display_name = excluded.display_name,
        role = excluded.role, is_active = excluded.is_active;
  delete from public.user_authorities where user_id = p_user_id;
  insert into public.user_authorities (user_id, authority, granted_by)
  select p_user_id, a, v_caller from unnest(coalesce(p_authorities, array[]::public.authority_code[])) as a;
end;
$$;

-- SYSADM sets a 4-digit PIN for a P12-eligible, non-demo account. Hash only (bcrypt).
create or replace function public.admin_set_account_pin(p_user_id uuid, p_pin text)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  perform public.assert_caller(array['SYSADM']::public.app_role_code[], array[]::public.authority_code[]);
  if exists (select 1 from public.profiles where user_id = p_user_id and is_demo_protected) then
    raise exception using errcode = 'P0001', message = 'DEMO_PROTECTED: demo account cannot be changed';
  end if;
  if not public.is_pin_switch_eligible(p_user_id) then
    raise exception using errcode = 'P0001', message = 'VALIDATION: this account does not use a shared-device PIN';
  end if;
  perform public.admin_set_pin_hash(p_user_id, p_pin);
  insert into public.audit_logs (actor_id, action, table_name, record_id)
  values (auth.uid(), 'PIN_SET', 'profile_pins', p_user_id::text);
end;
$$;

-- Called ONLY by the /api/auth/pin-switch route with the secret key, after getUser() of the source.
-- Returns {ok, code, target_user_id}. Wrong PIN is a RETURN (not an exception) so the failure count
-- is committed; 5 failures lock the target PIN for 15 minutes.
create or replace function public.verify_pin_for_switch(p_source_user_id uuid, p_employee_no text, p_pin text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare v_target uuid; v_pin public.profile_pins%rowtype;
begin
  if not public.is_pin_switch_eligible(p_source_user_id) then
    return jsonb_build_object('ok', false, 'code', 'SOURCE_NOT_ALLOWED');
  end if;
  select user_id into v_target from public.profiles where employee_no = p_employee_no;
  if v_target is null or not public.is_pin_switch_eligible(v_target) then
    return jsonb_build_object('ok', false, 'code', 'TARGET_NOT_ALLOWED');
  end if;
  if v_target = p_source_user_id then
    return jsonb_build_object('ok', false, 'code', 'SAME_USER');
  end if;
  select * into v_pin from public.profile_pins where user_id = v_target for update;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'PIN_NOT_SET');
  end if;
  if v_pin.pin_locked_until is not null and v_pin.pin_locked_until > now() then
    return jsonb_build_object('ok', false, 'code', 'PIN_LOCKED');
  end if;
  if extensions.crypt(p_pin, v_pin.pin_hash) <> v_pin.pin_hash then
    update public.profile_pins
       set pin_failed_count = case when pin_failed_count + 1 >= 5 then 0 else pin_failed_count + 1 end,
           pin_locked_until = case when pin_failed_count + 1 >= 5 then now() + interval '15 minutes' end
     where user_id = v_target;
    insert into public.audit_logs (actor_id, action, table_name, record_id)
    values (p_source_user_id, 'PIN_SWITCH_FAILED', 'profiles', v_target::text);
    return jsonb_build_object('ok', false,
      'code', case when v_pin.pin_failed_count + 1 >= 5 then 'PIN_LOCKED' else 'PIN_INVALID' end);
  end if;
  update public.profile_pins set pin_failed_count = 0, pin_locked_until = null where user_id = v_target;
  insert into public.audit_logs (actor_id, action, table_name, record_id)
  values (p_source_user_id, 'PIN_SWITCH', 'profiles', v_target::text);
  return jsonb_build_object('ok', true, 'code', 'OK', 'target_user_id', v_target);
end;
$$;

revoke execute on function
  public.is_pin_switch_eligible(uuid),
  public.admin_upsert_account(uuid, text, text, public.app_role_code, public.authority_code[], boolean),
  public.admin_set_account_pin(uuid, text),
  public.verify_pin_for_switch(uuid, text, text)
from public, anon, authenticated;
grant execute on function
  public.admin_upsert_account(uuid, text, text, public.app_role_code, public.authority_code[], boolean),
  public.admin_set_account_pin(uuid, text)
to authenticated;
grant execute on function public.verify_pin_for_switch(uuid, text, text) to service_role;
