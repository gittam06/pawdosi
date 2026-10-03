-- ---------------------------------------------------------------------------
-- posts, post_images, follows
--
-- A post belongs to a pet (the voice) and to a profile (the human who wrote
-- it). `follows` is created here rather than with the follow UI because the
-- home feed needs it from day one.
-- ---------------------------------------------------------------------------

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  caption text,
  created_at timestamptz not null default now(),

  constraint posts_caption_length check (
    caption is null or char_length(caption) <= 2200
  )
);

comment on table public.posts is
  'A moment posted as a pet. author_id is the human; pet_id is whose profile it appears on.';

-- "position" is a SQL keyword, so it stays quoted throughout.
create table public.post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  url text not null,
  public_id text not null,
  width integer not null,
  height integer not null,
  "position" smallint not null,
  created_at timestamptz not null default now(),

  -- Four images per post, enforced by the range plus the unique slot below
  -- rather than by counting rows in a trigger.
  constraint post_images_position_range check ("position" between 0 and 3),
  constraint post_images_dimensions check (width > 0 and height > 0),
  constraint post_images_unique_slot unique (post_id, "position")
);

create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  created_at timestamptz not null default now(),

  primary key (follower_id, pet_id)
);

comment on table public.follows is
  'A user follows a pet, never another user.';

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.posts enable row level security;
alter table public.post_images enable row level security;
alter table public.follows enable row level security;

create policy "Posts are viewable by everyone"
  on public.posts
  for select
  using (true);

-- Posting as a pet requires owning that pet, not merely being signed in.
create policy "Users can post as their own pets"
  on public.posts
  for insert
  to authenticated
  with check (
    (select auth.uid()) = author_id
    and exists (
      select 1
      from public.pets
      where pets.id = posts.pet_id
        and pets.owner_id = (select auth.uid())
    )
  );

create policy "Users can delete their own posts"
  on public.posts
  for delete
  to authenticated
  using ((select auth.uid()) = author_id);

create policy "Post images are viewable by everyone"
  on public.post_images
  for select
  using (true);

-- Image rows inherit their permission from the post they hang off.
create policy "Users can add images to their own posts"
  on public.post_images
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.posts
      where posts.id = post_images.post_id
        and posts.author_id = (select auth.uid())
    )
  );

create policy "Users can delete images from their own posts"
  on public.post_images
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.posts
      where posts.id = post_images.post_id
        and posts.author_id = (select auth.uid())
    )
  );

create policy "Follows are viewable by everyone"
  on public.follows
  for select
  using (true);

create policy "Users can follow pets as themselves"
  on public.follows
  for insert
  to authenticated
  with check ((select auth.uid()) = follower_id);

create policy "Users can unfollow"
  on public.follows
  for delete
  to authenticated
  using ((select auth.uid()) = follower_id);

-- ---------------------------------------------------------------------------
-- Indexes
--
-- Feed and Explore page with a keyset cursor on (created_at, id), so the
-- indexes carry both columns in the same order the queries sort by.
-- ---------------------------------------------------------------------------

create index posts_created_at_id_idx
  on public.posts (created_at desc, id desc);

create index posts_pet_id_created_at_idx
  on public.posts (pet_id, created_at desc, id desc);

create index post_images_post_id_position_idx
  on public.post_images (post_id, "position");

create index follows_follower_id_idx on public.follows (follower_id);
create index follows_pet_id_idx on public.follows (pet_id);
