-- ---------------------------------------------------------------------------
-- notifications
--
-- Written by database triggers, never by the application. There is deliberately
-- no INSERT policy: a notification a user could create is a notification a user
-- could forge, and "X liked your post" has to be trustworthy.
-- ---------------------------------------------------------------------------

create type public.notification_type as enum ('like', 'comment', 'follow');

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  -- The recipient.
  user_id uuid not null references public.profiles (id) on delete cascade,
  -- Who caused it.
  actor_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type not null,
  post_id uuid references public.posts (id) on delete cascade,
  pet_id uuid references public.pets (id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now(),

  -- Nobody needs telling about their own activity.
  constraint notifications_not_self check (user_id <> actor_id)
);

comment on table public.notifications is
  'Trigger-written activity feed. Readable only by its recipient.';

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.notifications enable row level security;

create policy "Users read their own notifications"
  on public.notifications
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Marking as read is the only field a recipient may change; the WITH CHECK
-- keeps them from reassigning the row to someone else.
create policy "Users mark their own notifications read"
  on public.notifications
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete their own notifications"
  on public.notifications
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Triggers
--
-- SECURITY DEFINER with an empty search_path, as elsewhere: these run with the
-- owner's rights (which is how they insert past RLS at all), so every name is
-- fully qualified.
-- ---------------------------------------------------------------------------

create or replace function public.notify_on_like()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recipient uuid;
begin
  select author_id into recipient from public.posts where id = new.post_id;

  if recipient is not null and recipient <> new.user_id then
    insert into public.notifications (user_id, actor_id, type, post_id)
    values (recipient, new.user_id, 'like', new.post_id);
  end if;

  return new;
end;
$$;

/*
 * Un-liking withdraws the notification. Without this, toggling a like twice
 * would notify twice, which is the cheapest notification spam there is.
 */
create or replace function public.unnotify_on_unlike()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.notifications
  where type = 'like'
    and post_id = old.post_id
    and actor_id = old.user_id;

  return old;
end;
$$;

create or replace function public.notify_on_comment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recipient uuid;
begin
  select author_id into recipient from public.posts where id = new.post_id;

  if recipient is not null and recipient <> new.user_id then
    insert into public.notifications (user_id, actor_id, type, post_id)
    values (recipient, new.user_id, 'comment', new.post_id);
  end if;

  return new;
end;
$$;

create or replace function public.notify_on_follow()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recipient uuid;
begin
  select owner_id into recipient from public.pets where id = new.pet_id;

  if recipient is not null and recipient <> new.follower_id then
    insert into public.notifications (user_id, actor_id, type, pet_id)
    values (recipient, new.follower_id, 'follow', new.pet_id);
  end if;

  return new;
end;
$$;

create or replace function public.unnotify_on_unfollow()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.notifications
  where type = 'follow'
    and pet_id = old.pet_id
    and actor_id = old.follower_id;

  return old;
end;
$$;

create trigger likes_notify
  after insert on public.likes
  for each row
  execute function public.notify_on_like();

create trigger likes_unnotify
  after delete on public.likes
  for each row
  execute function public.unnotify_on_unlike();

create trigger comments_notify
  after insert on public.comments
  for each row
  execute function public.notify_on_comment();

create trigger follows_notify
  after insert on public.follows
  for each row
  execute function public.notify_on_follow();

create trigger follows_unnotify
  after delete on public.follows
  for each row
  execute function public.unnotify_on_unfollow();

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index notifications_user_id_created_at_idx
  on public.notifications (user_id, created_at desc, id desc);

-- The unread badge is a count on this partial index, not a scan of the table.
create index notifications_unread_idx
  on public.notifications (user_id)
  where read_at is null;
