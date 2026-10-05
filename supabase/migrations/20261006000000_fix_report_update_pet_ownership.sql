-- ---------------------------------------------------------------------------
-- lost_found_reports: close the pet-ownership hole in the UPDATE policy
--
-- The INSERT policy has always required that a linked `pet_id` belong to the
-- reporter. The UPDATE policy only checked `reporter_id`, so the rule was
-- bypassable in two steps: file a report with `pet_id` null, then update
-- `pet_id` to any pet in the table. The browser holds a working anon-key JWT,
-- so this needed no more than a PATCH to PostgREST — the Server Actions were
-- never in the way.
--
-- Verified before the fix, as two freshly created users:
--   INSERT ... pet_id = <victim's pet>   -> 403, blocked
--   PATCH  ... pet_id = <victim's pet>   -> 200, applied
--
-- The condition is identical to the INSERT policy's, which is the point: the
-- two must say the same thing, or the weaker one is the real rule.
-- ---------------------------------------------------------------------------

-- `if exists` so a re-run cannot leave the table with no UPDATE policy at all,
-- which would silently break "Mark as reunited" rather than fail loudly.
drop policy if exists "Users can update their own reports"
  on public.lost_found_reports;

create policy "Users can update their own reports"
  on public.lost_found_reports
  for update
  to authenticated
  using ((select auth.uid()) = reporter_id)
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

comment on table public.lost_found_reports is
  'Neighbourhood lost and found board. Readable by everyone, including signed-out visitors. A linked pet_id must belong to the reporter — enforced identically on INSERT and UPDATE.';
