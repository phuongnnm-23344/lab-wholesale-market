-- 0024 — code review fix C1 (+ W7 for period_payables, S10 row limit).
-- C1: the same 入金 file imported twice doubled the paid amounts (→ wrong 完納 / incentives, unfixable).
--   * each batch stores the SHA-256 of the normalised CSV; a second import of a non-voided identical file
--     → DUPLICATE_FILE (409). Serialised with an advisory lock on the hash (parallel double-click).
--   * a wrong batch is voided by an append-only void record (rule 4: nothing deleted), by a 照合部門長
--     who is NOT the importer; refused when a period covering its payments is already locked.
--   * voided batches are ignored by period_payables (→ 完納, incentives).
-- W7: period_payables now requires 照合事務局 / 照合部門長 (service role keeps access for scripts).

alter table public.payment_import_batches add column file_sha256 text
  check (file_sha256 is null or file_sha256 ~ '^[0-9a-f]{64}$');
create index payment_import_batches_sha_idx on public.payment_import_batches (file_sha256);

create table public.payment_batch_voids (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null unique references public.payment_import_batches (id),
  reason text not null check (char_length(reason) > 0),
  voided_by uuid references public.profiles (user_id),
  created_at timestamptz not null default now()
);
alter table public.payment_batch_voids enable row level security;
revoke all on public.payment_batch_voids from anon, authenticated;
grant select on public.payment_batch_voids to authenticated;
create policy payment_batch_voids_select_internal on public.payment_batch_voids for select to authenticated
  using ((select public.app_role()) is not null);
create trigger payment_batch_voids_append_only before update or delete on public.payment_batch_voids
  for each row execute function public.forbid_update_delete();
create trigger payment_batch_voids_audit after insert on public.payment_batch_voids
  for each row execute function public.write_audit_log();

drop function if exists public.import_payments(text, jsonb);

create or replace function public.import_payments(p_file_name text, p_rows jsonb, p_file_sha256 text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_batch uuid; v_row jsonb; v_pid uuid; v_ok int := 0; v_errors jsonb := '[]'::jsonb;
begin
  v_caller := public.assert_caller(array['SETTLE']::public.app_role_code[], array['STL_HEAD']::public.authority_code[]);
  if p_file_sha256 !~ '^[0-9a-f]{64}$' or jsonb_array_length(p_rows) > 2000 then
    raise exception using errcode = 'P0001', message = 'VALIDATION: file hash or row count is invalid (max 2000 rows)';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('payment_file_' || p_file_sha256, 0));
  if exists (select 1 from public.payment_import_batches b where b.file_sha256 = p_file_sha256
             and not exists (select 1 from public.payment_batch_voids v where v.batch_id = b.id)) then
    raise exception using errcode = 'P0001', message = 'DUPLICATE_FILE: this file has already been imported';
  end if;
  insert into public.payment_import_batches (file_name, row_count, imported_by, file_sha256)
  values (p_file_name, jsonb_array_length(p_rows), v_caller, p_file_sha256) returning id into v_batch;
  for v_row in select * from jsonb_array_elements(p_rows) loop
    select id into v_pid from public.participants
     where buyer_no = v_row ->> 'buyer_no' and kind in ('NAKAOROSHI', 'BAIBAI');
    if v_pid is null or (v_row ->> 'amount')::bigint <= 0 then
      v_errors := v_errors || jsonb_build_object('line', v_row -> 'line', 'buyer_no', v_row ->> 'buyer_no',
        'reason', case when v_pid is null then '買受人番号が見つかりません' else '金額が不正です' end);
      continue;
    end if;
    insert into public.payments (batch_id, buyer_no, participant_id, paid_on, amount_jpy)
    values (v_batch, v_row ->> 'buyer_no', v_pid, (v_row ->> 'paid_on')::date, (v_row ->> 'amount')::bigint);
    v_ok := v_ok + 1;
  end loop;
  return jsonb_build_object('batch_id', v_batch, 'imported', v_ok, 'errors', v_errors);
end;
$$;

create or replace function public.void_payment_batch(p_batch_id uuid, p_reason text)
returns void language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_importer uuid;
begin
  v_caller := public.assert_caller(array[]::public.app_role_code[], array['STL_HEAD']::public.authority_code[]);
  if coalesce(btrim(p_reason), '') = '' then
    raise exception using errcode = 'P0001', message = 'VALIDATION: reason is required';
  end if;
  select imported_by into v_importer from public.payment_import_batches where id = p_batch_id for update;
  if not found then
    raise exception using errcode = 'P0001', message = 'NOT_FOUND: batch';
  end if;
  if v_importer = v_caller then
    raise exception using errcode = 'P0001', message = 'FORBIDDEN: the importer cannot void own batch';
  end if;
  if exists (select 1 from public.payment_batch_voids where batch_id = p_batch_id) then
    raise exception using errcode = 'P0001', message = 'CONFLICT: batch is already voided';
  end if;
  if exists (select 1 from public.payments x join public.payment_periods p
               on x.paid_on > p.end_date and x.paid_on <= (p.end_date + interval '1 month')::date
             where x.batch_id = p_batch_id and p.status = 'LOCKED') then
    raise exception using errcode = 'P0001', message = 'CONFLICT: a period using these payments is already locked';
  end if;
  insert into public.payment_batch_voids (batch_id, reason, voided_by) values (p_batch_id, p_reason, v_caller);
end;
$$;

create or replace function public.period_payables(p_period_id uuid)
returns table (participant_id uuid, buyer_no text, name text, payable_jpy bigint,
               paid_on_time_jpy bigint, paid_total_jpy bigint, kanno boolean)
language plpgsql stable security definer set search_path = ''
as $$
#variable_conflict use_column
begin
  if auth.uid() is not null then
    perform public.assert_caller(array['SETTLE']::public.app_role_code[], array['STL_HEAD']::public.authority_code[]);
  end if;
  return query
  with p as (select * from public.payment_periods where id = p_period_id),
  amounts as (select * from public.period_buyer_amounts(p_period_id)),
  paid as (
    select x.participant_id,
           sum(x.amount_jpy) filter (where x.paid_on <= p.due_date)::bigint as on_time,
           sum(x.amount_jpy)::bigint as total
    from public.payments x, p
    where x.paid_on > p.end_date and x.paid_on <= (p.end_date + interval '1 month')::date
      and not exists (select 1 from public.payment_batch_voids v where v.batch_id = x.batch_id)
    group by x.participant_id
  )
  select a.participant_id, pt.buyer_no, pt.name, floor(a.amount_jpy * 110 / 100.0)::bigint,
         coalesce(pd.on_time, 0)::bigint, coalesce(pd.total, 0)::bigint,
         coalesce(pd.on_time, 0) >= floor(a.amount_jpy * 110 / 100.0)
  from amounts a
  join public.participants pt on pt.id = a.participant_id
  left join paid pd on pd.participant_id = a.participant_id
  order by pt.buyer_no;
end;
$$;

revoke execute on function public.import_payments(text, jsonb, text), public.void_payment_batch(uuid, text),
  public.period_payables(uuid) from public, anon, authenticated;
grant execute on function public.import_payments(text, jsonb, text), public.void_payment_batch(uuid, text),
  public.period_payables(uuid) to authenticated;
