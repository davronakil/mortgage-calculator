import { MortgageInputs, MortgageCalculation } from '../types/mortgage';

export function calculateMortgage(inputs: MortgageInputs): MortgageCalculation {
  const {
    homePrice,
    downPayment,
    loanTerm,
    interestRate,
    propertyTax,
    homeInsurance,
    pmi,
    hoa,
    utilities,
    maintenance,
  } = inputs;

  const loanAmount = homePrice - downPayment;
  const monthlyInterestRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  const monthlyPrincipalAndInterest =
    (loanAmount *
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments))) /
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

  const monthlyPropertyTax = (propertyTax / 100 * homePrice) / 12;
  const monthlyInsurance = homeInsurance / 12;
  const monthlyPMI = (pmi / 100 * loanAmount) / 12;
  const monthlyHOA = hoa;
  const monthlyUtilities = utilities;
  const monthlyMaintenance = maintenance;

  const totalMonthlyPayment =
    monthlyPrincipalAndInterest +
    monthlyPropertyTax +
    monthlyInsurance +
    monthlyPMI +
    monthlyHOA +
    monthlyUtilities +
    monthlyMaintenance;

  const totalInterestPaid =
    monthlyPrincipalAndInterest * numberOfPayments - loanAmount;

  return {
    monthlyPrincipalAndInterest,
    monthlyPropertyTax,
    monthlyInsurance,
    monthlyPMI,
    monthlyHOA,
    monthlyUtilities,
    monthlyMaintenance,
    totalMonthlyPayment,
    totalLoanAmount: loanAmount,
    totalInterestPaid,
  };
}
