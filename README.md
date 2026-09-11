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
                        Tickets, Club, Commercial, Hospitality, Settings) —
                        all placeholder screens, guarded by Supabase auth.
src/middleware.ts       Rewrites the `admin.` subdomain to /admin, and
                        refreshes the Supabase session cookie.
src/lib/supabase/       Browser + server Supabase client helpers.
src/lib/nav.ts          Single source of truth for the public + admin nav.
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
4. Add the same env vars in Vercel's project settings for production.

## Admin subdomain on Vercel

The admin panel is just `/admin` inside the same Next.js app — `src/middleware.ts`
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

## What's intentionally not done yet

- No real club content (news, fixtures, squads, ticket prices, etc.) — every
  public page is a labelled placeholder grid.
- No club branding assets (crest, brand fonts/colours beyond a navy/gold
  placeholder palette, photography) — see "Open questions" below.
- Admin CRUD screens are placeholders; only auth + navigation are wired up.
- No automated tests yet.

## Open questions for the club / before going further

- **Branding**: official crest (SVG/PNG), brand colour codes, any existing
  style guide, preferred imagery/photography.
- **Domain**: the real domain name to use for the public site and the
  `admin.` subdomain.
- **Shop**: the Shopify store URL for the `/shop` redirect.
- **Ticketing/payments provider**: who currently sells tickets (e.g. a
  third-party ticketing platform) — integrate vs. link out?
- **Content sourcing**: who will supply news articles, fixtures/results
  data (manual entry vs. a feed from the SPFL/SFA or a stats provider),
  and squad photos/bios?
- **Admin users**: who needs admin access, and do they need different
  permission levels (e.g. editor vs. full admin)?
