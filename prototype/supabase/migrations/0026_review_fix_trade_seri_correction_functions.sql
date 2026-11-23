-- 0026 — code review fixes in trade / せり / correction RPCs (bodies otherwise as in 0015–0019).
-- W2  qty must have ≤ 2 decimals (checked up-front, clear error before any write).
-- W4  trade_no / session_no from per-day counters (0025) instead of count(*)+1.
-- W12 add_seri_result locks the lot BEFORE summing pending せり qty; confirm locks lots in lot_id order.
-- W3  apply_correction: new buyer's 参加上限 checked without a free-pass reason, own trade excluded.
-- W11 a correction cannot reduce qty below what was already delivered.
-- S7  approve_correction checks the approver role before reading / locking the request.

create or replace function public.assert_two_decimals(p_qty numeric)
returns void language plpgsql immutable set search_path = ''
as $$
begin
  if p_qty is null or p_qty <= 0 or p_qty <> round(p_qty, 2) then
    raise exception using errcode = 'P0001', message = 'VALIDATION: quantity must be positive with at most 2 decimal places';
  end if;
end;
$$;

create or replace function public.confirm_aitai_trade(
  p_lot_id uuid, p_buyer_id uuid, p_qty numeric, p_unit_price_jpy bigint, p_over_limit_reason text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_day date := public.current_business_date(); v_available numeric;
  v_amount bigint := floor(p_qty * p_unit_price_jpy); v_over boolean; v_id uuid; v_no text;
begin
  v_caller := public.assert_caller(array['TRADE']::public.app_role_code[], array[]::public.authority_code[]);
  perform public.assert_two_decimals(p_qty);
  if p_unit_price_jpy <= 0 then
    raise exception using errcode = 'P0001', message = 'VALIDATION: price must be positive';
  end if;
  v_available := public.lock_lot_for_sale(p_lot_id, p_qty, v_day);
  v_over := public.check_buyer_qualification(p_buyer_id, v_day, v_amount, p_over_limit_reason);
  v_no := format('T%s-A%s', to_char(v_day, 'YYYYMMDD'), public.next_day_counter(v_day, 'AITAI',
            (select count(*)::int from public.trades where business_date = v_day)));
  insert into public.trades (trade_no, business_date, lot_id, buyer_id, channel, qty, unit_price_jpy,
    amount_jpy, status, over_limit_reason, created_by, confirmed_by, confirmed_at)
  values (v_no, v_day, p_lot_id, p_buyer_id, 'AITAI', p_qty, p_unit_price_jpy, v_amount, 'CONFIRMED',
    case when v_over then p_over_limit_reason end, v_caller, v_caller, now())
  returning id into v_id;
  perform public.book_trade_on_ledger(v_id, p_lot_id, p_qty, v_available, v_day, v_caller);
  return jsonb_build_object('trade_id', v_id, 'trade_no', v_no, 'amount_jpy', v_amount, 'over_limit', v_over);
end;
$$;

create or replace function public.create_seri_session()
returns uuid language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_day date := public.current_business_date(); v_id uuid;
begin
  v_caller := public.assert_caller(array['TRADE']::public.app_role_code[], array[]::public.authority_code[]);
  insert into public.seri_sessions (business_date, session_no, status, entered_by)
  values (v_day, public.next_day_counter(v_day, 'SERI',
            (select coalesce(max(session_no), 0) from public.seri_sessions where business_date = v_day)),
          'ENTERING', v_caller)
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.add_seri_result(
  p_session_id uuid, p_lot_id uuid, p_buyer_id uuid, p_qty numeric, p_unit_price_jpy bigint)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_session public.seri_sessions%rowtype; v_pending numeric; v_id uuid;
begin
  v_caller := public.assert_caller(array['TRADE']::public.app_role_code[], array[]::public.authority_code[]);
  perform public.assert_two_decimals(p_qty);
  select * into v_session from public.seri_sessions where id = p_session_id for update;
  if not found or v_session.status <> 'ENTERING' then
    raise exception using errcode = 'P0001', message = 'CONFLICT: session is not open for entry';
  end if;
  if p_unit_price_jpy <= 0 then
    raise exception using errcode = 'P0001', message = 'VALIDATION: price must be positive';
  end if;
  perform 1 from public.lots where id = p_lot_id for update;   -- W12: lock before reading pending qty
  select coalesce(sum(qty), 0) into v_pending from public.trades where lot_id = p_lot_id and status = 'PROVISIONAL';
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

-- W11 + W3 + rule 4: corrections apply REVERSE + DELTA; never below the delivered qty.
create or replace function public.apply_correction(p_request public.correction_requests)
returns void language plpgsql security definer set search_path = ''
as $$
declare v_eff public.v_trade_effective%rowtype; v_day date := public.current_business_date();
  v_after jsonb := p_request.change -> 'after'; v_new_qty numeric; v_price bigint; v_buyer uuid;
  v_available numeric; v_delivered numeric;
begin
  select * into v_eff from public.v_trade_effective where trade_id = p_request.target_trade_id;
  v_new_qty := (v_after ->> 'qty')::numeric;
  v_price := (v_after ->> 'unit_price_jpy')::bigint;
  v_buyer := (v_after ->> 'buyer_id')::uuid;
  perform public.assert_two_decimals(v_new_qty);
  select coalesce(sum(qty_delivered), 0) into v_delivered from public.deliveries where trade_id = v_eff.trade_id;
  if v_new_qty < v_delivered then
    raise exception using errcode = 'P0001', message = format('CONFLICT: %s already delivered', v_delivered);
  end if;
  perform public.check_buyer_qualification(v_buyer, v_day, floor(v_new_qty * v_price)::bigint, '', v_eff.trade_id);
  if v_new_qty > v_eff.effective_qty then
    perform 1 from public.lots where id = v_eff.lot_id for update;
    select coalesce(sum(qty_delta), 0) into v_available from public.lot_quantity_ledger where lot_id = v_eff.lot_id;
    if v_new_qty - v_eff.effective_qty > v_available then
      raise exception using errcode = 'P0001', message = format('INSUFFICIENT_QTY: available %s', v_available);
    end if;
  end if;
  insert into public.trade_adjustments (correction_id, trade_id, kind, buyer_id, unit_price_jpy, qty_delta, amount_delta_jpy, business_date)
  values (p_request.id, v_eff.trade_id, 'REVERSE', v_eff.effective_buyer_id, v_eff.effective_unit_price_jpy,
          -v_eff.effective_qty, -v_eff.effective_amount_jpy, v_day),
         (p_request.id, v_eff.trade_id, 'DELTA', v_buyer, v_price, v_new_qty, floor(v_new_qty * v_price)::bigint, v_day);
  if v_new_qty <> v_eff.effective_qty then
    insert into public.lot_quantity_ledger (lot_id, business_date, qty_delta, reason, ref_trade_id, created_by)
    values (v_eff.lot_id, v_day, v_eff.effective_qty - v_new_qty, '修正申請による数量訂正', v_eff.trade_id, auth.uid());
  end if;
end;
$$;

revoke execute on function public.assert_two_decimals(numeric), public.apply_correction(public.correction_requests)
  from public, anon, authenticated;
