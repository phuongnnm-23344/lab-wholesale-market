-- 0007: RLS + grants. Security model (Expert M1/M2, n1, n2):
--   * RLS on every table; ONLY select policies exist. No insert/update/delete policy for anyone.
--   * anon gets nothing. authenticated gets SELECT only; every write goes through
--     security definer RPC functions (phase 03+) that check role/authority inside.
--   * Every select policy requires public.app_role() is not null (active profile, not banned).
--   * profile_pins: no grant, no policy → unreadable through the API (n2).
--   * Read access is simplified vs role-list 閲 columns (mock M18); write access is in RPCs.

do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
grant select on all tables in schema public to authenticated;   -- includes views
revoke select on public.profile_pins from authenticated;

-- New objects created later must not be opened by default.
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

-- Profiles / authorities: own row, or SYSADM sees all.
create policy profiles_select on public.profiles for select to authenticated
  using (user_id = auth.uid() or public.app_role() = 'SYSADM');
create policy user_authorities_select on public.user_authorities for select to authenticated
  using (user_id = auth.uid() or public.app_role() = 'SYSADM');

-- Audit log: 照合事務局, 照合部門長, システム管理者 only (role-list P39).
create policy audit_logs_select on public.audit_logs for select to authenticated
  using (public.app_role() in ('SETTLE', 'SYSADM') or public.has_authority('STL_HEAD'));

-- Business data: any active internal user (simplified read, M18).
do $$
declare t text;
begin
  foreach t in array array[
    'participants', 'nakaoroshi_permits', 'baibai_approvals', 'business_days', 'lots',
    'lot_inspections', 'lot_quantity_ledger', 'seri_sessions', 'trades', 'deliveries',
    'correction_requests', 'trade_adjustments', 'payment_periods', 'payment_import_batches',
    'payments', 'rule_versions', 'incentive_rate_rows', 'incentive_runs', 'incentive_results'
  ] loop
    execute format(
      'create policy %I on public.%I for select to authenticated
         using (public.app_role() is not null)',
      t || '_select_internal', t);
  end loop;
end $$;

-- Functions: nothing callable by default; helpers used inside policies / by the app shell
-- must be executable by authenticated, otherwise every SELECT fails with 42501 (n1).
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function
  public.app_role(),
  public.has_authority(public.authority_code),
  public.current_business_date(),
  public.active_rule_version_on(date),
  public.get_my_profile()
to authenticated;
