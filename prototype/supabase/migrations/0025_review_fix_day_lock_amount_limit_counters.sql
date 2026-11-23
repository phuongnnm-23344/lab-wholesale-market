-- 0025 — code review fixes W1, W2, W3, W4 (shared building blocks).
-- W1: a write could pass the DAY_LOCKED check while close_business_day was committing. The check now reads the
--     day row FOR SHARE (close holds FOR UPDATE) → the two are serialised. Also applied to seri_sessions.
-- W2: qty with more than 2 decimals was stored rounded while the amount used the unrounded qty. A trigger now
--     requires amount = floor(qty × price) on trades and DELTA rows (→ VALIDATION).
-- W3: 参加上限 could be exceeded by two parallel confirmations for the same buyer → advisory lock per
--     buyer + day; a correction can exclude its own trade from the used amount.
-- W4: numbers from count(*)+1 collided under parallel load → per-day counters (row-locked upsert).

create or replace function public.enforce_open_business_day()
returns trigger language plpgsql set search_path = ''
as $$
declare v_day date; v_status public.day_status;
begin
  if tg_op = 'UPDATE' then
    v_day := (to_jsonb(old) ->> 'business_date')::date;
    select d.status into v_status from public.business_days d where d.business_date = v_day for share;
    if v_status is distinct from 'OPEN' then
      raise exception using errcode = 'P0001', message = format('DAY_LOCKED: %s', v_day);
    end if;
  end if;
  v_day := (to_jsonb(new) ->> 'business_date')::date;
  select d.status into v_status from public.business_days d where d.business_date = v_day for share;
  if v_status is distinct from 'OPEN' then
    raise exception using errcode = 'P0001', message = format('DAY_LOCKED: %s', v_day);
  end if;
  return new;
end;
$$;

create trigger seri_sessions_open_day_only before insert or update on public.seri_sessions
  for each row execute function public.enforce_open_business_day();

create or replace function public.enforce_amount_matches_qty()
returns trigger language plpgsql set search_path = ''
as $$
declare v_qty numeric; v_price bigint; v_amount bigint;
begin
  if tg_table_name = 'trades' then
    v_qty := new.qty; v_price := new.unit_price_jpy; v_amount := new.amount_jpy;
  elsif new.kind = 'DELTA' then
    v_qty := new.qty_delta; v_price := new.unit_price_jpy; v_amount := new.amount_delta_jpy;
  else
    return new;
  end if;
  if v_amount <> floor(v_qty * v_price) then
    raise exception using errcode = 'P0001', message = 'VALIDATION: quantity must have at most 2 decimal places';
  end if;
  return new;
end;
$$;

create trigger trades_amount_matches_qty before insert or update on public.trades
  for each row execute function public.enforce_amount_matches_qty();
create trigger trade_adjustments_amount_matches_qty before insert on public.trade_adjustments
  for each row execute function public.enforce_amount_matches_qty();

drop function if exists public.check_buyer_qualification(uuid, date, bigint, text);

create function public.check_buyer_qualification(
  p_buyer_id uuid, p_day date, p_amount bigint, p_over_limit_reason text, p_exclude_trade_id uuid default null)
returns boolean language plpgsql security definer set search_path = ''
as $$
declare v_buyer public.participants%rowtype; v_limit bigint; v_used bigint;
begin
  perform pg_advisory_xact_lock(hashtextextended('buyer_limit_' || p_buyer_id::text || p_day::text, 0));
  select * into v_buyer from public.participants where id = p_buyer_id;
  if not found or v_buyer.status <> 'ACTIVE' or v_buyer.kind not in ('NAKAOROSHI', 'BAIBAI') then
    raise exception using errcode = 'P0001', message = 'BUYER_NOT_ALLOWED: buyer must be an active 仲卸 or 売買参加者';
  end if;
  if v_buyer.kind = 'NAKAOROSHI' then
    if not exists (select 1 from public.nakaoroshi_permits where participant_id = p_buyer_id
                   and status = 'ACTIVE' and p_day between valid_from and valid_to) then
      raise exception using errcode = 'P0001', message = format('PERMIT_INVALID: %s', v_buyer.buyer_no);
    end if;
    return false;
  end if;
  select participation_limit_jpy into v_limit from public.baibai_approvals
   where participant_id = p_buyer_id and status = 'ACTIVE' and p_day between valid_from and valid_to;
  if v_limit is null then
    raise exception using errcode = 'P0001', message = format('APPROVAL_INVALID: %s', v_buyer.buyer_no);
  end if;
  select coalesce(sum(amount_jpy), 0) into v_used from public.trades
   where buyer_id = p_buyer_id and business_date = p_day and status = 'CONFIRMED'
     and (p_exclude_trade_id is null or id <> p_exclude_trade_id);
  if v_used + p_amount > v_limit then
    if coalesce(btrim(p_over_limit_reason), '') = '' then
      raise exception using errcode = 'P0001',
        message = format('OVER_LIMIT_REASON_REQUIRED: limit %s, after this trade %s', v_limit, v_used + p_amount);
    end if;
    return true;
  end if;
  return false;
end;
$$;

create table public.day_counters (
  business_date date not null,
  kind text not null,
  last_no integer not null check (last_no > 0),
  primary key (business_date, kind)
);
alter table public.day_counters enable row level security;
revoke all on public.day_counters from anon, authenticated;

-- Next number of a per-day sequence. p_base = numbers already used before the counter existed.
create or replace function public.next_day_counter(p_day date, p_kind text, p_base integer)
returns integer language sql security definer set search_path = ''
as $$
  insert into public.day_counters as c (business_date, kind, last_no) values (p_day, p_kind, p_base + 1)
  on conflict (business_date, kind) do update set last_no = c.last_no + 1
  returning c.last_no;
$$;

create or replace function public.next_lot_no(p_day date)
returns text language sql security definer set search_path = ''
as $$
  select format('L%s-%s', to_char(p_day, 'YYYYMMDD'),
    public.next_day_counter(p_day, 'LOT', (select count(*)::int from public.lots where business_date = p_day)));
$$;

revoke execute on function public.check_buyer_qualification(uuid, date, bigint, text, uuid),
  public.next_day_counter(date, text, integer), public.next_lot_no(date),
  public.enforce_amount_matches_qty() from public, anon, authenticated;
