# PawPals — Design system

The single reference for how PawPals looks. Every token lives in
`src/app/globals.css`; this document explains **why** each value is what it is.
If a screen needs a colour, a radius or a shadow that is not listed here, add it
as a token first, then use it.

---

## 1. Design principles

1. **The photo is the subject.** Surfaces are quiet off-whites and warm
   charcoals. Colour is reserved for actions, status and brand moments, so a
   dog's photo is never competing with the chrome around it.
2. **Warm, not cute.** Rounded geometry and a marigold accent give the
   friendliness; restrained spacing and real typography keep it trustworthy.
   Nothing wobbles, nothing bounces for decoration.
3. **Lost & Found is serious.** It borrows the same shapes but switches to its
   own alert palette. An open lost report must read as urgent in a glance —
   without looking like a system error.
4. **Mobile is the real product.** Phones get a bottom tab bar, thumb-reachable
   actions and full-width media. Desktop is the same layout, widened.
5. **Every state is designed.** Loading, empty and error states are part of a
   feature, not an afterthought.

---

## 2. Colour

All colours are authored in **OKLCH**, not hex. OKLCH is perceptually uniform,
so "same lightness, different hue" actually looks like the same lightness — this
is what makes the light/dark pairs below predictable instead of guesswork.

Each semantic colour comes as up to four tokens:

| Suffix               | Use                                                  |
| -------------------- | ---------------------------------------------------- |
| `--x`                | Solid fill (buttons, badges, bars)                   |
| `--x-foreground`     | Text/icons **on** that solid fill                    |
| `--x-muted`          | Soft tinted surface (chips, icon tiles, callouts)    |
| `--x-muted-foregrnd` | Text/icons on the soft surface (`-muted-foreground`) |

### Brand

| Token     | Light                    | Dark                    | Role                                                             |
| --------- | ------------------------ | ----------------------- | ---------------------------------------------------------------- |
| `primary` | `oklch(0.615 0.175 45)`  | `oklch(0.735 0.155 58)` | **Marigold.** Primary actions, active nav, focus ring, logo tile |
| `teal`    | `oklch(0.6 0.085 195)`   | `oklch(0.72 0.085 195)` | **Soft teal.** Secondary brand note, counts, informational chips |
| `accent`  | `oklch(0.955 0.022 195)` | `oklch(0.31 0.03 195)`  | Hover/highlight tint — a pale teal, not a grey                   |

Marigold is deliberately _darker_ than a typical orange (L 0.615, not 0.75): at
that lightness white text on it clears the 4.5:1 contrast requirement, so the
primary button needs no special-casing. Dark mode inverts the relationship — a
brighter marigold with near-black text on top.

### Status

| Token         | Light                   | Dark                    | Role                                    |
| ------------- | ----------------------- | ----------------------- | --------------------------------------- |
| `alert`       | `oklch(0.555 0.185 15)` | `oklch(0.675 0.17 17)`  | **Open lost report.** Urgent rose       |
| `success`     | `oklch(0.555 0.12 150)` | `oklch(0.68 0.125 152)` | **Reunited.** Calm celebratory green    |
| `destructive` | `oklch(0.545 0.2 25)`   | `oklch(0.68 0.19 25)`   | Irreversible actions (delete pet, post) |

`alert` sits at hue 15 (rose) while `primary` sits at hue 45 (orange) and
`destructive` at 25 (red). Three distinct warm hues, in increasing order of
"this is a problem": brand → urgent → destructive. A "lost" badge can therefore
never be mistaken for a delete button.

### Surfaces

| Token        | Light                   | Dark                    |
| ------------ | ----------------------- | ----------------------- |
| `background` | `oklch(0.988 0.004 85)` | `oklch(0.195 0.012 60)` |
| `card`       | `oklch(1 0 0)`          | `oklch(0.235 0.013 60)` |
| `muted`      | `oklch(0.962 0.008 85)` | `oklch(0.275 0.013 60)` |
| `border`     | `oklch(0.9 0.008 80)`   | `oklch(1 0 0 / 11%)`    |

Neither mode uses pure white or pure black. The light canvas carries a trace of
warmth (chroma 0.004 at hue 85) so white cards lift off it; the dark canvas is a
warm charcoal, which keeps photo contrast believable where pure black crushes it.

### Contrast rules

- Body text and UI labels: ≥ 4.5:1 against their surface.
- `muted-foreground` is the floor for readable secondary text — do not go lighter.
- Never pair a `-muted` surface with a solid `-foreground`, or vice versa; the
  pairs above are the only approved combinations.
- Status is never communicated by colour alone: every badge carries a label and
  an icon.

---

## 3. Typography

| Role    | Family       | Token                             |
| ------- | ------------ | --------------------------------- |
| Body    | **Inter**    | `--font-sans` / `font-sans`       |
| Heading | **Nunito**   | `--font-heading` / `font-heading` |
| Mono    | system stack | `--font-mono` / `font-mono`       |

Inter for body: a large x-height and unambiguous letterforms keep captions and
metadata readable at 13–14px on a phone. Nunito for headings: rounded terminals
echo the rounded UI geometry and supply the warmth, applied only at heading
sizes where the personality reads as friendly rather than childish.

Both are loaded through `next/font/google` with `display: "swap"`, self-hosted
at build time — no layout shift, no third-party request. Mono is the system
stack: it appears only in error references, so it is not worth a download.

`h1`–`h4` get `font-heading tracking-tight` automatically from the base layer.

**Scale** (Tailwind defaults, used deliberately):

| Use                  | Classes                                           |
| -------------------- | ------------------------------------------------- |
| Hero                 | `text-4xl sm:text-5xl md:text-6xl font-extrabold` |
| Page title           | `text-2xl font-bold`                              |
| Card / section title | `text-lg font-semibold`                           |
| Body                 | `text-sm` (UI) / `text-base` (prose)              |
| Metadata, timestamps | `text-xs text-muted-foreground`                   |

Use `text-balance` on headings and `text-pretty` on paragraphs — it costs
nothing and prevents orphaned words.

---

## 4. Shape and depth

```
--radius: 0.875rem   /* 14px — the one number everything derives from */
```

| Token          | Value  | Use                             |
| -------------- | ------ | ------------------------------- |
| `rounded-sm`   | 7px    | Inline chips, tight badges      |
| `rounded-md`   | 10.5px | Inputs, small buttons           |
| `rounded-lg`   | 14px   | Buttons, nav items, icon tiles  |
| `rounded-xl`   | 18px   | Icon tiles, avatars-as-squares  |
| `rounded-2xl`  | 24px   | Cards (post card, report card)  |
| `rounded-3xl`  | 31px   | Hero panels, large empty states |
| `rounded-full` | —      | Pet avatars, pills, counts      |

Shadows use **theme-aware tints**: `--shadow-a/b/c` hold the shadow colour and
are redefined in `.dark`, while the four shadow utilities reference them. Light
mode tints are warm and faint (a warm UI with a cold grey shadow looks dirty);
dark mode switches to deeper neutral black, because a warm shadow on charcoal
turns muddy.

| Token         | Use                                     |
| ------------- | --------------------------------------- |
| `shadow-soft` | Resting buttons, the logo tile          |
| `shadow-card` | Cards at rest                           |
| `shadow-lift` | Card hover, sticky header once scrolled |
| `shadow-pop`  | Dialogs, dropdowns, toasts              |

Borders do the structural work and shadows only suggest elevation — never both
at full strength on the same element.

---

## 5. Layout and spacing

| Token        | Value | Use                                     |
| ------------ | ----- | --------------------------------------- |
| `max-w-page` | 72rem | Page shell (header, footer, grids)      |
| `max-w-feed` | 34rem | Single-column post feed and post detail |

Spacing uses Tailwind's 4px scale, limited to a short rhythm so pages agree with
each other:

- `gap-2` inside a control, `gap-3`/`gap-4` between related elements
- `gap-4` between cards in a grid
- `py-16 sm:py-24` for page sections
- `px-4 sm:px-6` for the page gutter — always both, never one

Breakpoints: design at 390px first. `sm` (640px) relaxes the gutter, `md`
(768px) is where the bottom tab bar is replaced by header nav, `lg` (1024px)
introduces the third grid column.

---

## 6. Component patterns

Built on shadcn/ui primitives in `src/components/ui/`, which are themed through
the CSS variables above — never restyled with one-off colours.

| Component        | Location                      | Notes                                               |
| ---------------- | ----------------------------- | --------------------------------------------------- |
| `Logo`           | `components/brand/logo.tsx`   | Marigold tile + paw mark; tilts on hover            |
| `SiteHeader`     | `components/layout/`          | Sticky, translucent, blurred; server component      |
| `MainNav`        | `components/layout/`          | Desktop (`md+`); active item on `primary-muted`     |
| `MobileNav`      | `components/layout/`          | Bottom tab bar below `md`, respects safe-area inset |
| `ThemeToggle`    | `components/theme-toggle.tsx` | Light / dark / system; icon swap is pure CSS        |
| `UserMenu`       | `components/layout/`          | Account dropdown; sign-out is a real form post      |
| `UserAvatar`     | `components/user-avatar.tsx`  | Cloudinary square crop with an initials fallback    |
| `AvatarUploader` | `components/upload/`          | Signed direct upload, toast feedback                |

Planned app components, each composed from the primitives rather than styled ad
hoc: `PostCard`, `PetAvatar`, `PetCard`, `ReportCard`, `StatusBadge`,
`EmptyState`.

### Forms

Forms post to Server Actions and read their result with `useActionState`. There
is no form library: the Zod schema that validates on the server is the only
source of truth, and the same error shape drives the UI.

| Piece           | Location                              | Role                                          |
| --------------- | ------------------------------------- | --------------------------------------------- |
| `TextField`     | `components/forms/fields.tsx`         | Label + input + hint + errors, wired for a11y |
| `TextAreaField` | `components/forms/fields.tsx`         | Same, for multi-line                          |
| `PasswordField` | `components/forms/password-field.tsx` | Input with a reveal toggle                    |
| `SubmitButton`  | `components/forms/submit-button.tsx`  | `useFormStatus` spinner and disabled state    |
| `FormAlert`     | `components/forms/form-alert.tsx`     | Form-level success / failure summary          |

Rules:

- Field errors render directly under their input, in `destructive`, linked by
  `aria-describedby` **and** announced via `role="alert"`.
- The input gets `aria-invalid` so the error is also conveyed non-visually.
- The form-level alert states what to do ("Please fix the highlighted fields"),
  never a raw server message.
- Text inputs are **controlled**. React 19 resets an uncontrolled form once its
  action settles, which would erase everything the user typed on a validation
  failure. Password inputs stay uncontrolled — clearing them is correct.
- Buttons show a pending label, not just a spinner.

### Interaction

- Focus is always visible: `focus-visible:ring-3 focus-visible:ring-ring/50`
  (the ring is marigold, so focus reads as brand, not browser default).
- Hover on neutral elements goes to `accent` (pale teal), not grey.
- Buttons shift down 1px when pressed — the only "physical" flourish in the UI.
- Transitions are 150–200ms on colour and shadow. No layout animation.
- `prefers-reduced-motion: reduce` disables animation globally (base layer).

### Required states

Every data view ships four states:

1. **Loading** — `Skeleton` blocks matching the real layout's shape, plus an
   `sr-only role="status"` announcement. Never a spinner alone.
2. **Empty** — an icon tile, one sentence explaining what will appear here, and
   the action that fills it.
3. **Error** — plain language, the failure reference if there is one, and a
   retry affordance.
4. **Loaded**.

---

## 7. Accessibility checklist

- Semantic landmarks: one `<header>`, one `<main id="main">`, one `<footer>`,
  `<nav aria-label>` on each navigation.
- "Skip to content" link is the first focusable element.
- Every image has meaningful `alt`; decorative icons are `aria-hidden`.
- Icon-only controls carry `aria-label`.
- Active nav items use `aria-current="page"`.
- Colour is never the only signal (status badges pair colour + icon + text).
- The whole app is keyboard operable; focus order follows reading order.
- Light and dark are both checked for contrast, not just light.
