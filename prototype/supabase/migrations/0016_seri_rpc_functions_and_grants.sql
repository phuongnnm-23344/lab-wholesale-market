-- 0016 (phase 05): せり — record final results (SC-05-01) and confirm per session by a person (SC-05-02).
-- No live bidding screen: the system only records the final せり results (rule 1 / rule 3).

create or replace function public.create_seri_session()
returns uuid language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_day date := public.current_business_date(); v_id uuid;
begin
  v_caller := public.assert_caller(array['TRADE']::public.app_role_code[], array[]::public.authority_code[]);
  insert into public.seri_sessions (business_date, session_no, status, entered_by)
  values (v_day, (select coalesce(max(session_no), 0) + 1 from public.seri_sessions where business_date = v_day),
          'ENTERING', v_caller)
  returning id into v_id;
  return v_id;
end;
$$;

-- Adds one result row as a PROVISIONAL trade (no ledger movement until the session is confirmed).
create or replace function public.add_seri_result(
  p_session_id uuid, p_lot_id uuid, p_buyer_id uuid, p_qty numeric, p_unit_price_jpy bigint)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_session public.seri_sessions%rowtype; v_pending numeric; v_id uuid;
begin
  v_caller := public.assert_caller(array['TRADE']::public.app_role_code[], array[]::public.authority_code[]);
  select * into v_session from public.seri_sessions where id = p_session_id for update;
  if not found or v_session.status <> 'ENTERING' then
    raise exception using errcode = 'P0001', message = 'CONFLICT: session is not open for entry';
  end if;
  if p_qty <= 0 or p_unit_price_jpy <= 0 then
    raise exception using errcode = 'P0001', message = 'VALIDATION: qty and price must be positive';
  end if;
  select coalesce(sum(qty), 0) into v_pending from public.trades
   where lot_id = p_lot_id and status = 'PROVISIONAL';
  perform public.lock_lot_for_sale(p_lot_id, p_qty + v_pending, v_session.business_date);
  insert into public.trades (trade_no, business_date, lot_id, buyer_id, channel, qty, unit_price_jpy,
    amount_jpy, status, seri_session_id, created_by)
  values (format('T%s-S%s-%s', to_char(v_session.business_date, 'YYYYMMDD'), v_session.session_no,
                 (select count(*) + 1 from public.trades where seri_session_id = p_session_id)),
          v_session.business_date, p_lot_id, p_buyer_id, 'SERI', p_qty, p_unit_price_jpy,
          floor(p_qty * p_unit_price_jpy), 'PROVISIONAL', p_session_id, v_caller)
  returning id into v_id;
  return v_id;
end;
$$;

-- Confirms the whole session: qualification + quantity checked at this moment (BR-PERM-01),
-- then every result becomes CONFIRMED and is booked on the ledger. Same person → reason required (S2).
create or replace function public.confirm_seri_session(p_session_id uuid, p_same_person_reason text)
returns integer language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_session public.seri_sessions%rowtype; v_trade public.trades%rowtype;
  v_available numeric; v_count integer := 0;
begin
  v_caller := public.assert_caller(array['TRADE']::public.app_role_code[], array[]::public.authority_code[]);
  select * into v_session from public.seri_sessions where id = p_session_id for update;
  if not found or v_session.status <> 'ENTERING' then
    raise exception using errcode = 'P0001', message = 'CONFLICT: session is not waiting for confirmation';
  end if;
  if v_session.entered_by = v_caller and coalesce(btrim(p_same_person_reason), '') = '' then
    raise exception using errcode = 'P0001', message = 'SAME_PERSON_REASON_REQUIRED: entry person cannot confirm without a reason';
  end if;
  for v_trade in select * from public.trades where seri_session_id = p_session_id and status = 'PROVISIONAL'
                 order by trade_no loop
    v_available := public.lock_lot_for_sale(v_trade.lot_id, v_trade.qty, v_session.business_date);
    -- せり results have no reason field: an over-limit result is accepted and flagged for review.
    perform public.check_buyer_qualification(v_trade.buyer_id, v_session.business_date, v_trade.amount_jpy,
                                             'せり結果（参加上限超過・確認者確定）');
    update public.trades set status = 'CONFIRMED', confirmed_by = v_caller, confirmed_at = now()
     where id = v_trade.id;
    perform public.book_trade_on_ledger(v_trade.id, v_trade.lot_id, v_trade.qty, v_available,
                                        v_session.business_date, v_caller);
    v_count := v_count + 1;
  end loop;
  if v_count = 0 then
    raise exception using errcode = 'P0001', message = 'VALIDATION: session has no results';
  end if;
  update public.seri_sessions
     set status = 'CONFIRMED', confirmed_by = v_caller, confirmed_at = now(),
         same_person_reason = case when v_session.entered_by = v_caller then p_same_person_reason end
   where id = p_session_id;
  return v_count;
end;
$$;

revoke execute on function
  public.check_buyer_qualification(uuid, date, bigint, text),
  public.lock_lot_for_sale(uuid, numeric, date),
  public.book_trade_on_ledger(uuid, uuid, numeric, numeric, date, uuid),
  public.confirm_aitai_trade(uuid, uuid, numeric, bigint, text),
  public.create_seri_session(),
  public.add_seri_result(uuid, uuid, uuid, numeric, bigint),
  public.confirm_seri_session(uuid, text)
from public, anon, authenticated;
grant execute on function
  public.confirm_aitai_trade(uuid, uuid, numeric, bigint, text),
  public.create_seri_session(),
  public.add_seri_result(uuid, uuid, uuid, numeric, bigint),
  public.confirm_seri_session(uuid, text)
to authenticated;
