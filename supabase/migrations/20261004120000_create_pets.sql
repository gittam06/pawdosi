-- ---------------------------------------------------------------------------
-- pets
--
-- The social profile of the app. A user owns several; each has its own public
-- page at /pets/<slug>.
-- ---------------------------------------------------------------------------

create type public.pet_species as enum ('dog', 'cat', 'bird', 'rabbit', 'other');
create type public.pet_gender as enum ('male', 'female', 'unknown');

create table public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  slug text not null unique,
  species public.pet_species not null,
  breed text,
  birth_date date,
  gender public.pet_gender not null default 'unknown',
  bio text,
  avatar_url text,
  avatar_public_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint pets_name_length check (char_length(name) between 1 and 40),
  -- Lowercase, hyphen separated, no leading/trailing/double hyphens.
  constraint pets_slug_format check (
    slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    and char_length(slug) between 3 and 60
  ),
  constraint pets_breed_length check (
    breed is null or char_length(breed) between 1 and 60
  ),
  constraint pets_bio_length check (bio is null or char_length(bio) <= 300),
  -- A CHECK constraint must be immutable, so "not in the future" is enforced
  -- in Zod; this only rules out obvious nonsense.
  constraint pets_birth_date_floor check (
    birth_date is null or birth_date >= date '1980-01-01'
  ),
  constraint pets_avatar_pair check (
    (avatar_url is null) = (avatar_public_id is null)
  )
);

comment on table public.pets is
  'A pet profile. This — not the human profile — is what other users follow.';

create trigger pets_set_updated_at
  before update on public.pets
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Pet pages are public. Everything else is owner-only, and `owner_id` is
-- checked on update as well as insert so a pet cannot be handed to someone
-- else by editing the row.
-- ---------------------------------------------------------------------------

alter table public.pets enable row level security;

create policy "Pets are viewable by everyone"
  on public.pets
  for select
  using (true);

create policy "Users can create their own pets"
  on public.pets
  for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Users can update their own pets"
  on public.pets
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Users can delete their own pets"
  on public.pets
  for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

-- ---------------------------------------------------------------------------
-- Indexes
--
-- `slug unique` already creates an index for the public page lookup.
-- ---------------------------------------------------------------------------

-- "my pets, newest first"
create index pets_owner_id_created_at_idx
  on public.pets (owner_id, created_at desc);

-- Explore and species filters later on.
create index pets_species_created_at_idx
  on public.pets (species, created_at desc);
