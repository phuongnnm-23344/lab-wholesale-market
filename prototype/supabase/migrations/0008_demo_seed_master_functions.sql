-- 0008: demo-only server functions (service_role only). FICTIONAL SAMPLE DATA — every name starts
-- with 「サンプル」 and participants.is_sample = true. No real business data (DEC-028, M01).

-- Set / reset a shared-device PIN (SC-00-02). Stores bcrypt hash only; clears lock state.
create or replace function public.admin_set_pin_hash(p_user_id uuid, p_pin text)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if p_pin !~ '^[0-9]{4}$' then
    raise exception using errcode = 'P0001', message = 'PIN_FORMAT: PIN must be 4 digits';
  end if;
  insert into public.profile_pins (user_id, pin_hash, pin_failed_count, pin_locked_until, updated_at)
  values (p_user_id, extensions.crypt(p_pin, extensions.gen_salt('bf')), 0, null, now())
  on conflict (user_id) do update
    set pin_hash = excluded.pin_hash, pin_failed_count = 0, pin_locked_until = null, updated_at = now();
end;
$$;

-- Demo user id by employee number (NULL if accounts were not created yet).
create or replace function public.demo_user_id(p_employee_no text)
returns uuid language sql stable security definer set search_path = ''
as $$
  select p.user_id from public.profiles p where p.employee_no = p_employee_no;
$$;

-- Participants: 仲卸 8 (許可; N06 expiring soon, N08 expired), 売買参加者 8 (承認; B07 low
-- 参加上限, B08 expired), 卸売業者 2, 買出人 2 (no buyer number / no account).
create or replace function public.seed_demo_master(p_today date)
returns void language plpgsql security definer set search_path = ''
as $$
declare
  v_settle uuid := public.demo_user_id('S1006');
begin
  insert into public.participants (kind, name, buyer_no, email, deposit_jpy)
  select 'NAKAOROSHI', format('サンプル仲卸%s', i), format('N%s', lpad(i::text, 2, '0')),
         format('nakaoroshi%s@sakura-sample.example', i), 3000000
  from generate_series(1, 8) i;

  insert into public.participants (kind, name, buyer_no, email, deposit_jpy)
  select 'BAIBAI', format('サンプル売買参加者%s', i), format('B%s', lpad(i::text, 2, '0')),
         format('baibai%s@sakura-sample.example', i), 1000000
  from generate_series(1, 8) i;

  insert into public.participants (kind, name, buyer_no, email, deposit_jpy)
  select 'WHOLESALER', format('サンプル卸売%s', i), null, null, 0 from generate_series(1, 2) i
  union all
  select 'KAIDASHI', format('サンプル買出人%s', i), null, null, 0 from generate_series(1, 2) i;

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

-- Rule versions (PRM-042): v1 2026-04-01 (SUPERSEDED by v2), v2 2026-10-01 ACTIVE
-- → fiscal year 2026 quota used 2/4 (M3). Rates are fictional sample values (‰).
create or replace function public.seed_demo_rule_versions()
returns void language plpgsql security definer set search_path = ''
as $$
declare
  v_rule uuid := public.demo_user_id('S1009');
  v_head uuid := public.demo_user_id('S1007');
  v1 uuid;
  v2 uuid;
begin
  insert into public.rule_versions (version_no, effective_from, status, note, maker_id)
  values (1, date '2026-04-01', 'DRAFT', 'サンプル：初版交付率', v_rule) returning id into v1;
  insert into public.rule_versions (version_no, effective_from, status, note, maker_id)
  values (2, date '2026-10-01', 'DRAFT', 'サンプル：交付率改定', v_rule) returning id into v2;

  insert into public.incentive_rate_rows (rule_version_id, min_paid_jpy, max_paid_jpy, rate_permille)
  values (v1, 0, 1000000, 5), (v1, 1000000, 5000000, 8), (v1, 5000000, null, 10),
         (v2, 0, 1000000, 6), (v2, 1000000, 5000000, 9), (v2, 5000000, null, 12);

  update public.rule_versions
     set status = 'SUPERSEDED', checker_id = v_head, approved_at = timestamptz '2026-03-15 10:00+09'
   where id = v1;
  update public.rule_versions
     set status = 'ACTIVE', checker_id = v_head, approved_at = timestamptz '2026-09-15 10:00+09',
         replaced_version_id = v1
   where id = v2;
end;
$$;
