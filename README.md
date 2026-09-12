# Ross County FC — Mock Website

Early scaffold for a Ross County FC website: a public marketing site plus an
admin panel intended to run on an `admin.` subdomain. No real club data is
populated yet — every page is a labelled placeholder.

## Stack

- **Next.js (App Router) + TypeScript + Tailwind CSS v4**
- **Poppins** as the site-wide font (`next/font/google`)
- **Supabase** for data + auth (not yet connected — see below)
- Deploy target: **Vercel**

## Project structure

```
src/app/(site)/        Public pages (Home, Tickets, Fixtures, News, Club,
                        Commercial, Squads, Hospitality) — shared header/footer.
src/app/shop/           Route handler that redirects to the Shopify store
                        (NEXT_PUBLIC_SHOP_URL). Falls back to a "not
                        configured" notice until that env var is set.
src/app/admin/login/    Admin sign-in (Supabase Auth, email + password).
src/app/admin/(protected)/
                        Admin panel pages (Dashboard, News, Fixtures, Squads,
                        Tickets, Club, Commercial, Hospitality, Settings),
                        guarded by Supabase auth. Fixtures & Results (which
                        also holds the current-competition and API-Football
                        sync config) and News are wired up to Supabase; the
                        rest are still placeholders.
src/proxy.ts            Rewrites the `admin.` subdomain to /admin, and
                        refreshes the Supabase session cookie. (Next.js 16's
                        replacement for middleware.ts.)
src/lib/supabase/       Browser + server Supabase client helpers.
src/lib/fixtures/       Types + read queries shared by the public Fixtures
                        page and the admin Fixtures & Results page.
src/lib/news/           Types, read queries, slug helper and status-label
                        helper shared by the public News pages and the
                        admin News CRUD.
src/lib/nav.ts          Single source of truth for the public + admin nav.
supabase/migrations/    SQL schema — run these, in order, against your
                        Supabase project before the corresponding feature
                        will show data:
                          0001 — fixtures, league table, site_settings
                          0002 — API-Football sync config
                          0003 — news articles, categories, image storage
                          0004 — drops the news author_name column
```

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in Supabase project details when ready
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site and
[http://localhost:3000/admin](http://localhost:3000/admin) for the admin
panel (locally, since there's no subdomain in dev).

Without Supabase env vars set, the admin panel shows a "not connected yet"
notice instead of crashing — the public site works either way.

## Connecting Supabase (when ready)

1. Create a Supabase project.
2. Copy the Project URL and anon/publishable key into `.env.local`
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). That's
   the only Supabase config this app needs right now — ignore the
   `service_role`/secret key for now, nothing here uses it yet.
3. In Supabase Auth, create the admin user(s) who should be able to log in
   at `/admin/login`. There's no self-service sign-up — admin accounts are
   provisioned manually for now.
4. Run the SQL in `supabase/migrations/` **in numeric order** (0001 through
   the latest) against your project (SQL Editor, or the Supabase CLI).
5. In `/admin/fixtures`, pick the club's current competition — this
   controls what that page manages and what the public Fixtures page shows.
6. Add the same env vars in Vercel's project settings for production.

## Admin subdomain on Vercel

The admin panel is just `/admin` inside the same Next.js app — `src/proxy.ts`
rewrites any request whose `Host` header starts with `admin.` into that route
tree. To go live:

1. Add both the apex/`www` domain and `admin.<yourdomain>` to the same Vercel
   project (Project → Settings → Domains).
2. Point their DNS at Vercel as instructed there.
3. No extra code changes needed — visiting `admin.<yourdomain>` will serve
   the same pages as `<yourdomain>/admin`.

## Shop link

`/shop` is a route handler, not a page — it redirects to `NEXT_PUBLIC_SHOP_URL`.
Set that once the Shopify store link is available; until then it redirects to
a small "not configured" notice.

## Fixtures & League Table

Ross County's own fixtures (not every match in the division) plus a
manually-entered league table, scoped to whichever competition is picked at
the top of `/admin/fixtures`:

- `/admin/fixtures` — add/edit/delete fixtures (opponent, home/away,
  kick-off, ground, result) and league table rows (every team, P/W/D/L/GF/GA/Pts).
- `/fixtures` — public page: next match banner, upcoming fixtures, recent
  results, full league table (Ross County's row highlighted).

There's no official SPFL/SFA/BBC public API — SPFL's data rights are
exclusively licensed to Stats Perform/Opta (a commercial B2B feed). Worth
asking the club whether they already have an Opta feed/widget as part of
SPFL membership. Absent that, `/admin/fixtures` has two buttons — **Pull
latest fixtures** and **Pull latest league table** — that call
[api-football.com](https://www.api-football.com/)'s free tier on demand.
There's no automatic daily sync by design: press the buttons after a match,
not on a schedule. Manually-added fixtures are untouched by a sync (only
rows the API itself created get updated); the league table sync fully
replaces the table for the current competition each time, since standings
are always returned complete.

**Setting up the API-Football sync:**

1. Sign up free at [api-football.com](https://www.api-football.com/) (100
   requests/day, no card required) and grab your API key from the
   dashboard.
2. Add it as `API_FOOTBALL_KEY` in `.env.local` (and in Vercel for
   production). This is separate from Supabase.
3. Find the league IDs and Ross County's team ID by calling the API
   directly, e.g.:
   ```bash
   curl -H "x-apisports-key: YOUR_KEY" \
     "https://v3.football.api-sports.io/leagues?search=Scotland"
   curl -H "x-apisports-key: YOUR_KEY" \
     "https://v3.football.api-sports.io/teams?name=Ross%20County"
   ```
   Each result's `id` field is what you need. These aren't hardcoded
   anywhere in the codebase since they should come from the API itself,
   not be guessed.
4. In `/admin/fixtures`, enter the season (e.g. `2025` for the 2025/26
   season), Ross County's team ID, and the league ID for each competition
   you might need (only the currently-selected one has to be filled in to
   start syncing).

**Caveat: the free API-Football plan doesn't cover the current season.**
Hitting either sync button with the current season entered (e.g. `2025`)
fails with:
```
API-Football error: {"plan":"Free plans do not have access to this season, try from 2022 to 2024."}
```
The free tier only serves historical seasons (2022–2024) — not live/current
ones. To use the sync for real, current-season data you'll need a paid
API-Football plan (check [api-football.com/pricing](https://www.api-football.com/pricing)
for which tier includes the current season — not obvious from the plan
names alone). Until then:
- You can still confirm the sync buttons/upsert logic work by entering
  `2023` as the season temporarily — just don't leave it there.
- Manual entry via the "Add a fixture" / "League table" forms on the same
  page works regardless of plan, and is the fallback either way.

## News

Full CMS for news articles, with individual pages per article. The **News**
item in the admin sidebar is a dropdown with two sub-pages:

- `/admin/news` (**Articles**) — list of all articles
  (draft/scheduled/published, newest edited first), with a **New article**
  button.
- `/admin/news/new` and `/admin/news/[id]/edit` — a shared form: title,
  slug (auto-generated from the title if left blank), category, status
  (Draft / Published / Scheduled — the publish date/time field only
  appears when Scheduled is picked), featured image upload, and a rich
  text (TipTap) editor with inline image upload. No author field (a single
  club feed doesn't need a byline) and no manual excerpt field — the
  card/meta-description summary is auto-derived from the start of the
  body text on save (`extractExcerpt` in `src/lib/news/excerpt.ts`).
- `/admin/news/categories` (**Categories**) — add, rename, reorder
  (sort order) and delete categories. Categories aren't a fixed list —
  admins manage them here; deleting one that still has articles assigned
  is blocked with a message telling you how many, rather than either
  silently orphaning those articles or crashing.
- `/news` — public list, filterable by category pill.
- `/news/[slug]` — public article page.

A few things worth knowing about how this is wired up:

- **Scheduling has no background job.** An article is only ever `draft` or
  `published` in the database — "Scheduled" in the admin form is a display
  concept, not a real status value: picking it just sets `status='published'`
  with a future `publish_at`, and public queries filter on
  `publish_at <= now()`. So a scheduled article simply starts matching that
  filter once its time passes; nothing needs to run to "activate" it. The
  edit form re-derives which of the three the article "is" from those two
  columns (`getDisplayStatus` in `src/lib/news/status.ts`).
- **Editing a live article doesn't bump its publish date.** Saving an
  already-published article as Published again keeps its original
  `publish_at` — the date/time only changes when Scheduled is used, or the
  moment an article actually goes live for the first time.
- **Images go through Supabase Storage** (a `news-images` public bucket,
  created by migration `0003`), not Next.js's image optimisation — articles
  use a plain `<img>` tag rather than `next/image`, since wiring up
  `next/image` for a Supabase Storage domain adds config for a mock site
  that doesn't need it yet. Worth revisiting once this is a real production
  site with real traffic.
- **Article body HTML is sanitised with DOMPurify when saved** (server-side,
  in the create/update actions), not when rendered — so it's safe to render
  directly on the public article page without re-sanitising on every page
  view.
- **Rich text editor uses TipTap.** Featured images upload through the
  normal form (handled server-side, in the same request as saving the
  article); inline images (inserted via the editor's toolbar) upload
  directly from the browser to Supabase Storage the moment you pick a file,
  since the editor needs to show the image immediately rather than waiting
  for the whole form to submit.

## What's intentionally not done yet

- No real club content (squads, ticket prices, etc.) — those pages are
  still labelled placeholders. Fixtures & League Table and News are
  functional (see above) but have no real data entered.
- No club branding assets (crest, brand fonts/colours beyond a navy/gold
  placeholder palette, photography) — see "Open questions" below.
- Other admin CRUD screens (Squads, Tickets, Club, Commercial, Hospitality)
  are placeholders; only Fixtures & Results, News, auth and navigation are
  wired up. Settings itself is still a placeholder — the current-competition
  and API-Football config live on Fixtures & Results instead, since that's
  the only page that needs them.
- Sync errors (bad API key, wrong league ID, etc.) and article save errors
  (e.g. a duplicate slug) currently show Next's generic error page rather
  than a friendly inline message — fine for an admin tool used by one or
  two people for now, worth improving later.
- News has no image library/media manager — every upload is a one-off, there's
  no way to reuse a previously-uploaded image across articles.
- No automated tests yet.

## Open questions for the club / before going further

- **Branding**: official crest (SVG/PNG), brand colour codes, any existing
  style guide, preferred imagery/photography.
- **Domain**: the real domain name to use for the public site and the
  `admin.` subdomain.
- **Shop**: the Shopify store URL for the `/shop` redirect.
- **Ticketing/payments provider**: who currently sells tickets (e.g. a
  third-party ticketing platform) — integrate vs. link out?
- **Fixtures/results data**: does the club already have an Opta/Stats
  Perform feed via SPFL membership? If not, the API-Football sync + manual
  admin entry (see above) is the fallback.
- **API-Football budget**: worth paying for a plan that covers the current
  season, or is manual entry (free) good enough given how infrequently a
  small club's fixtures/table actually change?
- **Current competition**: which division is the club playing in right
  now — set this in `/admin/fixtures` once confirmed.
- **News/squads content**: who will supply news articles and squad
  photos/bios?
- **Admin users**: who needs admin access, and do they need different
  permission levels (e.g. editor vs. full admin)?
