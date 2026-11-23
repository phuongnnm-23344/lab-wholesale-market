-- 0018 (phase 06): deliveries (SC-06-02) and day close (SC-07-02).
-- FR-DEL-01/02/05, BR-DEL-03: several partial deliveries, complete when delivered = effective qty.
-- BR-CLOSE-01: close is final — there is NO unlock function; later changes go through CORR (phase 07).

-- Delivery recorded on the current open day. p_all_remaining = 「残り全部」.
create or replace function public.record_delivery(p_trade_id uuid, p_qty numeric, p_all_remaining boolean)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_status public.trade_status; v_effective numeric; v_delivered numeric; v_qty numeric;
begin
  v_caller := public.assert_caller(array['DELIVERY']::public.app_role_code[], array['DEL_HEAD']::public.authority_code[]);
  select status into v_status from public.trades where id = p_trade_id for update;
  if v_status is distinct from 'CONFIRMED' then
    raise exception using errcode = 'P0001', message = 'CONFLICT: trade is not confirmed';
  end if;
  select e.effective_qty into v_effective from public.v_trade_effective e where e.trade_id = p_trade_id;
  select coalesce(sum(qty_delivered), 0) into v_delivered from public.deliveries where trade_id = p_trade_id;
  v_qty := case when p_all_remaining then v_effective - v_delivered else p_qty end;
  if v_qty is null or v_qty <= 0 then
    raise exception using errcode = 'P0001', message = 'VALIDATION: nothing left to deliver';
  end if;
  if v_delivered + v_qty > v_effective then
    raise exception using errcode = 'P0001',
      message = format('OVER_DELIVERY: remaining %s', v_effective - v_delivered);
  end if;
  insert into public.deliveries (trade_id, business_date, qty_delivered, recorded_by)
  values (p_trade_id, public.current_business_date(), v_qty, v_caller);
  return jsonb_build_object('delivered', v_delivered + v_qty, 'effective', v_effective,
                            'complete', v_delivered + v_qty = v_effective);
end;
$$;

-- Checklist shown before closing (also enforced inside close_business_day).
create or replace function public.day_close_checklist(p_day date)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select case when public.app_role() is null then null else jsonb_build_object(
    'business_date', p_day,
    'seri_unconfirmed', (select count(*) from public.seri_sessions where business_date = p_day and status = 'ENTERING'),
    'seri_same_person', (select count(*) from public.seri_sessions where business_date = p_day and same_person_reason is not null),
    'provisional_lots', (select count(*) from public.lots where business_date = p_day and status = 'PROVISIONAL'),
    'undelivered_trades', (select count(*) from public.v_delivery_status d
                           join public.trades t on t.id = d.trade_id
                           where t.business_date = p_day and not d.is_complete)
  ) end;
$$;

-- 日次締め by 照合部門長 only. Blocks while せり results are unconfirmed; opens the next day.
create or replace function public.close_business_day(p_day date)
returns date language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_status public.day_status; v_pending integer;
begin
  v_caller := public.assert_caller(array[]::public.app_role_code[], array['STL_HEAD']::public.authority_code[]);
  select status into v_status from public.business_days where business_date = p_day for update;
  if v_status is distinct from 'OPEN' then
    raise exception using errcode = 'P0001', message = format('CONFLICT: %s is not an open business day', p_day);
  end if;
  select count(*) into v_pending from public.seri_sessions where business_date = p_day and status = 'ENTERING';
  if v_pending > 0 then
    raise exception using errcode = 'P0001', message = format('CONFLICT: %s unconfirmed せり session(s)', v_pending);
  end if;
  update public.business_days set status = 'LOCKED', locked_by = v_caller, locked_at = now() where business_date = p_day;
  insert into public.business_days (business_date, status) values (p_day + 1, 'OPEN')
  on conflict (business_date) do nothing;
  return p_day + 1;
end;
$$;

revoke execute on function
  public.record_delivery(uuid, numeric, boolean), public.day_close_checklist(date), public.close_business_day(date)
from public, anon, authenticated;
grant execute on function
  public.record_delivery(uuid, numeric, boolean), public.day_close_checklist(date), public.close_business_day(date)
to authenticated;
