# Data Assumptions and County Defaults

## Why this exists

The app ships with defaults to help users start quickly. These are **planning baselines**, not official quotes.

This document explains how defaults are structured and how to update them safely.

## Current county coverage

Dallas-area counties currently included:

- Collin
- Dallas
- Denton
- Tarrant
- Rockwall

Defined in `src/app/page.tsx` in the county profile map.

## County profile fields

Each county requires:

- `name`
- `homePrice`
- `propertyTaxRate`
- `annualHomeInsurance`
- `monthlyHOA`
- `monthlyUtilities`
- `maintenanceRate`
- `annualIncome`

## Source expectations

When updating defaults, prefer:

- local appraisal district/official tax resources
- reputable local/regional housing data sources
- public government data (income/economic datasets)

Record:

- source URL(s)
- date accessed
- normalization notes (for example, monthly vs annual conversion)

## Update procedure

1. Update county values in `src/app/page.tsx`.
2. Confirm presets still load correctly and fields are non-negative.
3. Validate `Apply county defaults` behavior for each county.
4. Run `npm run build`.
5. Update this file with date and a short change note.

## Suggested review cadence

- **Quarterly** for mortgage rate-related defaults.
- **Semi-annually** for home price and insurance estimates.
- **Annually** for income and broader baseline assumptions.

## Last documented update

- Date: 2026-04-16
- Scope:
  - Expanded to multiple Dallas-area counties
  - Added defaults used across residential planning flows
