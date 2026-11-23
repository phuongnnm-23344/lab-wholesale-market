-- 0020 (phase 08): rule / 交付率 versions — maker-checker, effective on the 1st of a month, SUPERSEDED /
-- CANCELLED, rollback = new version, max 4 approved versions per fiscal year of the effective date (PRM-042,
-- GOV-RULE-01 「年間最大四回」, rollback counts, cancelled-before-effective does not). Rule 5.

create or replace function public.fiscal_year_start(p_day date)
returns date language sql immutable set search_path = ''
as $$
  select make_date(case when extract(month from p_day) >= 4 then extract(year from p_day)::int
                        else extract(year from p_day)::int - 1 end, 4, 1);
$$;

-- Approved versions (ACTIVE / SUPERSEDED) whose effective date falls in the same fiscal year.
create or replace function public.rule_version_quota_used(p_day date)
returns integer language sql stable security definer set search_path = ''
as $$
  select count(*)::int from public.rule_versions
  where status in ('ACTIVE', 'SUPERSEDED')
    and public.fiscal_year_start(effective_from) = public.fiscal_year_start(p_day);
$$;

create or replace function public.earliest_allowed_effective_date()
returns date language sql stable security definer set search_path = ''
as $$
  select (date_trunc('month', public.current_business_date()) + interval '1 month')::date;
$$;

-- Maker (ルール管理者) creates a DRAFT. p_rollback_source: copy that version's rates (rollback = new version).
create or replace function public.create_rule_version(p_effective_from date, p_note text, p_rollback_source uuid)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_id uuid; v_source public.rule_versions%rowtype;
begin
  v_caller := public.assert_caller(array['RULE']::public.app_role_code[], array[]::public.authority_code[]);
  if extract(day from p_effective_from) <> 1 or p_effective_from < public.earliest_allowed_effective_date() then
    raise exception using errcode = 'P0001',
      message = format('VALIDATION: effective date must be the 1st of a month from %s', public.earliest_allowed_effective_date());
  end if;
  if p_rollback_source is not null then
    select * into v_source from public.rule_versions where id = p_rollback_source and status in ('ACTIVE', 'SUPERSEDED');
    if not found then
      raise exception using errcode = 'P0001', message = 'VALIDATION: rollback source must be an approved version';
    end if;
  end if;
  insert into public.rule_versions (version_no, effective_from, status, note, maker_id, rollback_of)
  values ((select coalesce(max(version_no), 0) + 1 from public.rule_versions), p_effective_from, 'DRAFT',
          coalesce(nullif(btrim(p_note), ''), case when v_source.id is not null then format('第%s版の交付率に戻す', v_source.version_no) end),
          v_caller, case when v_source.id is not null then public.active_rule_version_on(p_effective_from) end)
  returning id into v_id;
  if v_source.id is not null then
    insert into public.incentive_rate_rows (rule_version_id, min_paid_jpy, max_paid_jpy, rate_permille)
    select v_id, min_paid_jpy, max_paid_jpy, rate_permille from public.incentive_rate_rows where rule_version_id = v_source.id;
  end if;
  return v_id;
end;
$$;

-- Rate bands must start at 0, be contiguous, end open (max null), 0–1000 ‰.
create or replace function public.validate_rate_rows(p_version uuid)
returns void language plpgsql stable security definer set search_path = ''
as $$
declare v_row record; v_expected bigint := 0; v_count int := 0; v_open boolean := false;
begin
  for v_row in select * from public.incentive_rate_rows where rule_version_id = p_version order by min_paid_jpy loop
    if v_open or v_row.min_paid_jpy <> v_expected then
      raise exception using errcode = 'P0001', message = 'VALIDATION: rate bands must be contiguous from 0';
    end if;
    v_open := v_row.max_paid_jpy is null;
    v_expected := coalesce(v_row.max_paid_jpy, v_expected);
    v_count := v_count + 1;
  end loop;
  if v_count = 0 or not v_open then
    raise exception using errcode = 'P0001', message = 'VALIDATION: the last band must have no upper limit';
  end if;
end;
$$;

-- p_rows: [{ "min": 0, "max": 1000000, "rate": 6 }, ...]. DRAFT only (trigger RATE_LOCKED otherwise).
create or replace function public.save_rate_rows(p_version_id uuid, p_rows jsonb)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  perform public.assert_caller(array['RULE']::public.app_role_code[], array[]::public.authority_code[]);
  delete from public.incentive_rate_rows where rule_version_id = p_version_id;
  insert into public.incentive_rate_rows (rule_version_id, min_paid_jpy, max_paid_jpy, rate_permille)
  select p_version_id, (r ->> 'min')::bigint, (r ->> 'max')::bigint, (r ->> 'rate')::int from jsonb_array_elements(p_rows) r;
  perform public.validate_rate_rows(p_version_id);
end;
$$;

create or replace function public.submit_rule_version(p_id uuid)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  perform public.assert_caller(array['RULE']::public.app_role_code[], array[]::public.authority_code[]);
  perform public.validate_rate_rows(p_id);
  update public.rule_versions set status = 'PENDING' where id = p_id and status = 'DRAFT';
  if not found then
    raise exception using errcode = 'P0001', message = 'CONFLICT: only a DRAFT can be submitted';
  end if;
end;
$$;
