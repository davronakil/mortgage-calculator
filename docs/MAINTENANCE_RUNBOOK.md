# Maintenance Runbook

## Pre-release checklist

Before pushing a release commit:

1. Run `npm run build`
2. Manually smoke test:
   - Residential tab
   - Commercial tab
   - Other Calculators tab
3. Verify seller concession comparison output sanity
4. Verify county defaults apply correctly
5. Confirm no TypeScript/lint regressions

## Deployment

Primary path: Vercel auto-deploy from `main`.

Recommended release flow:

1. Merge changes to `main`
2. Monitor Vercel build logs
3. Verify production URL manually

## Common operational issues

### 1) Build warning about multiple lockfiles

Symptom:

- Next.js warns that workspace root inference detected multiple lockfiles.

Current mitigation:

- `next.config.ts` sets `outputFileTracingRoot`.

If warning persists:

- remove unneeded parent lockfiles (outside this app) when safe
- or ensure deployment root is the app directory in Vercel project settings

### 2) Vercel warns about vulnerable Next.js version

Fix:

1. Update `next` and `eslint-config-next` to latest stable patch
2. Run `npm run build`
3. Commit lockfile changes
4. Push and redeploy

### 3) Unexpected calculator output

Debug steps:

1. Verify input units (percent vs currency, annual vs monthly).
2. Recheck formula definitions in `docs/CALCULATOR_REFERENCE.md`.
3. Add temporary logging around derived values.
4. Validate edge cases:
   - zero rate
   - zero/negative-like user inputs
   - very low down payment

## Maintenance tasks

### Monthly

- Check dependency updates and security warnings.
- Run a local production build.

### Quarterly

- Refresh county assumptions as needed.
- Review residential and commercial default realism.

### Annually

- Full docs review for stale assumptions and UI behavior changes.
- Evaluate whether to split `page.tsx` into smaller components.

## Incident triage template

When a bug report comes in, capture:

- environment (local/Vercel, browser, device)
- tab and scenario used
- exact input values
- expected result vs actual result
- screenshot (if visual issue)
- reproduction steps
