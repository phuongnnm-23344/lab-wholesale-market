-- 0006: generic audit trigger (FR-AUDIT-01). security definer: audit_logs has no write policy (M1).
-- Skipped only while the demo seed function runs (app.seeding = 'on', transaction-local).
-- profile_pins is deliberately not audited row-by-row (hash must never be copied anywhere).

create or replace function public.write_audit_log()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  v_old jsonb := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end;
  v_new jsonb := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end;
  v_row jsonb := coalesce(v_new, v_old);
begin
  if coalesce(current_setting('app.seeding', true), '') = 'on' then
    return null;
  end if;
  insert into public.audit_logs (actor_id, action, table_name, record_id, before, after, business_date)
  values (
    auth.uid(),
    tg_op,
    tg_table_name,
    coalesce(v_row ->> 'id', v_row ->> 'user_id', v_row ->> 'business_date'),
    v_old,
    v_new,
    coalesce((v_row ->> 'business_date')::date, public.current_business_date())
  );
  return null;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'user_authorities', 'participants', 'nakaoroshi_permits', 'baibai_approvals',
    'business_days', 'lots', 'lot_inspections', 'lot_quantity_ledger', 'seri_sessions', 'trades',
    'deliveries', 'correction_requests', 'trade_adjustments', 'payment_periods',
    'payment_import_batches', 'payments', 'rule_versions', 'incentive_rate_rows',
    'incentive_runs', 'incentive_results'
  ] loop
    execute format(
      'create trigger %I after insert or update or delete on public.%I
         for each row execute function public.write_audit_log()',
      t || '_audit', t);
  end loop;
end $$;
