# Contributing

Thanks for helping improve `Davron's real estate calculator`.

## Development workflow

1. Pull latest `main`
2. Make focused changes
3. Run `npm run build`
4. Update docs for any formula/default/behavior changes
5. Commit with clear intent in message

## Contribution standards

- Keep formulas transparent and documented.
- Avoid hidden constants in UI logic.
- Use explicit units in labels (`/month`, `/year`, `%`).
- Prefer small, reviewable commits.

## Documentation expectations

Update relevant docs whenever behavior changes:

- Architecture or structure changes -> `ARCHITECTURE.md`
- Formula or output changes -> `docs/CALCULATOR_REFERENCE.md`
- Assumption/default changes -> `docs/DATA_ASSUMPTIONS.md`
- Deployment/ops changes -> `docs/MAINTENANCE_RUNBOOK.md`

## Testing expectations

Minimum before PR/merge:

- `npm run build` passes
- Manual smoke test of all tabs

## Scope guardrails

- This tool is a planning aid, not legal/financial advice.
- Avoid claiming guaranteed lender eligibility or guaranteed returns.
