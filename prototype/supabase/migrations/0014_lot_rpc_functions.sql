-- 0014 (phase 04): lot intake (仮受付 → 本登録), 目利き・下見 by a person, 販売公開.
-- Source: FR-LOT-01..03, FORM-LOT-01, BR-LOT-02, FIG-011, CAP-HUMAN-01, PRM-110/117. Rule 3: no AI grading.
-- Every write happens on the current OPEN business day (DAY_LOCKED trigger is the last line of defence).

create or replace function public.next_lot_no(p_day date)
returns text language sql stable security definer set search_path = ''
as $$
  select format('L%s-%s', to_char(p_day, 'YYYYMMDD'), count(*) + 1)
  from public.lots where business_date = p_day;
$$;

-- SC-03-02 仮受付 (tablet, online only): 3–4 fields, provisional qty, no ledger row yet.
create or replace function public.provisional_receive_lot(p_shipper_name text, p_species text, p_qty_estimate numeric)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_day date := public.current_business_date(); v_id uuid;
begin
  v_caller := public.assert_caller(array['INTAKE']::public.app_role_code[], array[]::public.authority_code[]);
  insert into public.lots (lot_no, business_date, shipper_name, species, qty_received, status, provisional_by)
  values (public.next_lot_no(v_day), v_day, p_shipper_name, p_species, p_qty_estimate, 'PROVISIONAL', v_caller)
  returning id into v_id;
  return v_id;
end;
$$;

-- SC-03-01 本登録: completes a 仮受付 lot (p_lot_id) or registers a new lot; writes the 受入 ledger row.
create or replace function public.register_lot(
  p_lot_id uuid, p_shipper_name text, p_species text, p_unit text, p_qty numeric)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_day date := public.current_business_date(); v_id uuid; v_lot public.lots%rowtype;
begin
  v_caller := public.assert_caller(array['INTAKE']::public.app_role_code[], array[]::public.authority_code[]);
  if p_lot_id is null then
    insert into public.lots (lot_no, business_date, shipper_name, species, unit, qty_received, status,
                             provisional_by, registered_by)
    values (public.next_lot_no(v_day), v_day, p_shipper_name, p_species, p_unit, p_qty, 'RECEIVED', v_caller, v_caller)
    returning id into v_id;
  else
    select * into v_lot from public.lots where id = p_lot_id for update;
    if not found then
      raise exception using errcode = 'P0001', message = 'NOT_FOUND: lot';
    end if;
    if v_lot.status <> 'PROVISIONAL' then
      raise exception using errcode = 'P0001', message = 'CONFLICT: lot is not 仮受付';
    end if;
    update public.lots
       set shipper_name = p_shipper_name, species = p_species, unit = p_unit, qty_received = p_qty,
           status = 'RECEIVED', registered_by = v_caller
     where id = p_lot_id;
    v_id := p_lot_id;
    v_day := v_lot.business_date;
  end if;
  insert into public.lot_quantity_ledger (lot_id, business_date, qty_delta, reason, created_by)
  values (v_id, v_day, p_qty, '受入', v_caller);
  return v_id;
end;
$$;

-- SC-03-05 目利き・下見: recorded by 目利き記録担当 for one or many lots (append-only history).
create or replace function public.record_inspections(p_lot_ids uuid[], p_grade text, p_note text)
returns integer language plpgsql security definer set search_path = ''
as $$
declare v_caller uuid; v_lot public.lots%rowtype; v_count integer := 0;
begin
  v_caller := public.assert_caller(array['JUDGE']::public.app_role_code[], array[]::public.authority_code[]);
  for v_lot in select * from public.lots where id = any (p_lot_ids) for update loop
    if v_lot.status not in ('RECEIVED', 'INSPECTED') then
      raise exception using errcode = 'P0001', message = format('CONFLICT: lot %s is not 受付済', v_lot.lot_no);
    end if;
    insert into public.lot_inspections (lot_id, business_date, grade, freshness_note, inspected_by)
    values (v_lot.id, v_lot.business_date, p_grade, p_note, v_caller);
    if v_lot.status = 'RECEIVED' then
      update public.lots set status = 'INSPECTED' where id = v_lot.id;
    end if;
    v_count := v_count + 1;
  end loop;
  if v_count <> coalesce(array_length(p_lot_ids, 1), 0) then
    raise exception using errcode = 'P0001', message = 'NOT_FOUND: some lots do not exist';
  end if;
  return v_count;
end;
$$;

-- SC-03-03 一括販売公開: only lots that were inspected (下見済) can be put on sale (FIG-011, PRM-117).
create or replace function public.publish_lots(p_lot_ids uuid[])
returns integer language plpgsql security definer set search_path = ''
as $$
declare v_lot public.lots%rowtype; v_count integer := 0;
begin
  perform public.assert_caller(array['INTAKE', 'JUDGE']::public.app_role_code[], array[]::public.authority_code[]);
  for v_lot in select * from public.lots where id = any (p_lot_ids) for update loop
    if v_lot.status <> 'INSPECTED' then
      raise exception using errcode = 'P0001', message = format('CONFLICT: lot %s is not 下見済', v_lot.lot_no);
    end if;
    update public.lots set status = 'PUBLISHED' where id = v_lot.id;
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

-- Display names of staff who recorded / confirmed something (rule 3: the deciding person is shown).
-- profiles RLS lets users read only their own row, so names are exposed through this narrow function
-- (name + employee no. only) to active internal users.
create or replace function public.staff_display_names(p_user_ids uuid[])
returns table (user_id uuid, display_name text, employee_no text)
language sql stable security definer set search_path = ''
as $$
  select p.user_id, p.display_name, p.employee_no
  from public.profiles p
  where public.app_role() is not null and p.user_id = any (p_user_ids);
$$;

revoke execute on function public.staff_display_names(uuid[]) from public, anon, authenticated;
grant execute on function public.staff_display_names(uuid[]) to authenticated;

revoke execute on function
  public.next_lot_no(date),
  public.provisional_receive_lot(text, text, numeric),
  public.register_lot(uuid, text, text, text, numeric),
  public.record_inspections(uuid[], text, text),
  public.publish_lots(uuid[])
from public, anon, authenticated;
grant execute on function
  public.provisional_receive_lot(text, text, numeric),
  public.register_lot(uuid, text, text, text, numeric),
  public.record_inspections(uuid[], text, text),
  public.publish_lots(uuid[])
to authenticated;
