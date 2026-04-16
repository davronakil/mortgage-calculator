export interface MortgageInputs {
  homePrice: number;
  downPayment: number;
  loanTerm: number;
  interestRate: number;
  propertyTaxRate: number;
  annualHomeInsurance: number;
  pmiRate: number;
  monthlyHOA: number;
  monthlyUtilities: number;
  maintenanceRate: number;
  monthlyExtraPayment: number;
  closingCostRate: number;
  annualIncome: number;
  monthlyDebts: number;
}

export interface MortgageCalculation {
  homePrice: number;
  downPayment: number;
  downPaymentPercent: number;
  loanToValueRatio: number;
  monthlyPrincipalAndInterest: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyPMI: number;
  monthlyHOA: number;
  monthlyUtilities: number;
  monthlyMaintenance: number;
  monthlyExtraPayment: number;
  monthlyMortgagePayment: number;
  totalMonthlyPayment: number;
  totalLoanAmount: number;
  closingCosts: number;
  cashToClose: number;
  totalInterestPaid: number;
  totalInterestPaidWithExtraPayments: number;
  totalAmountPaidWithExtraPayments: number;
  interestSavingsFromExtraPayments: number;
  payoffMonthsWithExtraPayments: number;
  yearsSavedWithExtraPayments: number;
  frontEndDTI: number;
  backEndDTI: number;
  recommendedMonthlyIncome: number;
}
