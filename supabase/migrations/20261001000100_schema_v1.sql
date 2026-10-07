create extension if not exists citext with schema extensions;

create type public.member_level as enum ('faculty', 'board', 'head', 'lead', 'core', 'member');
create type public.member_division as enum ('projects', 'webdev', 'teaching', 'media', 'operations', 'marketing', 'alumni', 'none');
create type public.event_status as enum ('upcoming', 'registration_open', 'coming_soon', 'completed');
create type public.certificate_type as enum ('participation', 'winner', 'runner_up', 'merit', 'volunteer', 'organiser');
create type public.certificate_status as enum ('issued', 'revoked');
create type public.email_scope as enum ('team', 'individual');

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.members (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  full_name text not null check (char_length(full_name) between 1 and 80),
  role_title text check (char_length(role_title) <= 60),
  level public.member_level not null default 'member',
  division public.member_division not null default 'none',
  year_of_study text,
  degree text,
  joined_year int check (joined_year between 2015 and 2100),
  about text check (char_length(about) <= 300),
  tags text[] not null default '{}' check (cardinality(tags) <= 3),
  currently_building text check (char_length(currently_building) <= 80),
  fun_fact text check (char_length(fun_fact) <= 100),
  photo_url text check (photo_url ~ '^https://'),
  github_url text check (github_url ~ '^https://'),
  linkedin_url text check (linkedin_url ~ '^https://'),
  instagram_url text check (instagram_url ~ '^https://'),
  portfolio_url text check (portfolio_url ~ '^https://'),
  email extensions.citext unique,
  consent_at timestamptz,
  is_published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 120),
  summary text check (char_length(summary) <= 160),
  description text,
  category text,
  status public.event_status not null default 'coming_soon',
  starts_on date,
  date_label text,
  series text,
  cover_url text check (cover_url ~ '^https://'),
  registration_url text check (registration_url ~ '^https://'),
  recap_url text check (recap_url ~ '^https://'),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  image_url text not null check (image_url ~ '^https://'),
  caption text check (char_length(caption) <= 200),
  event_id uuid references public.events(id) on delete set null,
  taken_on date,
  sort_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index gallery_items_event_id_idx on public.gallery_items (event_id);

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  website_url text check (website_url ~ '^https://'),
  logo_url text check (logo_url ~ '^https://'),
  relationship text check (char_length(relationship) <= 140),
  sort_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique check (public_id ~ '^RC[0-9]{2}-[0-9A-HJKMNP-TV-Z]{10}$'),
  event_id uuid not null references public.events(id) on delete restrict,
  type public.certificate_type not null,
  place smallint check (place between 1 and 10),
  recipient_name text not null check (char_length(recipient_name) between 1 and 120),
  name_norm text not null,
  team_name text,
  institution text,
  contact_email extensions.citext,
  email_scope public.email_scope not null default 'team',
  pdf_path text not null,
  pdf_sha256 text not null check (pdf_sha256 ~ '^[0-9a-f]{64}$'),
  status public.certificate_status not null default 'issued',
  issued_on date not null,
  emailed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index certificates_identity_idx on public.certificates (event_id, type, coalesce(team_name, ''), name_norm);
create index certificates_contact_email_idx on public.certificates (contact_email);

create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 1 and 80),
  email extensions.citext not null unique,
  source text not null default 'join',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admins (
  id uuid primary key default gen_random_uuid(),
  email extensions.citext not null unique check (email::text = lower(email::text) and email::text = btrim(email::text)),
  name text,
  is_owner boolean not null default false,
  added_by extensions.citext,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rate_limits (
  key text primary key,
  window_start timestamptz not null,
  hits int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['members', 'events', 'gallery_items', 'partners', 'certificates', 'waitlist', 'admins', 'site_settings', 'rate_limits'] loop
    execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()', t || '_updated_at', t);
    execute format('alter table public.%I enable row level security', t);
  end loop;
end;
$$;

-- Defence in depth (spec 5): client roles get nothing, even with a leaked publishable key.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke execute on functions from public, anon, authenticated;

create function public.hit_rate_limit(p_key text, p_window_seconds int, p_max_hits int) returns boolean
language plpgsql security invoker set search_path = '' as $$
declare v_hits int;
begin
  insert into public.rate_limits as rl (key, window_start, hits)
  values (p_key, now(), 1)
  on conflict (key) do update set
    window_start = case when rl.window_start < now() - make_interval(secs => p_window_seconds) then now() else rl.window_start end,
    hits = case when rl.window_start < now() - make_interval(secs => p_window_seconds) then 1 else rl.hits + 1 end
  returning hits into v_hits;
  return v_hits <= p_max_hits;
end;
$$;
revoke execute on function public.hit_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, int, int) to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('certificates', 'certificates', false, 5242880, array['application/pdf'])
on conflict (id) do nothing;
