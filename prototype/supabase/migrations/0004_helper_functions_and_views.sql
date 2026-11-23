-- 0004: helper functions used by RLS policies / API, and read-only views
-- All functions: security definer + empty search_path (fully qualified names only).
-- Grants are set in 0007 (helpers → authenticated; n1).

-- Role of the caller. NULL when: no profile, profile inactive, or Auth user banned (M2).
create or replace function public.app_role()
returns public.app_role_code
language sql stable security definer set search_path = ''
as $$
  select p.role
  from public.profiles p
  join auth.users u on u.id = p.user_id
  where p.user_id = auth.uid()
    and p.is_active
    and (u.banned_until is null or u.banned_until <= now());
$$;

create or replace function public.has_authority(p_authority public.authority_code)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select public.app_role() is not null
     and exists (
       select 1 from public.user_authorities a
       where a.user_id = auth.uid() and a.authority = p_authority
     );
$$;

-- Latest OPEN market day (業務日). Never derived from the client clock.
create or replace function public.current_business_date()
returns date
language sql stable security definer set search_path = ''
as $$
  select max(d.business_date) from public.business_days d where d.status = 'OPEN';
$$;

-- Version applied on a given day: latest approved version effective on or before that day
-- (ACTIVE or SUPERSEDED; CANCELLED / DRAFT / PENDING never apply). PRM-042, GOV-RULE-01.
create or replace function public.active_rule_version_on(p_day date)
returns uuid
language sql stable security definer set search_path = ''
as $$
  select v.id
  from public.rule_versions v
  where v.status in ('ACTIVE', 'SUPERSEDED') and v.effective_from <= p_day
  order by v.effective_from desc, v.version_no desc
  limit 1;
$$;

-- Profile of the caller for the app shell (/api/me). NULL when app_role() is NULL.
create or replace function public.get_my_profile()
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select case when public.app_role() is null then null else
    jsonb_build_object(
      'user_id', p.user_id,
      'employee_no', p.employee_no,
      'display_name', p.display_name,
      'role', p.role,
      'is_demo_protected', p.is_demo_protected,
      'authorities', coalesce(
        (select jsonb_agg(a.authority order by a.authority)
         from public.user_authorities a where a.user_id = p.user_id), '[]'::jsonb),
      'business_date', public.current_business_date()
    ) end
  from public.profiles p
  where p.user_id = auth.uid();
$$;

-- ---------- Views (security_invoker: caller's RLS applies) ----------

create view public.v_lot_available_qty with (security_invoker = true) as
select l.id as lot_id, l.lot_no, l.business_date, l.status,
       coalesce(sum(q.qty_delta), 0)::numeric(12, 2) as available_qty
from public.lots l
left join public.lot_quantity_ledger q on q.lot_id = l.id
group by l.id;

-- Every money line per buyer: confirmed originals + REVERSE/DELTA rows with their own buyer (M4).
create view public.v_settlement_lines with (security_invoker = true) as
select t.id as trade_id, t.business_date, t.buyer_id, 'ORIGINAL'::text as line_kind,
       t.qty as qty, t.amount_jpy as amount_jpy
from public.trades t
where t.status = 'CONFIRMED'
union all
select a.trade_id, a.business_date, a.buyer_id, a.kind::text, a.qty_delta, a.amount_delta_jpy
from public.trade_adjustments a;

create view public.v_trade_effective with (security_invoker = true) as
select t.id as trade_id, t.trade_no, t.business_date, t.lot_id, t.channel, t.status,
       t.qty + coalesce(adj.qty_delta, 0) as effective_qty,
       t.amount_jpy + coalesce(adj.amount_delta, 0) as effective_amount_jpy,
       coalesce(last_delta.buyer_id, t.buyer_id) as effective_buyer_id,
       coalesce(last_delta.unit_price_jpy, t.unit_price_jpy) as effective_unit_price_jpy
from public.trades t
left join lateral (
  select sum(a.qty_delta) as qty_delta, sum(a.amount_delta_jpy) as amount_delta
  from public.trade_adjustments a where a.trade_id = t.id
) adj on true
left join lateral (
  select a.buyer_id, a.unit_price_jpy
  from public.trade_adjustments a
  where a.trade_id = t.id and a.kind = 'DELTA'
  order by a.created_at desc limit 1
) last_delta on true;

create view public.v_delivery_status with (security_invoker = true) as
select e.trade_id, e.effective_qty,
       coalesce(sum(d.qty_delivered), 0)::numeric(12, 2) as delivered_qty,
       coalesce(sum(d.qty_delivered), 0) >= e.effective_qty as is_complete
from public.v_trade_effective e
left join public.deliveries d on d.trade_id = e.trade_id
where e.status = 'CONFIRMED'
group by e.trade_id, e.effective_qty;

create view public.v_daily_settlement with (security_invoker = true) as
select s.business_date, s.buyer_id,
       count(*) filter (where s.line_kind = 'ORIGINAL') as trade_count,
       sum(s.qty)::numeric(12, 2) as qty_total,
       sum(s.amount_jpy)::bigint as amount_total_jpy
from public.v_settlement_lines s
group by s.business_date, s.buyer_id;
