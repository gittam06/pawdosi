-- ---------------------------------------------------------------------------
-- likes, comments
--
-- `follows` already exists (it shipped with the feed). These complete the
-- social layer.
-- ---------------------------------------------------------------------------

create table public.likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),

  -- The composite key is the uniqueness rule: one like per user per post,
  -- enforced by the index rather than by a read-then-write race.
  primary key (user_id, post_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),

  constraint comments_body_length check (char_length(body) between 1 and 500)
);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Counts are public (they appear on every card), writes are the author's own.
-- ---------------------------------------------------------------------------

alter table public.likes enable row level security;
alter table public.comments enable row level security;

create policy "Likes are viewable by everyone"
  on public.likes
  for select
  using (true);

create policy "Users can like as themselves"
  on public.likes
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can remove their own like"
  on public.likes
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Comments are viewable by everyone"
  on public.comments
  for select
  using (true);

create policy "Users can comment as themselves"
  on public.comments
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- Comment authors delete their own. The post's author may also remove a
-- comment from their own post — moderation of your own page.
create policy "Users can delete their own comments or ones on their posts"
  on public.comments
  for delete
  to authenticated
  using (
    (select auth.uid()) = user_id
    or exists (
      select 1
      from public.posts
      where posts.id = comments.post_id
        and posts.author_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- Indexes
--
-- The primary key already indexes likes by (user_id, post_id); counting a
-- post's likes needs the other direction.
-- ---------------------------------------------------------------------------

create index likes_post_id_idx on public.likes (post_id);

create index comments_post_id_created_at_idx
  on public.comments (post_id, created_at);
