# Davron's real estate calculator

Planning suite for residential buyers, commercial deal analysis, sell-vs-hold decisions, and business idea projections.

## What this app does

- Residential planning with county presets (Dallas-area counties)
- Mortgage analysis with payment breakdown, DTI, cash-to-close, and payoff impact
- Seller concession vs lower purchase-price comparison
- Commercial deal analyzer with NOI, DSCR, cap rate, and break-even occupancy
- Other planners for current-home strategy and business idea viability

## Tech stack

- `Next.js` (App Router)
- `React` + `TypeScript`
- `Tailwind CSS`
- `Chart.js` + `react-chartjs-2`

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## NPM scripts

- `npm run dev` - start local dev server
- `npm run build` - production build + type/lint checks used in CI
- `npm run start` - run production server locally
- `npm run lint` - run lint checks

## Documentation map

- `ARCHITECTURE.md` - high-level app architecture, data flow, and module boundaries
- `docs/DEVELOPMENT.md` - daily developer workflow and implementation guidance
- `docs/CALCULATOR_REFERENCE.md` - formulas, metrics, and feature behavior by tab
- `docs/DATA_ASSUMPTIONS.md` - county defaults and how to update assumptions safely
- `docs/MAINTENANCE_RUNBOOK.md` - deployment, troubleshooting, and release checklist

## Current project layout

```text
src/
  app/
    page.tsx               # Main UI (tabs and calculators)
    layout.tsx             # App shell and metadata
    globals.css            # Global styles
  utils/
    mortgageCalculator.ts  # Core mortgage math engine
  types/
    mortgage.ts            # Shared calculator input/output types
```

## Deployment

The app is designed for Vercel deployment from `main`.

Before pushing:

1. `npm run build`
2. Verify no obvious regression in each tab:
   - Residential
   - Commercial
   - Other Calculators

## Notes for contributors

- Keep financial assumptions explicit and documented.
- Treat county defaults as planning values, not legal or lender quotes.
- When adding a new metric, document the formula in `docs/CALCULATOR_REFERENCE.md`.
