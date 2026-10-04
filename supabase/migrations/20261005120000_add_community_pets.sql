-- ---------------------------------------------------------------------------
-- Community animals
--
-- A pet profile can describe an animal nobody owns: the street dog three
-- people on the road feed, the cat that lives behind the shop. The row shape
-- is identical — same posts, same followers, same Lost & Found link — because
-- the only thing that differs is the relationship, not the animal.
--
-- Modelled as a flag rather than a nullable owner: somebody still has to be
-- accountable for the profile, and "who may edit this" has to stay answerable.
-- `owner_id` means caretaker here, and the UI says so.
-- ---------------------------------------------------------------------------

alter table public.pets
  add column is_community boolean not null default false;

comment on column public.pets.is_community is
  'True when this animal is not owned — a street or community animal. owner_id is then the caretaker who added it.';

-- Explore and the landing page both want "community animals, newest first".
create index pets_community_created_at_idx
  on public.pets (created_at desc)
  where is_community;
