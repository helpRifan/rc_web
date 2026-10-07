-- Privilege test for spec 5 and 9.3 item 1. Run each query with execute_sql against the target project.
-- Every query must return zero rows.

-- 1. No table in public lets anon or authenticated read or write.
select c.relname, r.role
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
cross join (values ('anon'), ('authenticated')) as r(role)
where n.nspname = 'public' and c.relkind in ('r', 'v', 'm', 'p')
  and (has_table_privilege(r.role, c.oid, 'select') or has_table_privilege(r.role, c.oid, 'insert')
    or has_table_privilege(r.role, c.oid, 'update') or has_table_privilege(r.role, c.oid, 'delete'));

-- 2. RLS is enabled on every public table.
select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;

-- 3. No policies exist for client roles.
select tablename, policyname from pg_policies where schemaname in ('public', 'storage') and roles && array['anon', 'authenticated', 'public']::name[];

-- 4. No function in public (the rate limiter included) can be called by anon or authenticated.
select p.proname, r.role
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
cross join (values ('anon'), ('authenticated')) as r(role)
where n.nspname = 'public' and has_function_privilege(r.role, p.oid, 'execute');

-- 5. The certificates bucket exists and is private (returns a row only if it's missing or public).
select 'certificates bucket missing or public' where not exists (select 1 from storage.buckets where id = 'certificates' and public = false);

-- 6. Functions created later in public won't be callable by client roles either. Returns each client
--    grantee (PUBLIC, anon, authenticated) of EXECUTE in postgres's default privileges for new functions
--    in public: the global default (Postgres's built-in one if none is set) plus the per-schema one.
select case when e.grantee = 0 then 'PUBLIC' else e.grantee::regrole::text end as grantee
from (
  select (aclexplode(coalesce(
    (select d.defaclacl from pg_default_acl d
     where d.defaclrole = 'postgres'::regrole and d.defaclnamespace = 0 and d.defaclobjtype = 'f'),
    acldefault('f', 'postgres'::regrole)))).*
  union all
  select (aclexplode(d.defaclacl)).* from pg_default_acl d
  where d.defaclrole = 'postgres'::regrole and d.defaclnamespace = 'public'::regnamespace and d.defaclobjtype = 'f'
) e
where e.privilege_type = 'EXECUTE' and (e.grantee = 0 or e.grantee in ('anon'::regrole, 'authenticated'::regrole));
