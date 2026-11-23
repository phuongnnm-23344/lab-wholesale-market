-- 0017: change of 0016 (decision 2026-11-23, user): an せり result over 参加上限 is NO LONGER accepted
-- with a fixed text. The confirmer must type a reason for EACH over-limit result (rule 3, same as 相対
-- and S2); without it the whole confirmation is refused. Assumption awaiting customer confirmation.
-- p_over_limit_reasons: jsonb object { "<trade id>": "<reason>" }.

drop function if exists public.confirm_seri_session(uuid, text);

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
  for v_trade in select * from public.trades where seri_session_id = p_session_id and status = 'PROVISIONAL'
                 order by trade_no loop
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

revoke execute on function public.confirm_seri_session(uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.confirm_seri_session(uuid, text, jsonb) to authenticated;
