# Vibe – Project State

**Last updated:** Session snapshot. Update when making significant changes or releases.

## Version & Deployment

- **App version:** `package.json` → `version`
- **Production:** https://govibe.win
- **Deploy:** `npx vercel --prod --yes` from project root
- **Changelog:** `src/app/about/page.tsx` – use exact dates (e.g. "Mar 5, 2026")

## Tech Stack

- Next.js 14 (App Router), React 18, TypeScript
- Supabase (PostgreSQL, Auth, Realtime) – magic-link auth
- Vercel, custom domain govibe.win
- Brevo SMTP for Supabase emails
- Google Maps (Places, Geocoding, Static Maps)

## Environment

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (e.g. https://govibe.win)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## Stability

- Stuck loading has occurred with slow/hanging Supabase. Rollback via Vercel Dashboard → Deployments → Promote known-good deployment.
- Use patch versions (1.2.x) for small iterations.

## Assets

- `public/og-default.jpg` – OG default image
- `public/apple-touch-icon.png` – app icon

## DB Migrations

- Base schema: `supabase-schema.sql`
- Migrations: `supabase-migration-*.sql` – run in Supabase SQL Editor. Keep `src/types/database.ts` in sync.
