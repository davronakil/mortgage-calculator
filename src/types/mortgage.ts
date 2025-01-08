export interface MortgageInputs {
  homePrice: number;
  downPayment: number;
  loanTerm: number;
  interestRate: number;
  propertyTax: number;
  homeInsurance: number;
  pmi: number;
  hoa: number;
  utilities: number;
  maintenance: number;
}

export interface MortgageCalculation {
  monthlyPrincipalAndInterest: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyPMI: number;
  monthlyHOA: number;
  monthlyUtilities: number;
  monthlyMaintenance: number;
  totalMonthlyPayment: number;
  totalLoanAmount: number;
  totalInterestPaid: number;
}
