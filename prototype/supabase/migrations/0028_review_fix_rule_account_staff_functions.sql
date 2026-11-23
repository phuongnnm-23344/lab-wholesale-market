-- 0028 — code review fixes W8, W9, W10, W7 (staff names). Bodies otherwise as in 0013, 0014, 0020, 0021.
-- W8  システム管理者 cannot change the authorities of its OWN account (no self-granted approval power).
-- W9  only the maker of a DRAFT may edit its rate bands (maker ≠ checker cannot be bypassed); 404 if missing.
-- W10 approvals are serialised per fiscal year (advisory lock) → never more than 4 versions per year.
-- W7  staff_display_names returns employee_no (the PIN-switch login id) only to システム管理者.

create or replace function public.admin_upsert_account(
  p_user_id uuid, p_employee_no text, p_display_name text, p_role public.app_role_code,
  p_authorities public.authority_code[], p_is_active boolean)
returns void language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_protected boolean; v_old_role public.app_role_code; v_old_auth text[]; v_new_auth text[];
begin
  v_caller := public.assert_caller(array['SYSADM']::public.app_role_code[], array[]::public.authority_code[]);
  select is_demo_protected, role into v_protected, v_old_role from public.profiles where user_id = p_user_id;
  if coalesce(v_protected, false) then
    raise exception using errcode = 'P0001', message = 'DEMO_PROTECTED: demo account cannot be changed';
  end if;
  if p_user_id = v_caller then
    select coalesce(array_agg(authority::text order by authority), '{}') into v_old_auth
      from public.user_authorities where user_id = v_caller;
    select coalesce(array_agg(a::text order by a), '{}') into v_new_auth
      from unnest(coalesce(p_authorities, array[]::public.authority_code[])) a;
    if p_role is distinct from v_old_role or not p_is_active or v_old_auth <> v_new_auth then
      raise exception using errcode = 'P0001', message = 'FORBIDDEN: cannot change own role, authorities or status';
    end if;
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

create or replace function public.save_rate_rows(p_version_id uuid, p_rows jsonb)
returns void language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_maker uuid;
begin
  v_caller := public.assert_caller(array['RULE']::public.app_role_code[], array[]::public.authority_code[]);
  select maker_id into v_maker from public.rule_versions where id = p_version_id;
  if not found then
    raise exception using errcode = 'P0001', message = 'NOT_FOUND: rule version';
  end if;
  if v_maker is distinct from v_caller then
    raise exception using errcode = 'P0001', message = 'FORBIDDEN: only the maker can edit this draft';
  end if;
  delete from public.incentive_rate_rows where rule_version_id = p_version_id;
  insert into public.incentive_rate_rows (rule_version_id, min_paid_jpy, max_paid_jpy, rate_permille)
  select p_version_id, (r ->> 'min')::bigint, (r ->> 'max')::bigint, (r ->> 'rate')::int from jsonb_array_elements(p_rows) r;
  perform public.validate_rate_rows(p_version_id);
end;
$$;

create or replace function public.approve_rule_version(p_id uuid)
returns text language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_v public.rule_versions%rowtype; v_replaced uuid;
begin
  v_caller := public.assert_caller(array[]::public.app_role_code[], array['STL_HEAD']::public.authority_code[]);
  select * into v_v from public.rule_versions where id = p_id for update;
  if not found or v_v.status <> 'PENDING' then
    raise exception using errcode = 'P0001', message = 'CONFLICT: version is not waiting for approval';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('rule_quota_' || public.fiscal_year_start(v_v.effective_from)::text, 0));
  if v_v.maker_id = v_caller then
    raise exception using errcode = 'P0001', message = 'FORBIDDEN: the maker cannot approve the same version (S4)';
  end if;
  if v_v.effective_from < public.earliest_allowed_effective_date() then
    raise exception using errcode = 'P0001', message = 'VALIDATION: effective date is already in the past';
  end if;
  if exists (select 1 from public.rule_versions where status in ('ACTIVE', 'SUPERSEDED')
             and effective_from = v_v.effective_from) then
    raise exception using errcode = 'P0001', message = 'CONFLICT: a version already applies from this date';
  end if;
  if public.rule_version_quota_used(v_v.effective_from) >= 4 then
    raise exception using errcode = 'P0001', message = 'QUOTA_EXCEEDED: 4 versions already approved in this fiscal year';
  end if;
  v_replaced := public.active_rule_version_on(v_v.effective_from);
  update public.rule_versions set status = 'SUPERSEDED' where status = 'ACTIVE' and effective_from < v_v.effective_from;
  update public.rule_versions
     set status = 'ACTIVE', checker_id = v_caller, approved_at = now(), replaced_version_id = v_replaced
   where id = p_id;
  return 'ACTIVE';
end;
$$;

create or replace function public.staff_display_names(p_user_ids uuid[])
returns table (user_id uuid, display_name text, employee_no text)
language sql stable security definer set search_path = ''
as $$
  select p.user_id, p.display_name,
         case when public.app_role() = 'SYSADM' then p.employee_no end
  from public.profiles p
  where public.app_role() is not null and p.user_id = any (p_user_ids);
$$;
