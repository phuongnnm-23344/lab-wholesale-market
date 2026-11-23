-- 0012 (phase 03): write RPCs for participants, 許可 / 承認, accounts and PIN.
-- All: security definer + empty search_path; check role / authority of auth.uid() inside (M1).
-- Errors: raise P0001 with message 'CODE: detail' → mapped to HTTP by src/lib/http/rpc-error-mapper.ts.
-- Source: FR-PARTY-01, 02-08, B.2 (許可 ≠ 承認, S5), FR-IAM-01/02, role-list P01–P03, P09–P10.

create or replace function public.assert_caller(p_roles public.app_role_code[], p_authorities public.authority_code[])
returns uuid language plpgsql stable security definer set search_path = ''
as $$
declare v_role public.app_role_code := public.app_role();
begin
  if v_role is null then
    raise exception using errcode = 'P0001', message = 'FORBIDDEN: inactive or unknown account';
  end if;
  if v_role = any (p_roles) or exists (
       select 1 from public.user_authorities a
       where a.user_id = auth.uid() and a.authority = any (p_authorities)) then
    return auth.uid();
  end if;
  raise exception using errcode = 'P0001', message = 'FORBIDDEN: role not allowed';
end;
$$;

-- Create (p_id null) or update a participant. Kind can never change after creation, so the
-- 許可 / 承認 separation cannot be bypassed by re-labelling a participant.
create or replace function public.upsert_participant(
  p_id uuid, p_kind public.participant_kind, p_name text, p_buyer_no text, p_email text,
  p_deposit_jpy bigint, p_status public.participant_status)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare v_id uuid; v_old_kind public.participant_kind;
begin
  perform public.assert_caller(array['SETTLE']::public.app_role_code[], array['STL_HEAD']::public.authority_code[]);
  if p_id is null then
    insert into public.participants (kind, name, buyer_no, email, deposit_jpy, status, is_sample)
    values (p_kind, p_name, nullif(p_buyer_no, ''), nullif(p_email, ''), p_deposit_jpy, p_status, true)
    returning id into v_id;
    return v_id;
  end if;
  select kind into v_old_kind from public.participants where id = p_id for update;
  if not found then
    raise exception using errcode = 'P0001', message = 'NOT_FOUND: participant';
  end if;
  if v_old_kind <> p_kind then
    raise exception using errcode = 'P0001', message = 'VALIDATION: participant kind cannot be changed';
  end if;
  update public.participants
     set name = p_name, buyer_no = nullif(p_buyer_no, ''), email = nullif(p_email, ''),
         deposit_jpy = p_deposit_jpy, status = p_status
   where id = p_id;
  return p_id;
end;
$$;

create or replace function public.require_participant_kind(p_participant_id uuid, p_kind public.participant_kind)
returns void language plpgsql stable security definer set search_path = ''
as $$
declare v_kind public.participant_kind;
begin
  select kind into v_kind from public.participants where id = p_participant_id;
  if v_kind is null then
    raise exception using errcode = 'P0001', message = 'NOT_FOUND: participant';
  end if;
  if v_kind <> p_kind then
    raise exception using errcode = 'P0001',
      message = format('QUALIFICATION_KIND_MISMATCH: requires %s, participant is %s', p_kind, v_kind);
  end if;
end;
$$;

-- 許可 (仲卸 only). The current ACTIVE row becomes SUPERSEDED; history is kept.
create or replace function public.register_nakaoroshi_permit(
  p_participant_id uuid, p_permit_no text, p_valid_from date, p_valid_to date)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_id uuid;
begin
  v_caller := public.assert_caller(array['SETTLE']::public.app_role_code[], array['STL_HEAD']::public.authority_code[]);
  perform public.require_participant_kind(p_participant_id, 'NAKAOROSHI');
  update public.nakaoroshi_permits set status = 'SUPERSEDED'
   where participant_id = p_participant_id and status = 'ACTIVE';
  insert into public.nakaoroshi_permits (participant_id, permit_no, valid_from, valid_to, status, created_by)
  values (p_participant_id, p_permit_no, p_valid_from, p_valid_to, 'ACTIVE', v_caller)
  returning id into v_id;
  return v_id;
end;
$$;

-- 承認 + 参加上限 (売買参加者 only). Separate legal basis from 許可 (02-08).
create or replace function public.register_baibai_approval(
  p_participant_id uuid, p_approval_no text, p_valid_from date, p_valid_to date, p_limit_jpy bigint)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_id uuid;
begin
  v_caller := public.assert_caller(array['SETTLE']::public.app_role_code[], array['STL_HEAD']::public.authority_code[]);
  perform public.require_participant_kind(p_participant_id, 'BAIBAI');
  update public.baibai_approvals set status = 'SUPERSEDED'
   where participant_id = p_participant_id and status = 'ACTIVE';
  insert into public.baibai_approvals
    (participant_id, approval_no, valid_from, valid_to, participation_limit_jpy, status, created_by)
  values (p_participant_id, p_approval_no, p_valid_from, p_valid_to, p_limit_jpy, 'ACTIVE', v_caller)
  returning id into v_id;
  return v_id;
end;
$$;

revoke execute on function
  public.assert_caller(public.app_role_code[], public.authority_code[]),
  public.require_participant_kind(uuid, public.participant_kind),
  public.upsert_participant(uuid, public.participant_kind, text, text, text, bigint, public.participant_status),
  public.register_nakaoroshi_permit(uuid, text, date, date),
  public.register_baibai_approval(uuid, text, date, date, bigint)
from public, anon, authenticated;
grant execute on function
  public.upsert_participant(uuid, public.participant_kind, text, text, text, bigint, public.participant_status),
  public.register_nakaoroshi_permit(uuid, text, date, date),
  public.register_baibai_approval(uuid, text, date, date, bigint)
to authenticated;
