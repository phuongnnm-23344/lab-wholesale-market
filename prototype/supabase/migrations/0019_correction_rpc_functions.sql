-- 0019 (phase 07): 修正申請 (FORM-CORR-01) → 1 or 2 approvals → REVERSE + DELTA rows (rule 4).
-- The original trade is never updated. REVERSE carries the OLD buyer/price, DELTA the NEW (M4).
-- S3: requester never approves; level 1 = 照合部門長, level 2 = 運用部門長, one person never both.
-- 2 levels when |amount change| >= 300,000 JPY (fictional sample threshold, mock M13).

create or replace function public.submit_correction(
  p_trade_id uuid, p_new_qty numeric, p_new_unit_price_jpy bigint, p_new_buyer_id uuid, p_reason text)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_eff public.v_trade_effective%rowtype; v_id uuid;
begin
  v_caller := public.assert_caller(array['TRADE', 'DELIVERY', 'SETTLE']::public.app_role_code[], array['STL_HEAD']::public.authority_code[]);
  select * into v_eff from public.v_trade_effective where trade_id = p_trade_id;
  if not found or v_eff.status <> 'CONFIRMED' then
    raise exception using errcode = 'P0001', message = 'CONFLICT: only confirmed trades can be corrected';
  end if;
  if coalesce(btrim(p_reason), '') = '' or p_new_qty <= 0 or p_new_unit_price_jpy <= 0 then
    raise exception using errcode = 'P0001', message = 'VALIDATION: reason, qty and price are required';
  end if;
  if p_new_qty = v_eff.effective_qty and p_new_unit_price_jpy = v_eff.effective_unit_price_jpy
     and p_new_buyer_id = v_eff.effective_buyer_id then
    raise exception using errcode = 'P0001', message = 'VALIDATION: nothing changes';
  end if;
  if exists (select 1 from public.correction_requests where target_trade_id = p_trade_id
             and status in ('SUBMITTED', 'FIRST_APPROVED')) then
    raise exception using errcode = 'P0001', message = 'CONFLICT: a correction for this trade is already pending';
  end if;
  insert into public.correction_requests (target_trade_id, change, reason, status, requested_by)
  values (p_trade_id, jsonb_build_object(
            'before', jsonb_build_object('qty', v_eff.effective_qty, 'unit_price_jpy', v_eff.effective_unit_price_jpy,
                                         'buyer_id', v_eff.effective_buyer_id, 'amount_jpy', v_eff.effective_amount_jpy),
            'after', jsonb_build_object('qty', p_new_qty, 'unit_price_jpy', p_new_unit_price_jpy,
                                        'buyer_id', p_new_buyer_id, 'amount_jpy', floor(p_new_qty * p_new_unit_price_jpy))),
          p_reason, 'SUBMITTED', v_caller)
  returning id into v_id;
  return v_id;
end;
$$;

-- Writes REVERSE + DELTA on the current open day and returns / takes back lot quantity.
create or replace function public.apply_correction(p_request public.correction_requests)
returns void language plpgsql security definer set search_path = ''
as $$
declare v_eff public.v_trade_effective%rowtype; v_day date := public.current_business_date();
  v_after jsonb := p_request.change -> 'after'; v_new_qty numeric; v_price bigint; v_buyer uuid; v_available numeric;
begin
  select * into v_eff from public.v_trade_effective where trade_id = p_request.target_trade_id;
  v_new_qty := (v_after ->> 'qty')::numeric;
  v_price := (v_after ->> 'unit_price_jpy')::bigint;
  v_buyer := (v_after ->> 'buyer_id')::uuid;
  -- New buyer must hold a valid 許可 / 承認 now (BR-PERM-01); the correction reason covers 参加上限.
  perform public.check_buyer_qualification(v_buyer, v_day, floor(v_new_qty * v_price)::bigint, p_request.reason);
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

create or replace function public.approve_correction(p_id uuid)
returns text language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid := auth.uid(); v_req public.correction_requests%rowtype; v_levels integer;
begin
  select * into v_req from public.correction_requests where id = p_id for update;
  if not found or v_req.status not in ('SUBMITTED', 'FIRST_APPROVED') then
    raise exception using errcode = 'P0001', message = 'CONFLICT: correction is not waiting for approval';
  end if;
  if v_req.requested_by = v_caller then
    raise exception using errcode = 'P0001', message = 'FORBIDDEN: requester cannot approve own correction';
  end if;
  v_levels := case when abs((v_req.change #>> '{after,amount_jpy}')::bigint - (v_req.change #>> '{before,amount_jpy}')::bigint) >= 300000 then 2 else 1 end;
  if v_req.status = 'SUBMITTED' then
    perform public.assert_caller(array[]::public.app_role_code[], array['STL_HEAD']::public.authority_code[]);
    if v_levels = 2 then
      update public.correction_requests set status = 'FIRST_APPROVED', approver1 = v_caller where id = p_id;
      return 'FIRST_APPROVED';
    end if;
    update public.correction_requests set approver1 = v_caller where id = p_id;
  else
    perform public.assert_caller(array[]::public.app_role_code[], array['OPS_HEAD']::public.authority_code[]);
    if v_req.approver1 = v_caller then
      raise exception using errcode = 'P0001', message = 'FORBIDDEN: the same person cannot approve both levels';
    end if;
    update public.correction_requests set approver2 = v_caller where id = p_id;
  end if;
  select * into v_req from public.correction_requests where id = p_id;
  perform public.apply_correction(v_req);
  update public.correction_requests set status = 'APPROVED' where id = p_id;
  return 'APPROVED';
end;
$$;

create or replace function public.reject_correction(p_id uuid, p_reason text)
returns void language plpgsql security definer set search_path = ''
as $$
declare v_req public.correction_requests%rowtype;
begin
  perform public.assert_caller(array[]::public.app_role_code[], array['STL_HEAD', 'OPS_HEAD']::public.authority_code[]);
  if coalesce(btrim(p_reason), '') = '' then
    raise exception using errcode = 'P0001', message = 'VALIDATION: reject reason is required';
  end if;
  select * into v_req from public.correction_requests where id = p_id for update;
  if not found or v_req.status not in ('SUBMITTED', 'FIRST_APPROVED') then
    raise exception using errcode = 'P0001', message = 'CONFLICT: correction is not waiting for approval';
  end if;
  if v_req.requested_by = auth.uid() then
    raise exception using errcode = 'P0001', message = 'FORBIDDEN: requester cannot reject own correction';
  end if;
  update public.correction_requests set status = 'REJECTED', reject_reason = p_reason where id = p_id;
end;
$$;

revoke execute on function
  public.submit_correction(uuid, numeric, bigint, uuid, text), public.apply_correction(public.correction_requests),
  public.approve_correction(uuid), public.reject_correction(uuid, text)
from public, anon, authenticated;
grant execute on function
  public.submit_correction(uuid, numeric, bigint, uuid, text), public.approve_correction(uuid), public.reject_correction(uuid, text)
to authenticated;
