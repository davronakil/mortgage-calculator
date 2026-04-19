# Calculator Reference

This file documents core formulas and behaviors used by each calculator tab.

## Residential: Mortgage Calculator

### Core formulas

- **Loan amount**
  - `loanAmount = homePrice - downPayment`
- **Monthly principal & interest**
  - Standard amortization formula with:
    - `monthlyRate = interestRate / 100 / 12`
    - `numPayments = loanTermYears * 12`
- **Monthly property tax**
  - `(propertyTaxRate / 100 * homePrice) / 12`
- **Monthly insurance**
  - `annualHomeInsurance / 12`
- **Monthly PMI**
  - `(pmiRate / 100 * loanAmount) / 12` when LTV > 80%
- **Monthly maintenance reserve**
  - `(maintenanceRate / 100 * homePrice) / 12`
- **Cash to close**
  - `downPayment + closingCosts`
  - `closingCosts = closingCostRate / 100 * homePrice`

### Affordability metrics

- **Front-end DTI**
  - `monthlyMortgagePayment / (annualIncome / 12)`
- **Back-end DTI**
  - `(monthlyMortgagePayment + monthlyDebts) / (annualIncome / 12)`
- **Recommended monthly income (28% rule)**
  - `monthlyMortgagePayment / 0.28`

### Extra-payment impact

Simulated month-by-month payoff with optional extra principal.

Outputs:

- payoff months
- total interest with extra payments
- interest savings vs scheduled amortization
- years saved

## Residential: Seller concessions vs lower sales price

Purpose: compare **upfront** cash savings (concession) vs **monthly** savings (price cut).

### Concession path

- usable concession at close:
  - `min(sellerConcessionAmount, closingCosts)`
- adjusted cash to close:
  - `downPayment + max(closingCosts - usableConcession, 0)`

### Lower-price path

- reduce home price by comparison amount
- preserve down-payment ratio
- recompute payment with same rate/term assumptions
- monthly savings:
  - `currentMonthlyPayment - reducedPriceMonthlyPayment`

### Breakeven heuristic

- `breakevenMonths = usableConcession / monthlySavingsFromPriceCut`

Interpretation:

- shorter breakeven = lower-price strategy catches up faster
- longer breakeven = concession gives stronger short-term liquidity

## Commercial: Deal Analyzer

### Inputs

- purchase price
- down-payment percent
- debt terms (rate + years)
- gross potential income
- vacancy rate
- operating expenses
- seller concessions

### Metrics

- **Effective gross income (EGI)**
  - `grossPotentialIncome * (1 - vacancyRate)`
- **NOI**
  - `EGI - operatingExpenses`
- **Annual debt service**
  - `monthlyPI * 12` from mortgage utility
- **DSCR**
  - `NOI / annualDebtService`
- **Cap rate**
  - `NOI / purchasePrice`
- **Break-even occupancy**
  - `(operatingExpenses + annualDebtService) / grossPotentialIncome`

## Other: Sell or Hold

- gross equity:
  - `homeValue - mortgageBalance`
- estimated sale costs:
  - `homeValue * sellingCostRate`
- net proceeds:
  - `grossEquity - saleCosts - repairBudget`
- annual hold cashflow:
  - `(monthlyRent - monthlyOwnershipCosts) * 12`
- years to match sale:
  - `netSaleProceeds / annualHoldCashflow` (if hold cashflow positive)

## Other: Business Idea Projection

- monthly gross profit:
  - `monthlyRevenue - monthlyVariableCosts`
- monthly net cashflow:
  - `monthlyGrossProfit - monthlyFixedCosts - monthlyDebtService`
- annual net:
  - `monthlyNet * 12`
- net margin:
  - `monthlyNet / monthlyRevenue`
- break-even revenue:
  - fixed obligations divided by contribution margin ratio
- startup payback months:
  - `startupCost / monthlyNet` (if monthly net positive)

## Guardrails

- Inputs are treated as planning estimates, not underwriting approvals.
- Assumptions vary by county, lender product, insurance profile, and property specifics.
- Users should validate with lenders, title companies, CPAs, and local tax professionals.
