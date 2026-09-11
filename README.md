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
                        guarded by Supabase auth. Fixtures & Results and
                        Settings (current competition) are wired up to
                        Supabase; the rest are still placeholders.
src/proxy.ts            Rewrites the `admin.` subdomain to /admin, and
                        refreshes the Supabase session cookie. (Next.js 16's
                        replacement for middleware.ts.)
src/lib/supabase/       Browser + server Supabase client helpers.
src/lib/fixtures/       Types + read queries shared by the public Fixtures
                        page and the admin Fixtures/Settings pages.
src/lib/nav.ts          Single source of truth for the public + admin nav.
supabase/migrations/    SQL schema (competitions, site_settings, fixtures,
                        league_table_rows) — run these against your Supabase
                        project before the Fixtures feature will show data.
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
2. Copy the Project URL and anon public key into `.env.local`
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
3. In Supabase Auth, create the admin user(s) who should be able to log in
   at `/admin/login`. There's no self-service sign-up — admin accounts are
   provisioned manually for now.
4. Run the SQL in `supabase/migrations/` against your project (SQL Editor,
   or the Supabase CLI) to create the fixtures/league table schema.
5. In `/admin/settings`, pick the club's current competition — this
   controls what `/admin/fixtures` manages and what the public Fixtures
   page shows.
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
manually-entered league table, scoped to whichever competition is picked in
`/admin/settings`:

- `/admin/fixtures` — add/edit/delete fixtures (opponent, home/away,
  kick-off, ground, result) and league table rows (every team, P/W/D/L/GF/GA/Pts).
- `/fixtures` — public page: next match banner, upcoming fixtures, recent
  results, full league table (Ross County's row highlighted).

There's no official SPFL/SFA/BBC public API — SPFL's data rights are
exclusively licensed to Stats Perform/Opta (a commercial B2B feed). Worth
asking the club whether they already have an Opta feed/widget as part of
SPFL membership before considering a third-party consumer API (API-Football,
Sportmonks, etc.) — this schema is written to be filled by either manual
entry or an automated sync into the same tables later.

## What's intentionally not done yet

- No real club content (news, squads, ticket prices, etc.) — those pages
  are still labelled placeholders. Fixtures & League Table is functional
  (see above) but has no real data entered.
- No club branding assets (crest, brand fonts/colours beyond a navy/gold
  placeholder palette, photography) — see "Open questions" below.
- Other admin CRUD screens (News, Squads, Tickets, Club, Commercial,
  Hospitality) are placeholders; only Fixtures/Settings, auth and
  navigation are wired up.
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
  Perform feed via SPFL membership? If not, manual entry via the admin
  panel is the fallback, or a paid third-party API.
- **Current competition**: which division is the club playing in right
  now — set this in `/admin/settings` once confirmed.
- **News/squads content**: who will supply news articles and squad
  photos/bios?
- **Admin users**: who needs admin access, and do they need different
  permission levels (e.g. editor vs. full admin)?
