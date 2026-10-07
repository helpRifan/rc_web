-- Review fix (2 Oct): new functions in public must not be callable by client roles.
--
-- Schema v1's `alter default privileges ... in schema public revoke execute on functions from
-- public` can't remove Postgres's built-in default, which lets PUBLIC execute every new function:
-- a per-schema rule only adds to the global default. So a later function in public, created
-- without its own revoke, would be callable through /rest/v1/rpc with the publishable key, and a
-- security definer one would bypass RLS. Revoke it globally for functions postgres creates.
-- service_role keeps execute in public through schema v1's per-schema default.
alter default privileges for role postgres revoke execute on functions from public;

-- Keep Supabase's usual behaviour for extension functions (for example a future pg_trgm in
-- extensions), which the global revoke would otherwise lock away from service_role.
alter default privileges for role postgres in schema extensions grant execute on functions to public;
