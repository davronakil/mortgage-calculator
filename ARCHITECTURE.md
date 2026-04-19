# Architecture

## Purpose

`Davron's real estate calculator` is a single-page planning application that combines:

- Residential mortgage planning
- Commercial deal underwriting snapshots
- Sell-vs-hold decision support
- Business idea cashflow projection

The architecture intentionally keeps financial math deterministic and local to the browser (no backend required).

## System overview

- **UI layer:** `src/app/page.tsx`
  - Hosts all tabs and input state
  - Renders derived metrics and charts
  - Applies county default profiles
- **Domain math layer:** `src/utils/mortgageCalculator.ts`
  - Mortgage payment computation
  - Interest and payoff simulation
  - DTI and cash-to-close metrics
- **Type contracts:** `src/types/mortgage.ts`
  - Shared interfaces for mortgage inputs and outputs

## Data flow

1. User changes form inputs in a tab.
2. Tab state updates in React local state.
3. Derived values are recomputed via `useMemo`.
4. For residential/commercial mortgage-backed sections, `calculateMortgage()` is called.
5. Presentation components render currency/percent metrics and chart data.

## UI architecture

- **Top-level tabs**
  - `Residential`
  - `Commercial`
  - `Other Calculators`
- **Residential**
  - Mortgage calculator core
  - County defaults switcher
  - Seller concessions vs price-reduction comparison
- **Commercial**
  - Deal-level underwriting summary
  - Uses mortgage engine for debt service estimation
- **Other**
  - Sell-or-hold calculator
  - Business idea projection

## Design principles

- **No hidden assumptions:** all defaults and formulas are exposed in docs.
- **Planner first:** outputs are decision-oriented (cash at close, breakeven, DSCR, payback).
- **Composable math:** central mortgage utility reused where possible.
- **Static-first deploy:** no required runtime backend dependencies.

## Boundaries and extension points

- Add/modify mortgage formulas in `src/utils/mortgageCalculator.ts`.
- Add new shared mortgage fields in `src/types/mortgage.ts` first.
- Add new calculators as new tab sections in `src/app/page.tsx` (or extract to components if complexity grows).
- Keep county assumptions in one place (currently defined in `page.tsx`; see `docs/DATA_ASSUMPTIONS.md`).

## Known technical debt

- `src/app/page.tsx` currently contains many responsibilities and should be split into:
  - `components/tabs/ResidentialTab.tsx`
  - `components/tabs/CommercialTab.tsx`
  - `components/tabs/OtherCalculatorsTab.tsx`
  - shared `components/inputs/NumberInput.tsx`
- There is an empty `next.config.js`; only `next.config.ts` should remain to avoid confusion.
- Build warns about multiple lockfiles in parent directories; see maintenance runbook.
