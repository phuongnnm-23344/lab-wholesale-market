-- 0027 — code review fixes: deterministic lock order (W12, deadlock 40P01) and S7 (role checked before
-- the request row is read / locked). Bodies otherwise identical to 0014, 0017, 0019.

create or replace function public.confirm_seri_session(
  p_session_id uuid, p_same_person_reason text, p_over_limit_reasons jsonb default '{}'::jsonb)
returns integer language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_session public.seri_sessions%rowtype; v_trade public.trades%rowtype;
  v_available numeric; v_count integer := 0; v_reason text; v_over boolean;
begin
  v_caller := public.assert_caller(array['TRADE']::public.app_role_code[], array[]::public.authority_code[]);
  select * into v_session from public.seri_sessions where id = p_session_id for update;
  if not found or v_session.status <> 'ENTERING' then
    raise exception using errcode = 'P0001', message = 'CONFLICT: session is not waiting for confirmation';
  end if;
  if v_session.entered_by = v_caller and coalesce(btrim(p_same_person_reason), '') = '' then
    raise exception using errcode = 'P0001', message = 'SAME_PERSON_REASON_REQUIRED: entry person cannot confirm without a reason';
  end if;
  -- lock every lot of the session in lot_id order first: two sessions never wait on each other in a cycle
  perform 1 from public.lots where id in (select lot_id from public.trades where seri_session_id = p_session_id)
   order by id for update;
  for v_trade in select * from public.trades where seri_session_id = p_session_id and status = 'PROVISIONAL'
                 order by lot_id, trade_no loop
    v_available := public.lock_lot_for_sale(v_trade.lot_id, v_trade.qty, v_session.business_date);
    v_reason := nullif(btrim(coalesce(p_over_limit_reasons ->> v_trade.id::text, '')), '');
    begin
      v_over := public.check_buyer_qualification(v_trade.buyer_id, v_session.business_date, v_trade.amount_jpy, v_reason);
    exception when raise_exception then
      if sqlerrm like 'OVER_LIMIT_REASON_REQUIRED%' then
        raise exception using errcode = 'P0001',
          message = format('OVER_LIMIT_REASON_REQUIRED: %s (%s)', v_trade.trade_no, substr(sqlerrm, 29));
      end if;
      raise;
    end;
    update public.trades
       set status = 'CONFIRMED', confirmed_by = v_caller, confirmed_at = now(),
           over_limit_reason = case when v_over then v_reason end
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

create or replace function public.record_inspections(p_lot_ids uuid[], p_grade text, p_note text)
returns integer language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_lot public.lots%rowtype; v_count integer := 0;
begin
  v_caller := public.assert_caller(array['JUDGE']::public.app_role_code[], array[]::public.authority_code[]);
  for v_lot in select * from public.lots where id = any (p_lot_ids) order by id for update loop
    if v_lot.status not in ('RECEIVED', 'INSPECTED') then
      raise exception using errcode = 'P0001', message = format('CONFLICT: lot %s is not 受付済', v_lot.lot_no);
    end if;
    insert into public.lot_inspections (lot_id, business_date, grade, freshness_note, inspected_by)
    values (v_lot.id, v_lot.business_date, p_grade, p_note, v_caller);
    if v_lot.status = 'RECEIVED' then
      update public.lots set status = 'INSPECTED' where id = v_lot.id;
    end if;
    v_count := v_count + 1;
  end loop;
  if v_count <> coalesce(array_length(p_lot_ids, 1), 0) then
    raise exception using errcode = 'P0001', message = 'NOT_FOUND: some lots do not exist';
  end if;
  return v_count;
end;
$$;

create or replace function public.approve_correction(p_id uuid)
returns text language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_req public.correction_requests%rowtype; v_levels integer;
begin
  -- S7: only 照合部門長 / 運用部門長 may even read-lock a request
  v_caller := public.assert_caller(array[]::public.app_role_code[], array['STL_HEAD', 'OPS_HEAD']::public.authority_code[]);
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
