-- 0022 (phase 09): 入金 import (fictional CSV) and 期別お支払額 / 完納 (BR-INC-01, simplified — mock M07, M08).
-- Simplifications (declared in the screen / mock list):
--  * money of a period = original trades of the period + their REVERSE / DELTA lines (attributed to the
--    ORIGINAL trade date, so a CORR on an old trade changes that old period → DELTA next run, PRM-043);
--  * payable = floor(amount × 110 / 100) per buyer (one tax rate, no 端数調整);
--  * 入金 paid in the month after the period are applied to that period (instead of 請求番号 / FIFO).

create or replace function public.period_buyer_amounts(p_period_id uuid)
returns table (participant_id uuid, amount_jpy bigint)
language sql stable security definer set search_path = ''
as $$
  select l.buyer_id, sum(l.amount_jpy)::bigint
  from public.v_settlement_lines l
  join public.trades t on t.id = l.trade_id
  join public.payment_periods p on p.id = p_period_id
  where t.business_date between p.start_date and p.end_date
  group by l.buyer_id;
$$;

-- SC-09-03 rows: payable, paid (on time / total), 完納 (no grace: paid on or before 期日).
create or replace function public.period_payables(p_period_id uuid)
returns table (participant_id uuid, buyer_no text, name text, payable_jpy bigint,
               paid_on_time_jpy bigint, paid_total_jpy bigint, kanno boolean)
language sql stable security definer set search_path = ''
as $$
  with p as (select * from public.payment_periods where id = p_period_id),
  amounts as (select * from public.period_buyer_amounts(p_period_id)),
  paid as (
    select x.participant_id,
           sum(x.amount_jpy) filter (where x.paid_on <= p.due_date)::bigint as on_time,
           sum(x.amount_jpy)::bigint as total
    from public.payments x, p
    where x.paid_on > p.end_date and x.paid_on <= (p.end_date + interval '1 month')::date
    group by x.participant_id
  )
  select a.participant_id, pt.buyer_no, pt.name, floor(a.amount_jpy * 110 / 100.0)::bigint,
         coalesce(pd.on_time, 0), coalesce(pd.total, 0),
         coalesce(pd.on_time, 0) >= floor(a.amount_jpy * 110 / 100.0)
  from amounts a
  join public.participants pt on pt.id = a.participant_id
  left join paid pd on pd.participant_id = a.participant_id
  where public.app_role() is not null or auth.uid() is null
  order by pt.buyer_no;
$$;

-- SC-09-01: p_rows = [{ "line": 2, "buyer_no": "N01", "paid_on": "2026-11-05", "amount": 123456 }, ...].
-- Unknown 買受人番号 rows are reported back and not imported; the rest is imported in one batch.
create or replace function public.import_payments(p_file_name text, p_rows jsonb)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_batch uuid; v_row jsonb; v_pid uuid; v_ok int := 0; v_errors jsonb := '[]'::jsonb;
begin
  v_caller := public.assert_caller(array['SETTLE']::public.app_role_code[], array['STL_HEAD']::public.authority_code[]);
  insert into public.payment_import_batches (file_name, row_count, imported_by)
  values (p_file_name, jsonb_array_length(p_rows), v_caller) returning id into v_batch;
  for v_row in select * from jsonb_array_elements(p_rows) loop
    select id into v_pid from public.participants
     where buyer_no = v_row ->> 'buyer_no' and kind in ('NAKAOROSHI', 'BAIBAI');
    if v_pid is null or (v_row ->> 'amount')::bigint <= 0 then
      v_errors := v_errors || jsonb_build_object('line', v_row -> 'line', 'buyer_no', v_row ->> 'buyer_no',
        'reason', case when v_pid is null then '買受人番号が見つかりません' else '金額が不正です' end);
      continue;
    end if;
    insert into public.payments (batch_id, buyer_no, participant_id, paid_on, amount_jpy)
    values (v_batch, v_row ->> 'buyer_no', v_pid, (v_row ->> 'paid_on')::date, (v_row ->> 'amount')::bigint);
    v_ok := v_ok + 1;
  end loop;
  return jsonb_build_object('batch_id', v_batch, 'imported', v_ok, 'errors', v_errors);
end;
$$;

revoke execute on function
  public.period_buyer_amounts(uuid), public.period_payables(uuid), public.import_payments(text, jsonb)
from public, anon, authenticated;
grant execute on function public.period_payables(uuid), public.import_payments(text, jsonb) to authenticated;
