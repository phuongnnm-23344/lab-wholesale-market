-- 0009: demo seed for trading + money, and the single reset entry point (service_role only).
-- Dates are relative to "today" in JST so the demo stays usable until LAB-6.
-- 7 business days: 2 in month M-2, 2 in M-1, D-2, D-1 (all LOCKED) and D (OPEN).
-- 相対 is the main channel: 1 of 12 trades per past day is せり (~10% of value).

create or replace function public.seed_demo_trading(p_today date)
returns void language plpgsql security definer set search_path = ''
as $$
declare
  v_intake uuid := public.demo_user_id('S1001');
  v_judge uuid := public.demo_user_id('S1002');
  v_trade uuid := public.demo_user_id('S1003');
  v_trade2 uuid := public.demo_user_id('S1004');
  v_delivery uuid := public.demo_user_id('S1005');
  v_head uuid := public.demo_user_id('S1007');
  v_month date := date_trunc('month', p_today)::date;
  v_species text[] := array['サンプル真鯛', 'サンプル真鯵', 'サンプル真鯖', 'サンプル鰤', 'サンプル鰹', 'サンプルするめいか'];
  v_grades text[] := array['A', 'B', 'A', 'S', 'B', 'A'];
  v_shippers text[] := array['サンプル第一丸', 'サンプル第二丸', 'サンプル漁協A'];
  v_days date[];
  v_buyers uuid[];
  v_day date; v_past boolean; k int; j int; n int;
  v_lot uuid; v_trade_id uuid; v_session uuid;
  v_qty numeric; v_price bigint; v_channel public.trade_channel; v_status public.lot_status;
begin
  v_days := array(
    select distinct x from unnest(array[
      (v_month - interval '2 month')::date + 5, (v_month - interval '2 month')::date + 15,
      (v_month - interval '1 month')::date + 5, (v_month - interval '1 month')::date + 15,
      p_today - 2, p_today - 1, p_today]) as x
    order by x);
  select array_agg(p.id order by p.buyer_no) into v_buyers
    from public.participants p where p.buyer_no ~ '^[NB]0[1-7]$';   -- valid 許可 / 承認 only

  insert into public.business_days (business_date, status) select unnest(v_days), 'OPEN';

  for k in 1 .. array_length(v_days, 1) loop
    v_day := v_days[k];
    v_past := v_day <> p_today;
    if v_past then
      insert into public.seri_sessions (business_date, session_no, status, entered_by, confirmed_by, confirmed_at)
      values (v_day, 1, 'CONFIRMED', v_trade, v_trade2, (v_day + time '05:30') at time zone 'Asia/Tokyo')
      returning id into v_session;
    end if;

    for j in 1 .. 6 loop
      v_status := (case when v_past then 'DELIVERED' when j <= 2 then 'PROVISIONAL'
                        when j = 3 then 'RECEIVED' when j = 4 then 'INSPECTED' else 'PUBLISHED' end
                  )::public.lot_status;
      insert into public.lots (lot_no, business_date, shipper_name, species, qty_received, status,
                               provisional_by, registered_by)
      values (format('L%s-%s', to_char(v_day, 'YYYYMMDD'), j), v_day, v_shippers[1 + j % 3],
              v_species[j], case when v_status = 'PROVISIONAL' then null else 100 end, v_status,
              v_intake, case when v_status = 'PROVISIONAL' then null else v_intake end)
      returning id into v_lot;

      if v_status <> 'PROVISIONAL' then
        insert into public.lot_quantity_ledger (lot_id, business_date, qty_delta, reason, created_by)
        values (v_lot, v_day, 100, '受入', v_intake);
      end if;
      if v_past or j >= 4 then
        insert into public.lot_inspections (lot_id, business_date, grade, freshness_note, inspected_by)
        values (v_lot, v_day, v_grades[j], 'サンプル：目視確認済み', v_judge);
      end if;

      for n in 1 .. (case when v_past then 2 when j = 5 then 1 else 0 end) loop
        v_qty := case when not v_past then 30 when n = 1 then 40 else 60 end;
        v_channel := (case when v_past and j = 6 and n = 1 then 'SERI' else 'AITAI' end)::public.trade_channel;
        v_price := 800 + ((k * 7 + j * 13 + n * 5) % 20) * 100;
        insert into public.trades (trade_no, business_date, lot_id, buyer_id, channel, qty,
          unit_price_jpy, amount_jpy, status, seri_session_id, created_by, confirmed_by, confirmed_at)
        values (format('T%s-%s-%s', to_char(v_day, 'YYYYMMDD'), j, n), v_day, v_lot,
          v_buyers[1 + ((k * 12 + j * 2 + n) % array_length(v_buyers, 1))], v_channel, v_qty,
          v_price, floor(v_qty * v_price)::bigint, 'CONFIRMED',
          case when v_channel = 'SERI' then v_session end, v_trade,
          case when v_channel = 'SERI' then v_trade2 else v_trade end,
          (v_day + time '05:00') at time zone 'Asia/Tokyo')
        returning id into v_trade_id;

        insert into public.lot_quantity_ledger (lot_id, business_date, qty_delta, reason, ref_trade_id, created_by)
        values (v_lot, v_day, -v_qty, '販売', v_trade_id, v_trade);
        if v_past then
          insert into public.deliveries (trade_id, business_date, qty_delivered, recorded_by)
          values (v_trade_id, v_day, v_qty, v_delivery);
        end if;
      end loop;
    end loop;
  end loop;

  update public.business_days
     set status = 'LOCKED', locked_by = v_head, locked_at = now()
   where business_date <> p_today;
end;
$$;

-- Periods M-2 (LOCKED, paid, incentives computed), M-1 and M (OPEN). Due date = 10th of next month.
-- Payment cases: B03 short by 1 yen, N03 paid 1 day late → both 未完納 (BR-INC-01: no grace).
create or replace function public.seed_demo_money(p_today date)
returns void language plpgsql security definer set search_path = ''
as $$
declare
  v_month date := date_trunc('month', p_today)::date;
  v_head uuid := public.demo_user_id('S1007');
  v_settle uuid := public.demo_user_id('S1006');
  v_start date; v_p1 uuid; v_id uuid; v_batch uuid; v_run uuid; m int;
begin
  for m in 0 .. 2 loop
    v_start := (v_month - make_interval(months => 2 - m))::date;
    insert into public.payment_periods (period_code, start_date, end_date, due_date, status, locked_by, locked_at)
    values (to_char(v_start, 'YYYY-MM'), v_start, (v_start + interval '1 month')::date - 1,
            (v_start + interval '1 month')::date + 9,
            case when m = 0 then 'LOCKED' else 'OPEN' end::public.period_status,
            case when m = 0 then v_head end, case when m = 0 then now() end)
    returning id into v_id;
    if m = 0 then v_p1 := v_id; end if;
  end loop;

  insert into public.payment_import_batches (file_name, row_count, imported_by)
  select 'サンプル入金_初期データ.csv', count(distinct l.buyer_id), v_settle
  from public.payment_periods p
  join public.v_settlement_lines l on l.business_date between p.start_date and p.end_date
  where p.id = v_p1
  returning id into v_batch;

  insert into public.payments (batch_id, buyer_no, participant_id, paid_on, amount_jpy)
  select v_batch, pt.buyer_no, pt.id,
         case pt.buyer_no when 'N03' then p.due_date + 1 else p.due_date - 3 end,
         case pt.buyer_no when 'B03' then pay.payable_jpy - 1 else pay.payable_jpy end
  from public.payment_periods p
  cross join lateral (
    select l.buyer_id, floor(sum(l.amount_jpy) * 110 / 100)::bigint as payable_jpy
    from public.v_settlement_lines l
    where l.business_date between p.start_date and p.end_date
    group by l.buyer_id
  ) pay
  join public.participants pt on pt.id = pay.buyer_id
  where p.id = v_p1;

  insert into public.incentive_runs (period_id, run_by) values (v_p1, v_head) returning id into v_run;

  insert into public.incentive_results (run_id, period_id, participant_id, kind, payable_jpy,
                                        paid_jpy, kanno, incentive_jpy, rule_version_id)
  select v_run, v_p1, pay.buyer_id, 'MAIN', pay.payable_jpy, coalesce(pd.total, 0),
         coalesce(pd.on_time, 0) >= pay.payable_jpy,
         case when coalesce(pd.on_time, 0) >= pay.payable_jpy
              then floor(pay.payable_jpy * r.rate_permille / 1000.0)::bigint else 0 end,
         ver.version_id
  from public.payment_periods p
  cross join lateral (select public.active_rule_version_on(p.end_date) as version_id) ver
  cross join lateral (
    select l.buyer_id, floor(sum(l.amount_jpy) * 110 / 100)::bigint as payable_jpy
    from public.v_settlement_lines l
    where l.business_date between p.start_date and p.end_date
    group by l.buyer_id
  ) pay
  left join lateral (
    select sum(x.amount_jpy) as total, sum(x.amount_jpy) filter (where x.paid_on <= p.due_date) as on_time
    from public.payments x where x.participant_id = pay.buyer_id and x.batch_id = v_batch
  ) pd on true
  join public.incentive_rate_rows r
    on r.rule_version_id = ver.version_id and pay.payable_jpy >= r.min_paid_jpy
   and (r.max_paid_jpy is null or pay.payable_jpy < r.max_paid_jpy)
  where p.id = v_p1;
end;
$$;

-- Single entry point: wipe business data (NOT accounts) and re-seed. Used by seed.sql and
-- scripts/reset-demo.ts. Audit trigger is skipped while seeding (transaction-local setting).
create or replace function public.reset_demo_business_data()
returns void language plpgsql security definer set search_path = ''
as $$
declare v_today date := (now() at time zone 'Asia/Tokyo')::date;
begin
  perform set_config('app.seeding', 'on', true);
  truncate table
    public.audit_logs, public.incentive_results, public.incentive_runs, public.incentive_rate_rows,
    public.rule_versions, public.payments, public.payment_import_batches, public.payment_periods,
    public.trade_adjustments, public.correction_requests, public.deliveries,
    public.lot_quantity_ledger, public.trades, public.seri_sessions, public.lot_inspections,
    public.lots, public.business_days, public.baibai_approvals, public.nakaoroshi_permits,
    public.participants
    restart identity;
  perform public.seed_demo_master(v_today);
  perform public.seed_demo_rule_versions();
  perform public.seed_demo_trading(v_today);
  perform public.seed_demo_money(v_today);
  perform set_config('app.seeding', 'off', true);
end;
$$;

revoke execute on function
  public.admin_set_pin_hash(uuid, text), public.demo_user_id(text),
  public.seed_demo_master(date), public.seed_demo_rule_versions(),
  public.seed_demo_trading(date), public.seed_demo_money(date),
  public.reset_demo_business_data()
from public, anon, authenticated;
grant execute on function public.admin_set_pin_hash(uuid, text), public.reset_demo_business_data()
  to service_role;
