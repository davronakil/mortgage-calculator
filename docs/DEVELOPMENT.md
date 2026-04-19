# Development Guide

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open `http://localhost:3000`.

## Required checks before commit

Run:

```bash
npm run build
```

This validates:

- production compilation
- type safety
- lint constraints used in CI/Vercel

## Working conventions

- Keep calculator logic deterministic and side-effect free.
- Prefer pure functions for formulas and scenario calculations.
- Treat all currency/rate inputs as numbers and clamp where needed.
- Keep UI labels user-friendly and explicit about units.

## Where to implement changes

- **Mortgage math updates:** `src/utils/mortgageCalculator.ts`
- **Mortgage data contract changes:** `src/types/mortgage.ts`
- **UI and calculator tabs:** `src/app/page.tsx`
- **Global styling:** `src/app/globals.css`

## Adding a new metric

1. Define the formula and edge cases.
2. Add/extend types if needed.
3. Implement calculation in utility or tab-level derived logic.
4. Surface UI with clear labels and units.
5. Document in `docs/CALCULATOR_REFERENCE.md`.
6. Run `npm run build`.

## Adding a new county profile

1. Add county data in the Dallas-area county profile map in `src/app/page.tsx`.
2. Ensure required fields are present:
   - home price
   - property tax rate
   - annual insurance
   - HOA
   - utilities
   - maintenance rate
   - annual income
3. Update `docs/DATA_ASSUMPTIONS.md` with source notes/date.
4. Run `npm run build`.

## Suggested refactor path

As complexity grows, split `page.tsx` into:

- `src/components/tabs/ResidentialTab.tsx`
- `src/components/tabs/CommercialTab.tsx`
- `src/components/tabs/OtherCalculatorsTab.tsx`
- `src/components/common/NumberInput.tsx`

Keep `page.tsx` as composition only.
