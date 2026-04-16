import { MortgageInputs, MortgageCalculation } from '../types/mortgage';

function calculateMonthlyPrincipalAndInterest(
  loanAmount: number,
  monthlyInterestRate: number,
  numberOfPayments: number
): number {
  if (loanAmount <= 0) {
    return 0;
  }

  if (monthlyInterestRate === 0) {
    return loanAmount / numberOfPayments;
  }

  return (
    (loanAmount *
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments))) /
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)
  );
}

function calculatePayoffDetails(
  loanAmount: number,
  monthlyInterestRate: number,
  scheduledPrincipalAndInterest: number,
  monthlyExtraPayment: number,
  originalNumberOfPayments: number
) {
  let balance = loanAmount;
  let payoffMonths = 0;
  let totalInterestPaid = 0;
  const monthlyPayment = scheduledPrincipalAndInterest + monthlyExtraPayment;

  if (loanAmount <= 0) {
    return {
      payoffMonths: 0,
      totalInterestPaid: 0,
      totalAmountPaid: 0,
    };
  }

  if (monthlyInterestRate === 0) {
    const months = Math.ceil(loanAmount / Math.max(monthlyPayment, 1));
    return {
      payoffMonths: Math.min(months, originalNumberOfPayments),
      totalInterestPaid: 0,
      totalAmountPaid: loanAmount,
    };
  }

  while (balance > 0.01 && payoffMonths < originalNumberOfPayments * 2) {
    const interestForMonth = balance * monthlyInterestRate;
    const principalForMonth = Math.min(monthlyPayment - interestForMonth, balance);

    if (principalForMonth <= 0) {
      break;
    }

    balance -= principalForMonth;
    totalInterestPaid += interestForMonth;
    payoffMonths += 1;
  }

  return {
    payoffMonths,
    totalInterestPaid,
    totalAmountPaid: loanAmount + totalInterestPaid,
  };
}

export function calculateMortgage(inputs: MortgageInputs): MortgageCalculation {
  const {
    homePrice,
    downPayment,
    loanTerm,
    interestRate,
    propertyTaxRate,
    annualHomeInsurance,
    pmiRate,
    monthlyHOA,
    monthlyUtilities,
    maintenanceRate,
    monthlyExtraPayment,
    closingCostRate,
    annualIncome,
    monthlyDebts,
  } = inputs;

  const normalizedHomePrice = Math.max(homePrice, 0);
  const normalizedDownPayment = Math.min(Math.max(downPayment, 0), normalizedHomePrice);
  const loanAmount = Math.max(normalizedHomePrice - normalizedDownPayment, 0);
  const monthlyInterestRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;
  const downPaymentPercent =
    normalizedHomePrice > 0 ? normalizedDownPayment / normalizedHomePrice : 0;
  const loanToValueRatio = normalizedHomePrice > 0 ? loanAmount / normalizedHomePrice : 0;

  const monthlyPrincipalAndInterest = calculateMonthlyPrincipalAndInterest(
    loanAmount,
    monthlyInterestRate,
    numberOfPayments
  );

  const monthlyPropertyTax = (propertyTaxRate / 100 * normalizedHomePrice) / 12;
  const monthlyInsurance = annualHomeInsurance / 12;
  const monthlyPMI = loanToValueRatio > 0.8 ? (pmiRate / 100 * loanAmount) / 12 : 0;
  const monthlyMaintenance = (maintenanceRate / 100 * normalizedHomePrice) / 12;
  const monthlyMortgagePayment =
    monthlyPrincipalAndInterest +
    monthlyPropertyTax +
    monthlyInsurance +
    monthlyPMI +
    monthlyHOA;

  const totalMonthlyPayment =
    monthlyMortgagePayment +
    monthlyUtilities +
    monthlyMaintenance +
    monthlyExtraPayment;

  const totalInterestPaid = monthlyPrincipalAndInterest * numberOfPayments - loanAmount;
  const closingCosts = (closingCostRate / 100) * normalizedHomePrice;
  const cashToClose = normalizedDownPayment + closingCosts;
  const frontEndDTI = annualIncome > 0 ? monthlyMortgagePayment / (annualIncome / 12) : 0;
  const backEndDTI =
    annualIncome > 0 ? (monthlyMortgagePayment + monthlyDebts) / (annualIncome / 12) : 0;
  const recommendedMonthlyIncome = monthlyMortgagePayment / 0.28;

  const payoffDetails = calculatePayoffDetails(
    loanAmount,
    monthlyInterestRate,
    monthlyPrincipalAndInterest,
    monthlyExtraPayment,
    numberOfPayments
  );

  return {
    homePrice: normalizedHomePrice,
    downPayment: normalizedDownPayment,
    downPaymentPercent,
    loanToValueRatio,
    monthlyPrincipalAndInterest,
    monthlyPropertyTax,
    monthlyInsurance,
    monthlyPMI,
    monthlyHOA,
    monthlyUtilities,
    monthlyMaintenance,
    monthlyExtraPayment,
    monthlyMortgagePayment,
    totalMonthlyPayment,
    totalLoanAmount: loanAmount,
    closingCosts,
    cashToClose,
    totalInterestPaid,
    totalInterestPaidWithExtraPayments: payoffDetails.totalInterestPaid,
    totalAmountPaidWithExtraPayments: payoffDetails.totalAmountPaid,
    interestSavingsFromExtraPayments: Math.max(
      totalInterestPaid - payoffDetails.totalInterestPaid,
      0
    ),
    payoffMonthsWithExtraPayments:
      monthlyExtraPayment > 0 ? payoffDetails.payoffMonths : numberOfPayments,
    yearsSavedWithExtraPayments:
      monthlyExtraPayment > 0
        ? Math.max(numberOfPayments - payoffDetails.payoffMonths, 0) / 12
        : 0,
    frontEndDTI,
    backEndDTI,
    recommendedMonthlyIncome,
  };
}
