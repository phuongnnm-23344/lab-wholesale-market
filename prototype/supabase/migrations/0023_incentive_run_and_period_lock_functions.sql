-- 0023 (phase 09): 完納奨励金 — preview (writes nothing), run (once per open period, m7), lock (creates the
-- next period, n5). DELTA rows (PRM-043): for every LOCKED earlier period and buyer with a MAIN row:
-- recalculated (version of THAT period, incl. band change; 完納 NOT re-judged) − everything recorded for it
-- (MAIN + earlier DELTAs). Not 完納 → recalculated 0 → no delta. Catches CORR approved between run and lock (n4).

create or replace function public.incentive_for(p_payable bigint, p_version uuid)
returns bigint language sql stable security definer set search_path = ''
as $$
  select coalesce((select floor(p_payable * r.rate_permille / 1000.0)::bigint
                   from public.incentive_rate_rows r
                   where r.rule_version_id = p_version and p_payable >= r.min_paid_jpy
                     and (r.max_paid_jpy is null or p_payable < r.max_paid_jpy)), 0);
$$;

create or replace function public.compute_incentive_rows(p_period_id uuid)
returns table (o_participant_id uuid, o_kind public.incentive_kind, o_ref_period_id uuid, o_payable_jpy bigint,
               o_paid_jpy bigint, o_kanno boolean, o_incentive_jpy bigint, o_rule_version_id uuid)
language plpgsql stable security definer set search_path = ''
as $$
declare v_p public.payment_periods%rowtype; v_version uuid;
begin
  select * into v_p from public.payment_periods where id = p_period_id;
  v_version := public.active_rule_version_on(v_p.end_date);
  return query
    select pp.participant_id, 'MAIN'::public.incentive_kind, null::uuid, pp.payable_jpy, pp.paid_total_jpy, pp.kanno,
           case when pp.kanno then public.incentive_for(pp.payable_jpy, v_version) else 0 end, v_version
    from public.period_payables(p_period_id) pp;
  return query
    select m.participant_id, 'DELTA'::public.incentive_kind, l.id, np.payable, m.paid_jpy, m.kanno,
           (case when m.kanno then public.incentive_for(np.payable, m.rule_version_id) else 0 end) - rec.total,
           m.rule_version_id
    from public.payment_periods l
    join public.incentive_results m on m.period_id = l.id and m.kind = 'MAIN'
    cross join lateral (
      select coalesce(sum(r.incentive_jpy), 0)::bigint as total from public.incentive_results r
      where r.participant_id = m.participant_id
        and ((r.kind = 'MAIN' and r.period_id = l.id) or (r.kind = 'DELTA' and r.ref_period_id = l.id))
    ) rec
    cross join lateral (
      select floor(coalesce((select a.amount_jpy from public.period_buyer_amounts(l.id) a
                             where a.participant_id = m.participant_id), 0) * 110 / 100.0)::bigint as payable
    ) np
    where l.status = 'LOCKED' and l.end_date < v_p.start_date
      and (case when m.kanno then public.incentive_for(np.payable, m.rule_version_id) else 0 end) - rec.total <> 0;
end;
$$;

-- SC-09-04 tính thử: returns the rows that `run` would write. Writes nothing.
create or replace function public.preview_incentives(p_period_id uuid)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
begin
  perform public.assert_caller(array['SETTLE']::public.app_role_code[], array['STL_HEAD']::public.authority_code[]);
  return coalesce((
    select jsonb_agg(jsonb_build_object('participant_id', c.o_participant_id, 'buyer_no', pt.buyer_no, 'name', pt.name,
      'kind', c.o_kind, 'ref_period_id', c.o_ref_period_id, 'payable_jpy', c.o_payable_jpy, 'paid_jpy', c.o_paid_jpy,
      'kanno', c.o_kanno, 'incentive_jpy', c.o_incentive_jpy, 'rule_version_id', c.o_rule_version_id) order by c.o_kind, pt.buyer_no)
    from public.compute_incentive_rows(p_period_id) c join public.participants pt on pt.id = c.o_participant_id), '[]'::jsonb);
end;
$$;

create or replace function public.run_incentive_calc(p_period_id uuid)
returns integer language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_status public.period_status; v_run uuid; v_count int;
begin
  v_caller := public.assert_caller(array[]::public.app_role_code[], array['STL_HEAD']::public.authority_code[]);
  select status into v_status from public.payment_periods where id = p_period_id for update;
  if v_status is distinct from 'OPEN' then
    raise exception using errcode = 'P0001', message = 'CONFLICT: period is not open';
  end if;
  if exists (select 1 from public.incentive_runs where period_id = p_period_id) then
    raise exception using errcode = 'P0001', message = 'CONFLICT: incentives were already calculated for this period';
  end if;
  insert into public.incentive_runs (period_id, run_by) values (p_period_id, v_caller) returning id into v_run;
  insert into public.incentive_results (run_id, period_id, participant_id, kind, ref_period_id, payable_jpy,
                                        paid_jpy, kanno, incentive_jpy, rule_version_id)
  select v_run, p_period_id, c.o_participant_id, c.o_kind, c.o_ref_period_id, c.o_payable_jpy, c.o_paid_jpy,
         c.o_kanno, c.o_incentive_jpy, c.o_rule_version_id
  from public.compute_incentive_rows(p_period_id) c;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- 期ロック (照合部門長): requires the run; opens the next monthly period if missing.
create or replace function public.lock_period(p_period_id uuid)
returns text language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_p public.payment_periods%rowtype; v_next date;
begin
  v_caller := public.assert_caller(array[]::public.app_role_code[], array['STL_HEAD']::public.authority_code[]);
  select * into v_p from public.payment_periods where id = p_period_id for update;
  if not found or v_p.status <> 'OPEN' then
    raise exception using errcode = 'P0001', message = 'CONFLICT: period is not open';
  end if;
  if not exists (select 1 from public.incentive_runs where period_id = p_period_id) then
    raise exception using errcode = 'P0001', message = 'CONFLICT: calculate incentives before locking';
  end if;
  update public.payment_periods set status = 'LOCKED', locked_by = v_caller, locked_at = now() where id = p_period_id;
  v_next := v_p.end_date + 1;
  insert into public.payment_periods (period_code, start_date, end_date, due_date, status)
  values (to_char(v_next, 'YYYY-MM'), v_next, (v_next + interval '1 month')::date - 1, (v_next + interval '1 month')::date + 9, 'OPEN')
  on conflict (period_code) do nothing;
  return to_char(v_next, 'YYYY-MM');
end;
$$;

revoke execute on function
  public.incentive_for(bigint, uuid), public.compute_incentive_rows(uuid), public.preview_incentives(uuid),
  public.run_incentive_calc(uuid), public.lock_period(uuid)
from public, anon, authenticated;
grant execute on function public.preview_incentives(uuid), public.run_incentive_calc(uuid), public.lock_period(uuid)
to authenticated;
