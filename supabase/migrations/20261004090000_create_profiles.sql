-- ---------------------------------------------------------------------------
-- profiles
--
-- One row per auth user, created automatically by a trigger on signup.
-- `username` and `city` start NULL and are filled in during onboarding, so
-- "has this user onboarded?" is simply "are both columns set?".
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  display_name text not null,
  avatar_url text,
  avatar_public_id text,
  city text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Usernames are stored lowercase so uniqueness is case-insensitive without
  -- needing the citext extension.
  constraint profiles_username_format check (
    username is null
    or (username ~ '^[a-z0-9_]{3,24}$')
  ),
  constraint profiles_display_name_length check (
    char_length(display_name) between 1 and 50
  ),
  constraint profiles_city_length check (
    city is null or char_length(city) between 2 and 60
  ),
  constraint profiles_bio_length check (
    bio is null or char_length(bio) <= 300
  ),
  -- An avatar is either fully present or fully absent: a URL without its
  -- public_id would be an asset we could never delete from Cloudinary.
  constraint profiles_avatar_pair check (
    (avatar_url is null) = (avatar_public_id is null)
  )
);

comment on table public.profiles is
  'Public profile of an authenticated user. The pet is the social profile; this is the human behind it.';

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create a profile on signup
--
-- SECURITY DEFINER with an empty search_path and fully qualified names: this
-- function runs with the owner's rights, so an attacker-controlled search_path
-- must not be able to resolve `profiles` to something else.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    -- OAuth providers give us a name; email signup falls back to the local
    -- part of the address. Onboarding lets the user change it either way.
    left(
      coalesce(
        nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
        nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
        nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
        split_part(new.email, '@', 1),
        'New member'
      ),
      50
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Profiles are public (they appear next to pets and reports). Writes are
-- restricted to the owner. There is no delete policy: profiles die with their
-- auth user through the cascade.
--
-- `(select auth.uid())` rather than `auth.uid()` lets Postgres evaluate the
-- call once per statement instead of once per row.
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles
  for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

-- `username unique` already creates an index. City is used by Lost & Found
-- filters later, and lower(city) keeps the lookup case-insensitive.
create index profiles_city_idx on public.profiles (lower(city));
