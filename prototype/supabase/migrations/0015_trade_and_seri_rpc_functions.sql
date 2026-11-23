-- 0015 (phase 05): 相対取引 (main flow, rule 1) and せり result recording / confirmation.
-- BR-PERM-01: qualification checked AT CONFIRMATION TIME — 許可 for 仲卸, 承認 for 売買参加者, with
-- different error codes (rule 2). BR-LOT-02: available qty never negative (lot row locked FOR UPDATE).
-- FR-SERI-02 / S2: entry person ≠ confirmer by default; same person needs a reason (CAP-HUMAN-01).

-- Raises PERMIT_INVALID / APPROVAL_INVALID / BUYER_NOT_ALLOWED / OVER_LIMIT_REASON_REQUIRED.
-- 参加上限 (prototype assumption): total confirmed amount of the buyer on the business day.
create or replace function public.check_buyer_qualification(
  p_buyer_id uuid, p_day date, p_amount bigint, p_over_limit_reason text)
returns boolean language plpgsql stable security definer set search_path = ''
as $$
declare v_buyer public.participants%rowtype; v_limit bigint; v_used bigint;
begin
  select * into v_buyer from public.participants where id = p_buyer_id;
  if not found or v_buyer.status <> 'ACTIVE' or v_buyer.kind not in ('NAKAOROSHI', 'BAIBAI') then
    raise exception using errcode = 'P0001', message = 'BUYER_NOT_ALLOWED: buyer must be an active 仲卸 or 売買参加者';
  end if;
  if v_buyer.kind = 'NAKAOROSHI' then
    if not exists (select 1 from public.nakaoroshi_permits where participant_id = p_buyer_id
                   and status = 'ACTIVE' and p_day between valid_from and valid_to) then
      raise exception using errcode = 'P0001', message = format('PERMIT_INVALID: %s', v_buyer.buyer_no);
    end if;
    return false;
  end if;
  select participation_limit_jpy into v_limit from public.baibai_approvals
   where participant_id = p_buyer_id and status = 'ACTIVE' and p_day between valid_from and valid_to;
  if v_limit is null then
    raise exception using errcode = 'P0001', message = format('APPROVAL_INVALID: %s', v_buyer.buyer_no);
  end if;
  select coalesce(sum(amount_jpy), 0) into v_used from public.trades
   where buyer_id = p_buyer_id and business_date = p_day and status = 'CONFIRMED';
  if v_used + p_amount > v_limit then
    if coalesce(btrim(p_over_limit_reason), '') = '' then
      raise exception using errcode = 'P0001',
        message = format('OVER_LIMIT_REASON_REQUIRED: limit %s, after this trade %s', v_limit, v_used + p_amount);
    end if;
    return true;
  end if;
  return false;
end;
$$;

-- Locks the lot, checks it is on sale today and has enough quantity; returns available qty.
create or replace function public.lock_lot_for_sale(p_lot_id uuid, p_qty numeric, p_day date)
returns numeric language plpgsql security definer set search_path = ''
as $$
declare v_lot public.lots%rowtype; v_available numeric;
begin
  select * into v_lot from public.lots where id = p_lot_id for update;
  if not found then
    raise exception using errcode = 'P0001', message = 'NOT_FOUND: lot';
  end if;
  if v_lot.status <> 'PUBLISHED' or v_lot.business_date <> p_day then
    raise exception using errcode = 'P0001', message = format('CONFLICT: lot %s is not on sale today', v_lot.lot_no);
  end if;
  select coalesce(sum(qty_delta), 0) into v_available from public.lot_quantity_ledger where lot_id = p_lot_id;
  if p_qty > v_available then
    raise exception using errcode = 'P0001', message = format('INSUFFICIENT_QTY: available %s', v_available);
  end if;
  return v_available;
end;
$$;

-- Writes the sale to the ledger and marks the lot SOLD_OUT when nothing is left.
create or replace function public.book_trade_on_ledger(p_trade_id uuid, p_lot_id uuid, p_qty numeric,
  p_available numeric, p_day date, p_actor uuid)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.lot_quantity_ledger (lot_id, business_date, qty_delta, reason, ref_trade_id, created_by)
  values (p_lot_id, p_day, -p_qty, '販売', p_trade_id, p_actor);
  if p_available - p_qty = 0 then
    update public.lots set status = 'SOLD_OUT' where id = p_lot_id;
  end if;
end;
$$;

-- SC-04-01 相対取引入力・確定 (main screen). One call = check + confirm atomically.
create or replace function public.confirm_aitai_trade(
  p_lot_id uuid, p_buyer_id uuid, p_qty numeric, p_unit_price_jpy bigint, p_over_limit_reason text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_day date := public.current_business_date(); v_available numeric;
  v_amount bigint := floor(p_qty * p_unit_price_jpy); v_over boolean; v_id uuid; v_no text;
begin
  v_caller := public.assert_caller(array['TRADE']::public.app_role_code[], array[]::public.authority_code[]);
  if p_qty <= 0 or p_unit_price_jpy <= 0 then
    raise exception using errcode = 'P0001', message = 'VALIDATION: qty and price must be positive';
  end if;
  v_available := public.lock_lot_for_sale(p_lot_id, p_qty, v_day);
  v_over := public.check_buyer_qualification(p_buyer_id, v_day, v_amount, p_over_limit_reason);
  v_no := format('T%s-A%s', to_char(v_day, 'YYYYMMDD'),
                 (select count(*) + 1 from public.trades where business_date = v_day));
  insert into public.trades (trade_no, business_date, lot_id, buyer_id, channel, qty, unit_price_jpy,
    amount_jpy, status, over_limit_reason, created_by, confirmed_by, confirmed_at)
  values (v_no, v_day, p_lot_id, p_buyer_id, 'AITAI', p_qty, p_unit_price_jpy, v_amount, 'CONFIRMED',
    case when v_over then p_over_limit_reason end, v_caller, v_caller, now())
  returning id into v_id;
  perform public.book_trade_on_ledger(v_id, p_lot_id, p_qty, v_available, v_day, v_caller);
  return jsonb_build_object('trade_id', v_id, 'trade_no', v_no, 'amount_jpy', v_amount, 'over_limit', v_over);
end;
$$;
