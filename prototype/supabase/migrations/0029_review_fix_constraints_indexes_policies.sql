-- 0029 — code review fixes W5, W11, W14 + demo reset covering the new tables.
-- W5  one rule for 買受人番号: ^[A-Z0-9]{1,10}$, mandatory for 仲卸 / 売買参加者 (CSV, delivery search and
--     registration now agree; upper-case only, so the unique constraint cannot be bypassed by case).
-- W11 at most one pending correction per trade (partial unique index; parallel submits → 23505 → 409).
-- W14 missing indexes; select policies evaluate app_role() once per query ((select …) = InitPlan).

alter table public.participants
  add constraint participants_buyer_no_format check (buyer_no is null or buyer_no ~ '^[A-Z0-9]{1,10}$'),
  add constraint participants_buyer_no_required check (kind not in ('NAKAOROSHI', 'BAIBAI') or buyer_no is not null);

create unique index correction_requests_one_pending_per_trade on public.correction_requests (target_trade_id)
  where status in ('SUBMITTED', 'FIRST_APPROVED');

create index if not exists lot_inspections_lot_idx on public.lot_inspections (lot_id);
create index if not exists trades_seri_session_idx on public.trades (seri_session_id);
create index if not exists correction_requests_trade_status_idx on public.correction_requests (target_trade_id, status);
create index if not exists incentive_results_participant_idx on public.incentive_results (participant_id);
create index if not exists payments_paid_on_idx on public.payments (paid_on);

-- Re-create select policies with an InitPlan-friendly helper call (same rules as 0007).
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (user_id = (select auth.uid()) or (select public.app_role()) = 'SYSADM');
drop policy if exists user_authorities_select on public.user_authorities;
create policy user_authorities_select on public.user_authorities for select to authenticated
  using (user_id = (select auth.uid()) or (select public.app_role()) = 'SYSADM');
drop policy if exists audit_logs_select on public.audit_logs;
create policy audit_logs_select on public.audit_logs for select to authenticated
  using ((select public.app_role()) in ('SETTLE', 'SYSADM') or (select public.has_authority('STL_HEAD')));

do $$
declare t text;
begin
  foreach t in array array[
    'participants', 'nakaoroshi_permits', 'baibai_approvals', 'business_days', 'lots',
    'lot_inspections', 'lot_quantity_ledger', 'seri_sessions', 'trades', 'deliveries',
    'correction_requests', 'trade_adjustments', 'payment_periods', 'payment_import_batches',
    'payments', 'rule_versions', 'incentive_rate_rows', 'incentive_runs', 'incentive_results'
  ] loop
    execute format('drop policy if exists %I on public.%I', t || '_select_internal', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using ((select public.app_role()) is not null)',
      t || '_select_internal', t);
  end loop;
end $$;

-- Demo reset now also clears the per-day counters (0025) and payment voids (0024).
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
end;
$$;

revoke execute on function public.reset_demo_business_data() from public, anon, authenticated;
grant execute on function public.reset_demo_business_data() to service_role;
