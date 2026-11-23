-- 0005: integrity triggers enforced in the DB, not only in the UI
-- Rule 4 (no overwrite): append-only tables, frozen confirmed trades, locked business days (BR-CLOSE-01)
-- Rule 2 (許可 ≠ 承認): qualification rows must match participant kind
-- Rule 5: rate rows editable only while the rule version is DRAFT

create or replace function public.forbid_update_delete()
returns trigger language plpgsql set search_path = ''
as $$
begin
  raise exception using errcode = 'P0001',
    message = format('APPEND_ONLY: %s does not allow %s', tg_table_name, tg_op);
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'lot_inspections', 'lot_quantity_ledger', 'deliveries', 'trade_adjustments',
    'payment_import_batches', 'payments', 'incentive_runs', 'incentive_results', 'audit_logs'
  ] loop
    execute format(
      'create trigger %I before update or delete on public.%I
         for each row execute function public.forbid_update_delete()',
      t || '_append_only', t);
  end loop;
end $$;

create trigger trades_no_delete before delete on public.trades
  for each row execute function public.forbid_update_delete();

-- Writes on a row whose business_date is not an OPEN day are rejected with DAY_LOCKED (→ HTTP 423).
create or replace function public.enforce_open_business_day()
returns trigger language plpgsql set search_path = ''
as $$
declare
  v_day date;
  v_status public.day_status;
begin
  if tg_op = 'UPDATE' then
    v_day := (to_jsonb(old) ->> 'business_date')::date;
    select d.status into v_status from public.business_days d where d.business_date = v_day;
    if v_status is distinct from 'OPEN' then
      raise exception using errcode = 'P0001', message = format('DAY_LOCKED: %s', v_day);
    end if;
  end if;
  v_day := (to_jsonb(new) ->> 'business_date')::date;
  select d.status into v_status from public.business_days d where d.business_date = v_day;
  if v_status is distinct from 'OPEN' then
    raise exception using errcode = 'P0001', message = format('DAY_LOCKED: %s', v_day);
  end if;
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'lots', 'lot_inspections', 'lot_quantity_ledger', 'trades', 'deliveries', 'trade_adjustments'
  ] loop
    execute format(
      'create trigger %I before insert or update on public.%I
         for each row execute function public.enforce_open_business_day()',
      t || '_open_day_only', t);
  end loop;
end $$;

-- Once CONFIRMED, a trade's commercial columns never change; corrections go through CORR (m6).
create or replace function public.freeze_confirmed_trade()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if old.status = 'CONFIRMED' and (
       new.qty, new.unit_price_jpy, new.amount_jpy, new.buyer_id, new.lot_id,
       new.channel, new.business_date, new.status
     ) is distinct from (
       old.qty, old.unit_price_jpy, old.amount_jpy, old.buyer_id, old.lot_id,
       old.channel, old.business_date, old.status
     ) then
    raise exception using errcode = 'P0001',
      message = format('TRADE_FROZEN: trade %s is confirmed; use a correction request', old.trade_no);
  end if;
  return new;
end;
$$;

create trigger trades_freeze_confirmed before update on public.trades
  for each row execute function public.freeze_confirmed_trade();

-- 許可 only for 仲卸, 承認 only for 売買参加者 (TG_ARGV[0] = required kind).
create or replace function public.enforce_qualification_kind()
returns trigger language plpgsql set search_path = ''
as $$
declare v_kind public.participant_kind;
begin
  select p.kind into v_kind from public.participants p where p.id = new.participant_id;
  if v_kind is distinct from tg_argv[0]::public.participant_kind then
    raise exception using errcode = 'P0001',
      message = format('QUALIFICATION_KIND_MISMATCH: %s requires %s', tg_table_name, tg_argv[0]);
  end if;
  return new;
end;
$$;

create trigger nakaoroshi_permits_kind before insert or update on public.nakaoroshi_permits
  for each row execute function public.enforce_qualification_kind('NAKAOROSHI');
create trigger baibai_approvals_kind before insert or update on public.baibai_approvals
  for each row execute function public.enforce_qualification_kind('BAIBAI');

create or replace function public.lock_rate_rows_unless_draft()
returns trigger language plpgsql set search_path = ''
as $$
declare
  v_version uuid;
  v_status public.rule_status;
begin
  -- NEW is NULL for DELETE, OLD is NULL for INSERT: branch explicitly instead of one expression.
  if tg_op = 'DELETE' then
    v_version := old.rule_version_id;
  else
    v_version := new.rule_version_id;
  end if;
  select v.status into v_status from public.rule_versions v where v.id = v_version;
  if v_status is distinct from 'DRAFT' then
    raise exception using errcode = 'P0001',
      message = 'RATE_LOCKED: rate rows can change only while the version is DRAFT';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger incentive_rate_rows_draft_only before insert or update or delete
  on public.incentive_rate_rows
  for each row execute function public.lock_rate_rows_unless_draft();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'participants', 'lots', 'trades', 'correction_requests', 'rule_versions'
  ] loop
    execute format(
      'create trigger %I before update on public.%I
         for each row execute function public.touch_updated_at()',
      t || '_touch_updated_at', t);
  end loop;
end $$;
