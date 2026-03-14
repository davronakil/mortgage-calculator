# Instructions for AI Sessions (Cursor / Claude)

Read this file first in new sessions to keep context and reduce token usage.

## Before Making Changes

1. **Read these docs:** `state.md` (version, deploy, env, stability), `architecture.md` (structure, auth, patterns).
2. **Check types:** `src/types/database.ts` must match Supabase. For new columns, add migration in `supabase-migration-*.sql` and update types.
3. **Changelog:** When shipping a change, bump `package.json` version (patch, e.g. 1.2.x) and add an entry in `src/app/about/page.tsx` with **exact date** (e.g. "Mar 5, 2026").

## Conventions

- **Paths:** Use `@/` for src (e.g. `@/lib/supabase/client`, `@/components/...`).
- **Auth:** Use `useAuth()` for user/profile; handle loading and null. Call `resetSupabaseClient()` only on sign-out (in AuthProvider).
- **Supabase:** Browser client via `createClient()`; server via `createServerSupabaseClient()`. Middleware uses its own createServerClient for session refresh.
- **Safari:** Auth callback must not 302 with Set-Cookie; use 200 HTML + client redirect. Optional getSession retries when session is null off auth routes.
- **No:** Don’t add aggressive request timeouts that cause false failures; avoid clearing user/profile on transient auth errors.

## Deployment & Git

- **Deploy:** From project root: `npx vercel --prod --yes`. Production: https://govibe.win.
- **Git:** This folder may be inside a parent repo. Push from the clone that has the GitHub remote. Don’t assume `git push` from this workspace will work.
- **Rollback:** Vercel Dashboard → Deployments → select deployment → Promote to Production.

## File Quick Reference

| Need to…              | Look at…                          |
|-----------------------|------------------------------------|
| Env / version / deploy | state.md                          |
| App structure / auth  | architecture.md                    |
| DB schema            | supabase-schema.sql, migration files |
| Types                | src/types/database.ts              |
| Auth flow            | AuthProvider, auth/callback/route  |
| Event/profile URLs   | src/utils/slug.ts                  |
| Compatibility        | src/utils/compatibility.ts         |
| Distance/radius      | src/utils/distance.ts              |

## Minimizing Tokens

- Prefer editing existing code over large new files.
- When adding features, touch only the minimal set of files; reference architecture.md for where things live.
- Don’t duplicate long snippets from the codebase; point to file paths and section names instead.
