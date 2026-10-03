<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# PawPals — working rules

A web-based social community where **the pet is the profile**. Owners create
profiles for their pets, post photos, follow other pets, like and comment. The
signature feature Instagram does not have: a neighbourhood **Lost & Found**
board (primary audience: pet owners in Indian cities).

Portfolio project. Code quality, clear structure, security and a working live
deployment matter more than feature count.

## Stack (do not change without asking)

Next.js 16 (App Router, TypeScript, Server Components + Server Actions) ·
Supabase (Postgres, Auth, RLS) via `@supabase/ssr` · Cloudinary for all images
(signed uploads only) · Tailwind CSS v4 · shadcn/ui (lucide icons) · Zod ·
deployed on Vercel.

Do not add libraries without a clear reason; if you do, justify it in the
commit message.

## Hard rules

- Strict TypeScript. No `any`.
- Validate every input with Zod **on the server**, not only in the client.
- Never trust the client for ownership. Authorisation is RLS + `auth.uid()`.
- `CLOUDINARY_API_SECRET` and `SUPABASE_SERVICE_ROLE_KEY` never reach the client.
- Schema changes go through SQL migrations in `supabase/migrations/`, then
  `npm run db:types`.
- Keep data fetching on the server where possible; small reusable components.
- Handle and display errors. Never fail silently.
- Every data view needs loading, empty and error states.
- Conventional commits, small and descriptive.
- Design decisions belong in `docs/DESIGN.md`; use the tokens defined there
  instead of one-off colours, radii or shadows.

## Next.js 16 specifics already hit in this repo

- The `middleware` file convention is gone — this project uses `src/proxy.ts`
  exporting `proxy()`.
- `next.config.ts` no longer accepts an `eslint` key.
- `cookies()` is async, so `createClient()` in `lib/supabase/server.ts` is async.
- Tailwind v4 has no `tailwind.config.js`; the theme lives in
  `src/app/globals.css` under `@theme inline`.
- shadcn's current CLI imports `cn` from the `cn` package and uses the single
  `radix-ui` package.
- React 19 resets an uncontrolled `<form action={…}>` once the action settles,
  so text inputs that must survive a validation error are controlled.
- Pages that branch on the session need `export const dynamic = "force-dynamic"`:
  a build without Supabase credentials would otherwise prerender them as
  "signed out" and serve that snapshot to everyone.

## Established patterns — follow these in later phases

- Server Actions return an `ActionState` (`@/lib/action-state`); forms read it
  with `useActionState` and render errors through `components/forms/*`.
- Auth guards: `requireUser()` / `requireOnboardedProfile()` from `@/lib/auth`.
  Never re-implement a session check inline.
- Images: `POST /api/cloudinary/sign` → direct browser upload → a Server Action
  that calls `verifyUploadedImage()` before storing anything, and
  `deleteAsset()` for the asset it replaced.
- Database types come from `@/lib/types`, never from the generated file.
- Deleting a Cloudinary asset uses the `public_id` read back from the database
  under the owner's RLS, never one supplied by the client — a forged id would
  otherwise delete someone else's image.
- Icons chosen by data go through a `switch`-based component (see
  `components/pets/species-icon.tsx`). Picking a component out of a map during
  render trips `react-hooks/static-components`.

## Build plan

Work **one phase at a time**. After each phase: run `npm run lint`,
`npm run typecheck`, `npm run build`, fix everything, summarise, then stop and
wait for approval.

0. Setup — scaffold, Supabase clients, design tokens, base layout. ✅
1. Auth & user profiles — email/password, onboarding (username + city),
   protected routes in `proxy.ts`, edit profile and avatar. ✅
2. Pet profiles — CRUD, public page at `/pets/[slug]`. ✅
3. Posts & feed — 1–4 images + caption, home feed from followed pets, Explore,
   post detail, cursor pagination (`created_at` + `id`), never offset.
4. Social — likes (optimistic), comments, follow/unfollow pets, counts.
5. Lost & Found — reports with photo/area/last-seen, filters, detail page,
   "Reunited" state.
6. Polish & ship — notifications, search, infinite scroll, SEO + OG images,
   seed script, Vitest + Playwright tests, deploy.

Out of scope for now: mobile app, DMs, video, stories, ads, admin dashboard.
