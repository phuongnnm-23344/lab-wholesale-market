-- 0011: read-only security snapshot for scripts/verify-phase-02-db-security.ts (and phase 11).
-- PostgREST does not expose pg_catalog, so the checks "RLS on 100% of tables", "0 write policies",
-- "no client write privilege", "which functions anon / authenticated can execute" are computed here.
-- service_role only: never callable from the browser.

create or replace function public.security_audit_snapshot()
returns jsonb
language sql stable security definer set search_path = ''
as $$
  with rels as (
    select c.oid, c.relname, c.relkind, c.relrowsecurity
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'v')
  ),
  funcs as (
    select p.oid, p.proname || '(' || pg_catalog.pg_get_function_identity_arguments(p.oid) || ')' as signature
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
  )
  select jsonb_build_object(
    'tables_without_rls', coalesce((select jsonb_agg(relname order by relname)
      from rels where relkind = 'r' and not relrowsecurity), '[]'::jsonb),
    'non_select_policies', coalesce((select jsonb_agg(p.tablename || ':' || p.policyname order by 1)
      from pg_catalog.pg_policies p where p.schemaname = 'public' and p.cmd <> 'SELECT'), '[]'::jsonb),
    'client_writable_relations', coalesce((select jsonb_agg(relname order by relname) from rels r
      where exists (
        select 1 from unnest(array['anon', 'authenticated']) as role_name,
                      unnest(array['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE']) as priv
        where pg_catalog.has_table_privilege(role_name, r.oid, priv))), '[]'::jsonb),
    'anon_readable_relations', coalesce((select jsonb_agg(relname order by relname) from rels r
      where pg_catalog.has_table_privilege('anon', r.oid, 'SELECT')), '[]'::jsonb),
    'authenticated_can_read_profile_pins',
      pg_catalog.has_table_privilege('authenticated', 'public.profile_pins', 'SELECT'),
    'anon_executable_functions', coalesce((select jsonb_agg(signature order by signature) from funcs f
      where pg_catalog.has_function_privilege('anon', f.oid, 'EXECUTE')), '[]'::jsonb),
    'authenticated_executable_functions', coalesce((select jsonb_agg(signature order by signature) from funcs f
      where pg_catalog.has_function_privilege('authenticated', f.oid, 'EXECUTE')), '[]'::jsonb)
  );
$$;

revoke execute on function public.security_audit_snapshot() from public, anon, authenticated;
grant execute on function public.security_audit_snapshot() to service_role;
