-- 0021 (phase 08): checker (照合部門長) approves / returns / cancels. S4: maker ≠ checker.
-- Old ACTIVE versions become SUPERSEDED at approval; they still apply before the new effective date
-- (active_rule_version_on). Cancelling an approved-but-not-yet-effective version restores the one it replaced.

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
  update public.rule_versions set status = 'SUPERSEDED'
   where status = 'ACTIVE' and effective_from < v_v.effective_from;
  update public.rule_versions
     set status = 'ACTIVE', checker_id = v_caller, approved_at = now(), replaced_version_id = v_replaced
   where id = p_id;
  return 'ACTIVE';
end;
$$;

create or replace function public.return_rule_version(p_id uuid, p_reason text)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  perform public.assert_caller(array[]::public.app_role_code[], array['STL_HEAD']::public.authority_code[]);
  if coalesce(btrim(p_reason), '') = '' then
    raise exception using errcode = 'P0001', message = 'VALIDATION: reason is required';
  end if;
  update public.rule_versions set status = 'DRAFT', note = concat_ws(' / 差戻し：', note, p_reason)
   where id = p_id and status = 'PENDING';
  if not found then
    raise exception using errcode = 'P0001', message = 'CONFLICT: version is not waiting for approval';
  end if;
end;
$$;

-- PENDING → CANCELLED, or ACTIVE not yet effective → CANCELLED + restore the version it replaced.
create or replace function public.cancel_rule_version(p_id uuid, p_reason text)
returns void language plpgsql security definer set search_path = ''
as $$
declare v_v public.rule_versions%rowtype;
begin
  perform public.assert_caller(array[]::public.app_role_code[], array['STL_HEAD']::public.authority_code[]);
  if coalesce(btrim(p_reason), '') = '' then
    raise exception using errcode = 'P0001', message = 'VALIDATION: reason is required';
  end if;
  select * into v_v from public.rule_versions where id = p_id for update;
  if not found or not (v_v.status = 'PENDING'
                       or (v_v.status = 'ACTIVE' and v_v.effective_from > public.current_business_date())) then
    raise exception using errcode = 'P0001', message = 'CONFLICT: only pending or not-yet-effective versions can be cancelled';
  end if;
  update public.rule_versions set status = 'CANCELLED', note = concat_ws(' / 取消：', note, p_reason) where id = p_id;
  if v_v.status = 'ACTIVE' and v_v.replaced_version_id is not null then
    update public.rule_versions set status = 'ACTIVE' where id = v_v.replaced_version_id and status = 'SUPERSEDED';
  end if;
end;
$$;

revoke execute on function
  public.fiscal_year_start(date), public.rule_version_quota_used(date), public.earliest_allowed_effective_date(),
  public.create_rule_version(date, text, uuid), public.validate_rate_rows(uuid), public.save_rate_rows(uuid, jsonb),
  public.submit_rule_version(uuid), public.approve_rule_version(uuid), public.return_rule_version(uuid, text),
  public.cancel_rule_version(uuid, text)
from public, anon, authenticated;
grant execute on function
  public.rule_version_quota_used(date), public.create_rule_version(date, text, uuid), public.save_rate_rows(uuid, jsonb),
  public.submit_rule_version(uuid), public.approve_rule_version(uuid), public.return_rule_version(uuid, text),
  public.cancel_rule_version(uuid, text)
to authenticated;
