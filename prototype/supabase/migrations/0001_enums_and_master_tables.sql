-- 0001: enums + user / participant master tables
-- Source: role-list.md (TBL-ROLE-01, 7 roles + 3 authorities), FR-PARTY-01, 02-08 (許可 ≠ 承認)
-- All sample data is fictional (サンプル). See README.

create extension if not exists pgcrypto with schema extensions;

create type public.app_role_code as enum
  ('INTAKE', 'JUDGE', 'TRADE', 'DELIVERY', 'SETTLE', 'RULE', 'SYSADM');
create type public.authority_code as enum ('STL_HEAD', 'OPS_HEAD', 'DEL_HEAD');
-- 卸売業者 / 仲卸 / 売買参加者 / 買出人 — never merged into one "buyer" role
create type public.participant_kind as enum ('WHOLESALER', 'NAKAOROSHI', 'BAIBAI', 'KAIDASHI');
create type public.qualification_status as enum ('ACTIVE', 'SUPERSEDED', 'EXPIRED');
create type public.participant_status as enum ('ACTIVE', 'SUSPENDED');
create type public.day_status as enum ('OPEN', 'LOCKED');
-- 仮受付 → 受付(本登録) → 下見済 → 公開 → 確定(売切) → 引渡完了
create type public.lot_status as enum
  ('PROVISIONAL', 'RECEIVED', 'INSPECTED', 'PUBLISHED', 'SOLD_OUT', 'DELIVERED');
create type public.trade_channel as enum ('AITAI', 'SERI');
create type public.trade_status as enum ('PROVISIONAL', 'CONFIRMED');
create type public.seri_status as enum ('ENTERING', 'CONFIRMED');
create type public.correction_status as enum ('SUBMITTED', 'FIRST_APPROVED', 'APPROVED', 'REJECTED');
create type public.adjustment_kind as enum ('REVERSE', 'DELTA');
create type public.period_status as enum ('OPEN', 'LOCKED');
create type public.rule_status as enum ('DRAFT', 'PENDING', 'ACTIVE', 'SUPERSEDED', 'CANCELLED');
create type public.incentive_kind as enum ('MAIN', 'DELTA');

-- Internal staff profile (1:1 with auth.users). No PIN here (n2): see profile_pins.
create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  employee_no text not null unique,
  display_name text not null,
  role public.app_role_code not null,
  is_active boolean not null default true,
  is_demo_protected boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- PIN for shared-device user switch (SC-00-02). No grant, no policy: never readable via API.
create table public.profile_pins (
  user_id uuid primary key references public.profiles (user_id) on delete cascade,
  pin_hash text not null,
  pin_failed_count integer not null default 0 check (pin_failed_count >= 0),
  pin_locked_until timestamptz,
  updated_at timestamptz not null default now()
);

-- Additive authorities (照合部門長 / 運用部門長 / 配送部門責任者), not extra roles
create table public.user_authorities (
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  authority public.authority_code not null,
  granted_by uuid references public.profiles (user_id),
  granted_at timestamptz not null default now(),
  primary key (user_id, authority)
);

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  kind public.participant_kind not null,
  name text not null check (char_length(name) between 1 and 100),
  buyer_no text unique,
  email text,
  deposit_jpy bigint not null default 0 check (deposit_jpy >= 0),
  status public.participant_status not null default 'ACTIVE',
  is_sample boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 許可 (only for 仲卸). Kind check enforced by trigger in 0005.
create table public.nakaoroshi_permits (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants (id),
  permit_no text not null,
  valid_from date not null,
  valid_to date not null check (valid_to >= valid_from),
  status public.qualification_status not null default 'ACTIVE',
  created_by uuid references public.profiles (user_id),
  created_at timestamptz not null default now()
);

-- 承認 (only for 売買参加者) + 参加上限. Separate legal basis from 許可.
create table public.baibai_approvals (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants (id),
  approval_no text not null,
  valid_from date not null,
  valid_to date not null check (valid_to >= valid_from),
  participation_limit_jpy bigint not null check (participation_limit_jpy > 0),
  status public.qualification_status not null default 'ACTIVE',
  created_by uuid references public.profiles (user_id),
  created_at timestamptz not null default now()
);

create index nakaoroshi_permits_participant_idx on public.nakaoroshi_permits (participant_id);
create index baibai_approvals_participant_idx on public.baibai_approvals (participant_id);
