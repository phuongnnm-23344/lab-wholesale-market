-- 0010: fix seed_demo_master() from 0008.
-- Bug found on the real DB (2026-11-23, demo:reset): `select 'WHOLESALER' ... union all select 'KAIDASHI' ...`
-- resolves the UNION column to text, and text is not assignable to participant_kind
-- ("column kind is of type participant_kind but expression is of type text").
-- Fix: explicit enum casts on every literal kind. Body otherwise identical to 0008.

create or replace function public.seed_demo_master(p_today date)
returns void language plpgsql security definer set search_path = ''
as $$
declare
  v_settle uuid := public.demo_user_id('S1006');
begin
  insert into public.participants (kind, name, buyer_no, email, deposit_jpy)
  select 'NAKAOROSHI'::public.participant_kind, format('サンプル仲卸%s', i),
         format('N%s', lpad(i::text, 2, '0')), format('nakaoroshi%s@sakura-sample.example', i), 3000000
  from generate_series(1, 8) i;

  insert into public.participants (kind, name, buyer_no, email, deposit_jpy)
  select 'BAIBAI'::public.participant_kind, format('サンプル売買参加者%s', i),
         format('B%s', lpad(i::text, 2, '0')), format('baibai%s@sakura-sample.example', i), 1000000
  from generate_series(1, 8) i;

  insert into public.participants (kind, name, buyer_no, email, deposit_jpy)
  select 'WHOLESALER'::public.participant_kind, format('サンプル卸売%s', i), null, null, 0
  from generate_series(1, 2) i
  union all
  select 'KAIDASHI'::public.participant_kind, format('サンプル買出人%s', i), null, null, 0
  from generate_series(1, 2) i;

  insert into public.nakaoroshi_permits (participant_id, permit_no, valid_from, valid_to, status, created_by)
  select p.id, format('サンプル許可-%s', p.buyer_no), p_today - 400,
         case p.buyer_no when 'N06' then p_today + 20 when 'N08' then p_today - 10 else p_today + 700 end,
         case p.buyer_no when 'N08' then 'EXPIRED' else 'ACTIVE' end::public.qualification_status,
         v_settle
  from public.participants p where p.kind = 'NAKAOROSHI';

  insert into public.baibai_approvals
    (participant_id, approval_no, valid_from, valid_to, participation_limit_jpy, status, created_by)
  select p.id, format('サンプル承認-%s', p.buyer_no), p_today - 400,
         case p.buyer_no when 'B08' then p_today - 10 else p_today + 700 end,
         case p.buyer_no when 'B07' then 300000 else 5000000 end,
         case p.buyer_no when 'B08' then 'EXPIRED' else 'ACTIVE' end::public.qualification_status,
         v_settle
  from public.participants p where p.kind = 'BAIBAI';
end;
$$;

revoke execute on function public.seed_demo_master(date) from public, anon, authenticated;
