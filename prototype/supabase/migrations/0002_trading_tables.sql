-- 0002: trading tables keyed by business_date (JST market day, never derived from UTC now())
-- Source: FR-LOT-01..03, BR-LOT-02, FR-AITAI-01, FR-SERI-01/02, FR-DEL-01/02/05,
--         FORM-CORR-01, FR-CORR-02, BR-CLOSE-01
-- Append-only tables are protected by triggers in 0005.

create table public.business_days (
  business_date date primary key,
  status public.day_status not null default 'OPEN',
  locked_by uuid references public.profiles (user_id),
  locked_at timestamptz
);

create table public.lots (
  id uuid primary key default gen_random_uuid(),
  lot_no text not null unique,
  business_date date not null references public.business_days (business_date),
  shipper_name text not null,
  species text not null,
  unit text not null default 'kg',
  qty_received numeric(12, 2) check (qty_received is null or qty_received > 0),
  status public.lot_status not null default 'PROVISIONAL',
  provisional_by uuid references public.profiles (user_id),
  registered_by uuid references public.profiles (user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 目利き・下見: recorded by a person (CAP-HUMAN-01). Append-only.
create table public.lot_inspections (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references public.lots (id),
  business_date date not null references public.business_days (business_date),
  grade text not null,
  freshness_note text,
  inspected_by uuid references public.profiles (user_id),
  created_at timestamptz not null default now()
);

-- Quantity ledger: available qty = sum(qty_delta). Append-only (BR-LOT-02).
create table public.lot_quantity_ledger (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references public.lots (id),
  business_date date not null references public.business_days (business_date),
  qty_delta numeric(12, 2) not null check (qty_delta <> 0),
  reason text not null,
  ref_trade_id uuid,
  created_by uuid references public.profiles (user_id),
  created_at timestamptz not null default now()
);

create table public.seri_sessions (
  id uuid primary key default gen_random_uuid(),
  business_date date not null references public.business_days (business_date),
  session_no integer not null check (session_no > 0),
  status public.seri_status not null default 'ENTERING',
  entered_by uuid references public.profiles (user_id),
  confirmed_by uuid references public.profiles (user_id),
  confirmed_at timestamptz,
  same_person_reason text,
  unique (business_date, session_no)
);

-- Original trade. Once CONFIRMED, money / qty / buyer columns are frozen (trigger in 0005).
create table public.trades (
  id uuid primary key default gen_random_uuid(),
  trade_no text not null unique,
  business_date date not null references public.business_days (business_date),
  lot_id uuid not null references public.lots (id),
  buyer_id uuid not null references public.participants (id),
  channel public.trade_channel not null,
  qty numeric(12, 2) not null check (qty > 0),
  unit_price_jpy bigint not null check (unit_price_jpy > 0),
  amount_jpy bigint not null check (amount_jpy >= 0),
  status public.trade_status not null default 'PROVISIONAL',
  over_limit_reason text,
  seri_session_id uuid references public.seri_sessions (id),
  created_by uuid references public.profiles (user_id),
  confirmed_by uuid references public.profiles (user_id),
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lot_quantity_ledger
  add constraint lot_quantity_ledger_trade_fk foreign key (ref_trade_id) references public.trades (id);

-- Each delivery = one append-only row (partial deliveries allowed).
create table public.deliveries (
  id uuid primary key default gen_random_uuid(),
  trade_id uuid not null references public.trades (id),
  business_date date not null references public.business_days (business_date),
  qty_delivered numeric(12, 2) not null check (qty_delivered > 0),
  recorded_by uuid references public.profiles (user_id),
  created_at timestamptz not null default now()
);

create table public.correction_requests (
  id uuid primary key default gen_random_uuid(),
  target_trade_id uuid not null references public.trades (id),
  change jsonb not null,
  reason text not null check (char_length(reason) > 0),
  status public.correction_status not null default 'SUBMITTED',
  requested_by uuid references public.profiles (user_id),
  approver1 uuid references public.profiles (user_id),
  approver2 uuid references public.profiles (user_id),
  reject_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- REVERSE carries the OLD buyer/price, DELTA the NEW buyer/price (M4).
-- business_date = day the adjustment is applied (always an OPEN day).
create table public.trade_adjustments (
  id uuid primary key default gen_random_uuid(),
  correction_id uuid not null references public.correction_requests (id),
  trade_id uuid not null references public.trades (id),
  kind public.adjustment_kind not null,
  buyer_id uuid not null references public.participants (id),
  unit_price_jpy bigint not null check (unit_price_jpy > 0),
  qty_delta numeric(12, 2) not null,
  amount_delta_jpy bigint not null,
  business_date date not null references public.business_days (business_date),
  created_at timestamptz not null default now()
);

create index lots_business_date_idx on public.lots (business_date);
create index ledger_lot_idx on public.lot_quantity_ledger (lot_id);
create index trades_business_date_idx on public.trades (business_date);
create index trades_lot_idx on public.trades (lot_id);
create index trades_buyer_idx on public.trades (buyer_id);
create index deliveries_trade_idx on public.deliveries (trade_id);
create index adjustments_trade_idx on public.trade_adjustments (trade_id);
create index adjustments_buyer_idx on public.trade_adjustments (buyer_id);
