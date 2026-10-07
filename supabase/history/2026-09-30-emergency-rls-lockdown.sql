-- Emergency lockdown of the legacy RC club schema (2026-09-30).
--
-- Closes three holes in the policies created by the old supabase_schema.sql:
--   * any signed-in user could insert/update/delete rows in public.admins (self-promotion to admin);
--   * any signed-in user could write public.events and public.gallery;
--   * certificates, admins and form_submissions were readable by anon or any signed-in user.
--
-- After this migration the only access anon/authenticated keep is SELECT on
-- public.events and public.gallery, which the still-live old site reads directly.
-- Every other read/write must go through the server's service-role key, which bypasses RLS.

-- 1. Turn on RLS for every table in public, skipping extension-owned tables
--    (e.g. PostGIS spatial_ref_sys), which postgres cannot alter and which would abort the migration.
do $$
declare t record;
begin
  for t in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p')
      and not exists (
        select 1 from pg_depend d
        where d.classid = 'pg_class'::regclass and d.objid = c.oid and d.deptype = 'e'
      )
  loop
    execute format('alter table public.%I enable row level security', t.relname);
  end loop;
end $$;

-- 2. Drop every existing policy in the public schema.
do $$
declare p record;
begin
  for p in select tablename, policyname from pg_policies where schemaname = 'public' loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

-- 3. Re-open public reads only where the live site needs them.
do $$
begin
  if to_regclass('public.events') is not null then
    create policy "Public can read events" on public.events
      for select to anon, authenticated using (true);
  end if;
  if to_regclass('public.gallery') is not null then
    create policy "Public can read gallery" on public.gallery
      for select to anon, authenticated using (true);
  end if;
end $$;

-- 4. Views, materialized views and foreign tables ignore RLS; nothing uses them, so close them to clients.
--    A REVOKE postgres isn't allowed to make only raises a warning, so this cannot abort the migration.
do $$
declare v record;
begin
  for v in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('v', 'm', 'f')
      and not exists (
        select 1 from pg_depend d
        where d.classid = 'pg_class'::regclass and d.objid = c.oid and d.deptype = 'e'
      )
  loop
    execute format('revoke all on public.%I from anon, authenticated', v.relname);
  end loop;
end $$;
