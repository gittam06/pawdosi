-- ---------------------------------------------------------------------------
-- lost_found_reports
--
-- The signature feature: a neighbourhood board for lost and found pets.
-- Reports are public to everyone, including signed-out visitors, because the
-- person who recognises the animal may well not have an account.
-- ---------------------------------------------------------------------------

create type public.report_type as enum ('lost', 'found');
create type public.report_status as enum ('open', 'reunited');

create table public.lost_found_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  -- Set only when the reporter is reporting their own registered pet.
  pet_id uuid references public.pets (id) on delete set null,
  type public.report_type not null,
  status public.report_status not null default 'open',
  species public.pet_species not null,
  title text not null,
  description text not null,
  city text not null,
  locality text not null,
  last_seen_at timestamptz not null,
  image_url text,
  image_public_id text,
  contact_note text,
  reunited_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint reports_title_length check (char_length(title) between 3 and 80),
  constraint reports_description_length check (
    char_length(description) between 10 and 1000
  ),
  constraint reports_city_length check (char_length(city) between 2 and 60),
  constraint reports_locality_length check (
    char_length(locality) between 2 and 80
  ),
  constraint reports_contact_note_length check (
    contact_note is null or char_length(contact_note) <= 200
  ),
  constraint reports_image_pair check (
    (image_url is null) = (image_public_id is null)
  ),
  -- `reunited_at` exists exactly when the report is reunited, so "when was it
  -- resolved" can never disagree with "is it resolved".
  constraint reports_reunited_at_matches_status check (
    (status = 'reunited') = (reunited_at is not null)
  )
);

comment on table public.lost_found_reports is
  'Neighbourhood lost and found board. Readable by everyone, including signed-out visitors.';

create trigger lost_found_reports_set_updated_at
  before update on public.lost_found_reports
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.lost_found_reports enable row level security;

create policy "Reports are viewable by everyone"
  on public.lost_found_reports
  for select
  using (true);

-- A report may only be linked to a pet the reporter actually owns, otherwise
-- anyone could attach a stranger's pet to a report.
create policy "Users can file their own reports"
  on public.lost_found_reports
  for insert
  to authenticated
  with check (
    (select auth.uid()) = reporter_id
    and (
      pet_id is null
      or exists (
        select 1
        from public.pets
        where pets.id = lost_found_reports.pet_id
          and pets.owner_id = (select auth.uid())
      )
    )
  );

create policy "Users can update their own reports"
  on public.lost_found_reports
  for update
  to authenticated
  using ((select auth.uid()) = reporter_id)
  with check ((select auth.uid()) = reporter_id);

create policy "Users can delete their own reports"
  on public.lost_found_reports
  for delete
  to authenticated
  using ((select auth.uid()) = reporter_id);

-- ---------------------------------------------------------------------------
-- Indexes
--
-- The board is browsed by city, filtered by status, newest first — which is
-- exactly this index, left to right.
-- ---------------------------------------------------------------------------

create index reports_city_status_created_at_idx
  on public.lost_found_reports (lower(city), status, created_at desc, id desc);

-- The unfiltered board, and the keyset cursor behind it.
create index reports_created_at_id_idx
  on public.lost_found_reports (created_at desc, id desc);

create index reports_reporter_id_idx
  on public.lost_found_reports (reporter_id);
