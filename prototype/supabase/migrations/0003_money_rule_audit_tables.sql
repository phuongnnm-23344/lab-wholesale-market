-- 0003: payment periods, payments, rule versions + rate table, incentive results, audit log
-- Source: BR-INC-01, FR-INC-01..03, GOV-RULE-01, TBL-RATE-01, PRM-042, PRM-043, FR-AUDIT-01

create table public.payment_periods (
  id uuid primary key default gen_random_uuid(),
  period_code text not null unique,          -- 'YYYY-MM'
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  due_date date not null,
  status public.period_status not null default 'OPEN',
  locked_by uuid references public.profiles (user_id),
  locked_at timestamptz
);

create table public.payment_import_batches (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  row_count integer not null check (row_count >= 0),
  imported_by uuid references public.profiles (user_id),
  imported_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.payment_import_batches (id),
  buyer_no text not null,
  participant_id uuid references public.participants (id),
  paid_on date not null,
  amount_jpy bigint not null check (amount_jpy > 0),
  created_at timestamptz not null default now()
);

-- Effective date must be the 1st of a month (PRM-042: one version per period).
create table public.rule_versions (
  id uuid primary key default gen_random_uuid(),
  version_no integer not null unique check (version_no > 0),
  effective_from date not null check (extract(day from effective_from) = 1),
  status public.rule_status not null default 'DRAFT',
  note text,
  maker_id uuid references public.profiles (user_id),
  checker_id uuid references public.profiles (user_id),
  approved_at timestamptz,
  rollback_of uuid references public.rule_versions (id),
  replaced_version_id uuid references public.rule_versions (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Rows editable only while the version is DRAFT (trigger in 0005).
create table public.incentive_rate_rows (
  id uuid primary key default gen_random_uuid(),
  rule_version_id uuid not null references public.rule_versions (id),
  min_paid_jpy bigint not null check (min_paid_jpy >= 0),
  max_paid_jpy bigint check (max_paid_jpy is null or max_paid_jpy > min_paid_jpy),
  rate_permille integer not null check (rate_permille between 0 and 1000)
);

create table public.incentive_runs (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null unique references public.payment_periods (id), -- 1 run per period (m7)
  run_by uuid references public.profiles (user_id),
  run_at timestamptz not null default now()
);

create table public.incentive_results (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.incentive_runs (id),
  period_id uuid not null references public.payment_periods (id),
  participant_id uuid not null references public.participants (id),
  kind public.incentive_kind not null,
  ref_period_id uuid references public.payment_periods (id),  -- DELTA: the locked period recalculated
  payable_jpy bigint not null,
  paid_jpy bigint not null,
  kanno boolean not null,
  incentive_jpy bigint not null,
  rule_version_id uuid not null references public.rule_versions (id),
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  table_name text not null,
  record_id text,
  before jsonb,
  after jsonb,
  business_date date,
  at timestamptz not null default now()
);

create index payments_participant_idx on public.payments (participant_id);
create index rate_rows_version_idx on public.incentive_rate_rows (rule_version_id);
create index incentive_results_period_idx on public.incentive_results (period_id);
create index audit_logs_at_idx on public.audit_logs (at desc, id desc);
create index audit_logs_record_idx on public.audit_logs (table_name, record_id);
