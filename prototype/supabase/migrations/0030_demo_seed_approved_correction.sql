-- 0030 (Expert LAB-2 r2): the demo seed now contains one approved 修正申請 so that reviewers see
-- rule 4 (REVERSE + DELTA, original trade untouched) and the audit log without preparing data.
-- The correction goes through the real RPCs (submit_correction → approve_correction ×2) while
-- impersonating the demo accounts trade@ (S1003), stlhead@ (S1007), opshead@ (S1008); audit stays ON
-- for this part, so audit_logs gets INSERT / UPDATE rows with the real actors.
-- Target: yesterday's locked-day trade T{D-1}-3-2 (60 kg, fully delivered; the verify scripts use the
-- "-j-1" trades). Change: buyer → 仲卸 N01 (N02 if already N01), +5,000 JPY/kg → |Δ| = 300,000 → 2 levels.

create or replace function public.seed_demo_approved_correction(p_today date)
returns void language plpgsql security definer set search_path = ''
as $$
declare
  v_trade_user uuid := public.demo_user_id('S1003');
  v_stlhead uuid := public.demo_user_id('S1007');
  v_opshead uuid := public.demo_user_id('S1008');
  v_old_claims text := current_setting('request.jwt.claims', true);
  v_old_sub text := current_setting('request.jwt.claim.sub', true);
  v_day date; v_trade public.trades%rowtype; v_buyer uuid; v_corr uuid;
begin
  if v_trade_user is null or v_stlhead is null or v_opshead is null then
    raise exception 'demo accounts S1003 / S1007 / S1008 missing: run npm run demo:accounts first';
  end if;
  select max(business_date) into v_day from public.business_days where status = 'LOCKED' and business_date < p_today;
  select * into v_trade from public.trades where trade_no = format('T%s-3-2', to_char(v_day, 'YYYYMMDD'));
  if not found then
    raise exception 'seed trade T%-3-2 not found', to_char(v_day, 'YYYYMMDD');
  end if;
  select id into v_buyer from public.participants
   where kind = 'NAKAOROSHI' and buyer_no in ('N01', 'N02') and id <> v_trade.buyer_id
   order by buyer_no limit 1;

  -- 取引担当 submits
  perform set_config('request.jwt.claim.sub', v_trade_user::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_trade_user, 'role', 'authenticated')::text, true);
  v_corr := public.submit_correction(v_trade.id, v_trade.qty, v_trade.unit_price_jpy + 5000, v_buyer,
    'サンプル：買受人の取り違え訂正と単価訂正（デモ用データ）');
  -- 照合部門長 (level 1) then 運用部門長 (level 2)
  perform set_config('request.jwt.claim.sub', v_stlhead::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_stlhead, 'role', 'authenticated')::text, true);
  perform public.approve_correction(v_corr);
  perform set_config('request.jwt.claim.sub', v_opshead::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_opshead, 'role', 'authenticated')::text, true);
  perform public.approve_correction(v_corr);

  perform set_config('request.jwt.claim.sub', coalesce(v_old_sub, ''), true);
  perform set_config('request.jwt.claims', coalesce(v_old_claims, ''), true);
end;
$$;

-- Same as 0029 plus the approved correction, seeded after audit is switched back on.
create or replace function public.reset_demo_business_data()
returns void language plpgsql security definer set search_path = ''
as $$
declare v_today date := (now() at time zone 'Asia/Tokyo')::date;
begin
  perform set_config('app.seeding', 'on', true);
  truncate table
    public.audit_logs, public.incentive_results, public.incentive_runs, public.incentive_rate_rows,
    public.rule_versions, public.payment_batch_voids, public.payments, public.payment_import_batches,
    public.payment_periods, public.trade_adjustments, public.correction_requests, public.deliveries,
    public.lot_quantity_ledger, public.trades, public.seri_sessions, public.lot_inspections,
    public.lots, public.business_days, public.baibai_approvals, public.nakaoroshi_permits,
    public.participants, public.day_counters
    restart identity;
  perform public.seed_demo_master(v_today);
  perform public.seed_demo_rule_versions();
  perform public.seed_demo_trading(v_today);
  perform public.seed_demo_money(v_today);
  perform set_config('app.seeding', 'off', true);
  perform public.seed_demo_approved_correction(v_today);
end;
$$;

revoke execute on function public.seed_demo_approved_correction(date), public.reset_demo_business_data()
  from public, anon, authenticated;
grant execute on function public.reset_demo_business_data() to service_role;
