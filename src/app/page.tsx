'use client';

import { useMemo, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { MortgageInputs } from '../types/mortgage';
import { calculateMortgage } from '../utils/mortgageCalculator';

ChartJS.register(ArcElement, Tooltip, Legend);

type AppTab = 'residential' | 'commercial' | 'other';

interface CountyProfile {
  name: string;
  homePrice: number;
  propertyTaxRate: number;
  annualHomeInsurance: number;
  monthlyHOA: number;
  monthlyUtilities: number;
  maintenanceRate: number;
  annualIncome: number;
}

interface ResidentialInputs extends MortgageInputs {
  monthlyRentAlternative: number;
  sellerConcessionAmount: number;
  priceReductionComparisonAmount: number;
  autoPMI: boolean;
}

interface CommercialInputs {
  purchasePrice: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTermYears: number;
  grossPotentialIncomeAnnual: number;
  vacancyRate: number;
  operatingExpensesAnnual: number;
  sellerConcessionAmount: number;
  closingCostRate: number;
}

interface SellOrHoldInputs {
  currentHomeValue: number;
  currentMortgageBalance: number;
  estimatedMonthlyRent: number;
  monthlyOwnershipCosts: number;
  sellingCostRate: number;
  repairBudgetBeforeList: number;
}

interface BusinessIdeaInputs {
  startupCost: number;
  monthlyRevenue: number;
  monthlyVariableCosts: number;
  monthlyFixedCosts: number;
  monthlyDebtService: number;
}

const DALLAS_AREA_COUNTIES: Record<string, CountyProfile> = {
  collin: {
    name: 'Collin County',
    homePrice: 519000,
    propertyTaxRate: 1.66,
    annualHomeInsurance: 4200,
    monthlyHOA: 70,
    monthlyUtilities: 325,
    maintenanceRate: 1.0,
    annualIncome: 124920,
  },
  dallas: {
    name: 'Dallas County',
    homePrice: 395000,
    propertyTaxRate: 1.92,
    annualHomeInsurance: 3950,
    monthlyHOA: 85,
    monthlyUtilities: 315,
    maintenanceRate: 1.05,
    annualIncome: 89000,
  },
  denton: {
    name: 'Denton County',
    homePrice: 455000,
    propertyTaxRate: 1.85,
    annualHomeInsurance: 4050,
    monthlyHOA: 75,
    monthlyUtilities: 320,
    maintenanceRate: 1.0,
    annualIncome: 116000,
  },
  tarrant: {
    name: 'Tarrant County',
    homePrice: 360000,
    propertyTaxRate: 1.9,
    annualHomeInsurance: 3850,
    monthlyHOA: 65,
    monthlyUtilities: 305,
    maintenanceRate: 1.0,
    annualIncome: 86000,
  },
  rockwall: {
    name: 'Rockwall County',
    homePrice: 480000,
    propertyTaxRate: 1.78,
    annualHomeInsurance: 4100,
    monthlyHOA: 95,
    monthlyUtilities: 330,
    maintenanceRate: 1.0,
    annualIncome: 121000,
  },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatPercent(ratio: number, digits = 1) {
  return `${(ratio * 100).toFixed(digits)}%`;
}

function calculateSuggestedPMI(downPaymentPercent: number) {
  if (downPaymentPercent >= 0.2) return 0;
  if (downPaymentPercent >= 0.15) return 0.35;
  if (downPaymentPercent >= 0.1) return 0.5;
  if (downPaymentPercent >= 0.05) return 0.75;
  return 0.9;
}

function buildResidentialDefaults(county: CountyProfile): ResidentialInputs {
  const downPayment = county.homePrice * 0.2;
  return {
    homePrice: county.homePrice,
    downPayment,
    loanTerm: 30,
    interestRate: 6.37,
    propertyTaxRate: county.propertyTaxRate,
    annualHomeInsurance: county.annualHomeInsurance,
    pmiRate: calculateSuggestedPMI(0.2),
    monthlyHOA: county.monthlyHOA,
    monthlyUtilities: county.monthlyUtilities,
    maintenanceRate: county.maintenanceRate,
    monthlyExtraPayment: 0,
    closingCostRate: 3.0,
    annualIncome: county.annualIncome,
    monthlyDebts: 650,
    monthlyRentAlternative: county.homePrice * 0.0054,
    sellerConcessionAmount: 0,
    priceReductionComparisonAmount: 10000,
    autoPMI: true,
  };
}

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
  step?: number;
}

function NumberInput({ label, value, onChange, hint, step = 1 }: NumberInputProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        step={step}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<AppTab>('residential');
  const [selectedCounty, setSelectedCounty] = useState('collin');
  const [residentialInputs, setResidentialInputs] = useState<ResidentialInputs>(
    buildResidentialDefaults(DALLAS_AREA_COUNTIES.collin)
  );
  const [commercialInputs, setCommercialInputs] = useState<CommercialInputs>({
    purchasePrice: 1200000,
    downPaymentPercent: 25,
    interestRate: 7.15,
    loanTermYears: 20,
    grossPotentialIncomeAnnual: 180000,
    vacancyRate: 8,
    operatingExpensesAnnual: 62000,
    sellerConcessionAmount: 15000,
    closingCostRate: 2.5,
  });
  const [sellOrHoldInputs, setSellOrHoldInputs] = useState<SellOrHoldInputs>({
    currentHomeValue: 560000,
    currentMortgageBalance: 305000,
    estimatedMonthlyRent: 3200,
    monthlyOwnershipCosts: 1450,
    sellingCostRate: 7,
    repairBudgetBeforeList: 12000,
  });
  const [businessIdeaInputs, setBusinessIdeaInputs] = useState<BusinessIdeaInputs>({
    startupCost: 80000,
    monthlyRevenue: 26000,
    monthlyVariableCosts: 9000,
    monthlyFixedCosts: 7200,
    monthlyDebtService: 1800,
  });

  const county = DALLAS_AREA_COUNTIES[selectedCounty];

  const residentialCalc = useMemo(() => {
    const downPaymentPercent =
      residentialInputs.homePrice > 0
        ? residentialInputs.downPayment / residentialInputs.homePrice
        : 0;
    const pmiRate = residentialInputs.autoPMI
      ? calculateSuggestedPMI(downPaymentPercent)
      : residentialInputs.pmiRate;

    return calculateMortgage({
      ...residentialInputs,
      pmiRate,
    });
  }, [residentialInputs]);

  const concessionAnalysis = useMemo(() => {
    const concession = Math.max(residentialInputs.sellerConcessionAmount, 0);
    const concessionAppliedToClosing = Math.min(concession, residentialCalc.closingCosts);
    const cashToCloseWithConcession =
      residentialCalc.downPayment +
      Math.max(residentialCalc.closingCosts - concessionAppliedToClosing, 0);

    const priceCut = Math.max(residentialInputs.priceReductionComparisonAmount, 0);
    const reducedPrice = Math.max(residentialInputs.homePrice - priceCut, 1);
    const downPaymentPercent =
      residentialInputs.homePrice > 0
        ? residentialInputs.downPayment / residentialInputs.homePrice
        : 0;

    const reducedPriceCalculation = calculateMortgage({
      ...residentialInputs,
      homePrice: reducedPrice,
      downPayment: reducedPrice * downPaymentPercent,
      pmiRate: residentialInputs.autoPMI
        ? calculateSuggestedPMI(downPaymentPercent)
        : residentialInputs.pmiRate,
    });

    const monthlySavingsFromPriceCut =
      residentialCalc.totalMonthlyPayment - reducedPriceCalculation.totalMonthlyPayment;
    const breakevenMonths =
      monthlySavingsFromPriceCut > 0 ? concessionAppliedToClosing / monthlySavingsFromPriceCut : 0;

    return {
      concessionAppliedToClosing,
      cashToCloseWithConcession,
      reducedPriceCalculation,
      monthlySavingsFromPriceCut,
      breakevenMonths,
    };
  }, [residentialCalc, residentialInputs]);

  const commercialDebtCalculation = useMemo(() => {
    const downPayment = commercialInputs.purchasePrice * (commercialInputs.downPaymentPercent / 100);
    return calculateMortgage({
      homePrice: commercialInputs.purchasePrice,
      downPayment,
      loanTerm: commercialInputs.loanTermYears,
      interestRate: commercialInputs.interestRate,
      propertyTaxRate: 0,
      annualHomeInsurance: 0,
      pmiRate: 0,
      monthlyHOA: 0,
      monthlyUtilities: 0,
      maintenanceRate: 0,
      monthlyExtraPayment: 0,
      closingCostRate: commercialInputs.closingCostRate,
      annualIncome: 0,
      monthlyDebts: 0,
    });
  }, [commercialInputs]);

  const commercialMetrics = useMemo(() => {
    const effectiveGrossIncome =
      commercialInputs.grossPotentialIncomeAnnual * (1 - commercialInputs.vacancyRate / 100);
    const noi = effectiveGrossIncome - commercialInputs.operatingExpensesAnnual;
    const annualDebtService = commercialDebtCalculation.monthlyPrincipalAndInterest * 12;
    const dscr = annualDebtService > 0 ? noi / annualDebtService : 0;
    const capRate = commercialInputs.purchasePrice > 0 ? noi / commercialInputs.purchasePrice : 0;
    const breakEvenOccupancy =
      commercialInputs.grossPotentialIncomeAnnual > 0
        ? (commercialInputs.operatingExpensesAnnual + annualDebtService) /
          commercialInputs.grossPotentialIncomeAnnual
        : 0;
    const concessionImpact = Math.min(
      commercialInputs.sellerConcessionAmount,
      commercialDebtCalculation.closingCosts
    );

    return {
      effectiveGrossIncome,
      noi,
      annualDebtService,
      dscr,
      capRate,
      breakEvenOccupancy,
      concessionImpact,
    };
  }, [commercialDebtCalculation, commercialInputs]);

  const sellOrHoldMetrics = useMemo(() => {
    const grossEquity = sellOrHoldInputs.currentHomeValue - sellOrHoldInputs.currentMortgageBalance;
    const saleCost = sellOrHoldInputs.currentHomeValue * (sellOrHoldInputs.sellingCostRate / 100);
    const netSaleProceeds =
      grossEquity - saleCost - Math.max(sellOrHoldInputs.repairBudgetBeforeList, 0);
    const annualRentCashflow =
      (sellOrHoldInputs.estimatedMonthlyRent - sellOrHoldInputs.monthlyOwnershipCosts) * 12;
    const holdYearsToMatchSale =
      annualRentCashflow > 0 ? Math.max(netSaleProceeds, 0) / annualRentCashflow : 0;

    return {
      grossEquity,
      saleCost,
      netSaleProceeds,
      annualRentCashflow,
      holdYearsToMatchSale,
    };
  }, [sellOrHoldInputs]);

  const businessMetrics = useMemo(() => {
    const monthlyGrossProfit = businessIdeaInputs.monthlyRevenue - businessIdeaInputs.monthlyVariableCosts;
    const monthlyNetCashflow =
      monthlyGrossProfit - businessIdeaInputs.monthlyFixedCosts - businessIdeaInputs.monthlyDebtService;
    const annualNetCashflow = monthlyNetCashflow * 12;
    const margin = businessIdeaInputs.monthlyRevenue > 0 ? monthlyNetCashflow / businessIdeaInputs.monthlyRevenue : 0;
    const breakEvenRevenue =
      businessIdeaInputs.monthlyRevenue > 0
        ? ((businessIdeaInputs.monthlyFixedCosts + businessIdeaInputs.monthlyDebtService) /
            Math.max(
              1 - businessIdeaInputs.monthlyVariableCosts / businessIdeaInputs.monthlyRevenue,
              0.01
            ))
        : 0;
    const paybackMonths =
      monthlyNetCashflow > 0 ? businessIdeaInputs.startupCost / monthlyNetCashflow : 0;

    return {
      monthlyGrossProfit,
      monthlyNetCashflow,
      annualNetCashflow,
      margin,
      breakEvenRevenue,
      paybackMonths,
    };
  }, [businessIdeaInputs]);

  const chartData = useMemo(
    () => ({
      labels: ['P&I', 'Tax', 'Insurance', 'PMI', 'HOA', 'Utilities', 'Maintenance'],
      datasets: [
        {
          data: [
            residentialCalc.monthlyPrincipalAndInterest,
            residentialCalc.monthlyPropertyTax,
            residentialCalc.monthlyInsurance,
            residentialCalc.monthlyPMI,
            residentialCalc.monthlyHOA,
            residentialCalc.monthlyUtilities,
            residentialCalc.monthlyMaintenance,
          ],
          backgroundColor: ['#2563eb', '#0f766e', '#7c3aed', '#db2777', '#f59e0b', '#0891b2', '#64748b'],
          borderWidth: 0,
        },
      ],
    }),
    [residentialCalc]
  );

  return (
    <main className="min-h-screen w-full bg-slate-100 px-4 py-8 md:px-8">
      <div className="w-full space-y-8">
        <section className="rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-xl md:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
            North Texas Planning Suite
          </p>
          <h1 className="mt-2 text-3xl font-bold md:text-5xl">Davron&apos;s real estate calculator</h1>
          <p className="mt-3 max-w-4xl text-sm text-slate-200 md:text-base">
            One place to plan home buying, analyze concessions, compare counties, model commercial deals, and
            pressure-test sell/hold or business ideas.
          </p>
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-lg">
          <div className="grid gap-2 md:grid-cols-3">
            {[
              ['residential', 'Residential'],
              ['commercial', 'Commercial'],
              ['other', 'Other Calculators'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key as AppTab)}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  activeTab === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {activeTab === 'residential' ? (
          <section className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-lg">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold text-slate-900">Mortgage Calculator</h2>
                <select
                  value={selectedCounty}
                  onChange={(event) => setSelectedCounty(event.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                >
                  {Object.entries(DALLAS_AREA_COUNTIES).map(([value, profile]) => (
                    <option key={value} value={value}>
                      {profile.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                  onClick={() => setResidentialInputs(buildResidentialDefaults(county))}
                >
                  Apply county defaults
                </button>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                County presets include typical home price, tax rate, insurance, utilities, HOA, and income context.
              </p>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-4 rounded-2xl bg-slate-50 p-4">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <NumberInput
                      label="Home price"
                      value={residentialInputs.homePrice}
                      onChange={(value) => setResidentialInputs((prev) => ({ ...prev, homePrice: value }))}
                    />
                    <NumberInput
                      label="Down payment"
                      value={residentialInputs.downPayment}
                      onChange={(value) => setResidentialInputs((prev) => ({ ...prev, downPayment: value }))}
                    />
                    <NumberInput
                      label="Loan term (years)"
                      value={residentialInputs.loanTerm}
                      onChange={(value) => setResidentialInputs((prev) => ({ ...prev, loanTerm: value }))}
                    />
                    <NumberInput
                      label="Interest rate (%)"
                      value={residentialInputs.interestRate}
                      step={0.01}
                      onChange={(value) => setResidentialInputs((prev) => ({ ...prev, interestRate: value }))}
                    />
                    <NumberInput
                      label="Property tax rate (%)"
                      value={residentialInputs.propertyTaxRate}
                      step={0.01}
                      onChange={(value) => setResidentialInputs((prev) => ({ ...prev, propertyTaxRate: value }))}
                    />
                    <NumberInput
                      label="Insurance per year"
                      value={residentialInputs.annualHomeInsurance}
                      onChange={(value) =>
                        setResidentialInputs((prev) => ({ ...prev, annualHomeInsurance: value }))
                      }
                    />
                    <NumberInput
                      label="PMI rate (%)"
                      value={
                        residentialInputs.autoPMI
                          ? calculateSuggestedPMI(
                              residentialInputs.homePrice > 0
                                ? residentialInputs.downPayment / residentialInputs.homePrice
                                : 0
                            )
                          : residentialInputs.pmiRate
                      }
                      step={0.01}
                      onChange={(value) => setResidentialInputs((prev) => ({ ...prev, pmiRate: value }))}
                      hint={residentialInputs.autoPMI ? 'Auto PMI is ON' : undefined}
                    />
                    <NumberInput
                      label="Closing cost rate (%)"
                      value={residentialInputs.closingCostRate}
                      step={0.1}
                      onChange={(value) => setResidentialInputs((prev) => ({ ...prev, closingCostRate: value }))}
                    />
                    <NumberInput
                      label="HOA per month"
                      value={residentialInputs.monthlyHOA}
                      onChange={(value) => setResidentialInputs((prev) => ({ ...prev, monthlyHOA: value }))}
                    />
                    <NumberInput
                      label="Utilities per month"
                      value={residentialInputs.monthlyUtilities}
                      onChange={(value) => setResidentialInputs((prev) => ({ ...prev, monthlyUtilities: value }))}
                    />
                    <NumberInput
                      label="Maintenance rate (%)"
                      value={residentialInputs.maintenanceRate}
                      step={0.1}
                      onChange={(value) => setResidentialInputs((prev) => ({ ...prev, maintenanceRate: value }))}
                    />
                    <NumberInput
                      label="Extra principal / month"
                      value={residentialInputs.monthlyExtraPayment}
                      onChange={(value) =>
                        setResidentialInputs((prev) => ({ ...prev, monthlyExtraPayment: value }))
                      }
                    />
                    <NumberInput
                      label="Household income / year"
                      value={residentialInputs.annualIncome}
                      onChange={(value) => setResidentialInputs((prev) => ({ ...prev, annualIncome: value }))}
                    />
                    <NumberInput
                      label="Other debts / month"
                      value={residentialInputs.monthlyDebts}
                      onChange={(value) => setResidentialInputs((prev) => ({ ...prev, monthlyDebts: value }))}
                    />
                    <NumberInput
                      label="Comparable rent / month"
                      value={residentialInputs.monthlyRentAlternative}
                      onChange={(value) =>
                        setResidentialInputs((prev) => ({ ...prev, monthlyRentAlternative: value }))
                      }
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={residentialInputs.autoPMI}
                        onChange={(event) =>
                          setResidentialInputs((prev) => ({ ...prev, autoPMI: event.target.checked }))
                        }
                      />
                      Auto-suggest PMI
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <p className="text-sm text-slate-600">Estimated monthly outflow</p>
                    <p className="mt-1 text-4xl font-bold text-slate-950">
                      {formatCurrency(residentialCalc.totalMonthlyPayment)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {county.name} defaults active. Loan amount {formatCurrency(residentialCalc.totalLoanAmount)}.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-600">Cash to close</p>
                      <p className="text-2xl font-semibold text-slate-950">
                        {formatCurrency(residentialCalc.cashToClose)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-600">Front / back DTI</p>
                      <p className="text-2xl font-semibold text-slate-950">
                        {formatPercent(residentialCalc.frontEndDTI)} / {formatPercent(residentialCalc.backEndDTI)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-600">Interest over term</p>
                      <p className="text-2xl font-semibold text-slate-950">
                        {formatCurrency(residentialCalc.totalInterestPaid)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-600">Years saved w/ extra pay</p>
                      <p className="text-2xl font-semibold text-emerald-700">
                        {residentialCalc.yearsSavedWithExtraPayments.toFixed(1)} years
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <p className="text-sm font-semibold text-slate-900">Payment mix</p>
                    <div className="mx-auto mt-3 max-w-xs">
                      <Doughnut
                        data={chartData}
                        options={{
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                boxWidth: 12,
                                color: '#334155',
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-slate-900">Seller concessions vs lower sales price</h3>
              <p className="mt-2 text-sm text-slate-600">
                Compare upfront cash savings from concessions to long-term monthly savings from negotiating a lower
                purchase price.
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <NumberInput
                  label="Seller concession amount"
                  value={residentialInputs.sellerConcessionAmount}
                  onChange={(value) =>
                    setResidentialInputs((prev) => ({ ...prev, sellerConcessionAmount: value }))
                  }
                />
                <NumberInput
                  label="Price-reduction comparison"
                  value={residentialInputs.priceReductionComparisonAmount}
                  onChange={(value) =>
                    setResidentialInputs((prev) => ({ ...prev, priceReductionComparisonAmount: value }))
                  }
                />
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Concession usable at closing</p>
                  <p className="mt-1 text-2xl font-semibold text-emerald-700">
                    {formatCurrency(concessionAnalysis.concessionAppliedToClosing)}
                  </p>
                  <p className="text-xs text-slate-500">New cash to close: {formatCurrency(concessionAnalysis.cashToCloseWithConcession)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Monthly savings from price cut</p>
                  <p className="mt-1 text-2xl font-semibold text-blue-700">
                    {formatCurrency(concessionAnalysis.monthlySavingsFromPriceCut)}/mo
                  </p>
                  <p className="text-xs text-slate-500">
                    Breakeven: {concessionAnalysis.breakevenMonths > 0 ? `${concessionAnalysis.breakevenMonths.toFixed(1)} months` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === 'commercial' ? (
          <section className="space-y-6 rounded-3xl bg-white p-6 shadow-lg">
            <h2 className="text-2xl font-semibold text-slate-900">Commercial Deal Analyzer</h2>
            <p className="text-sm text-slate-600">
              Underwrite a property concept quickly with debt service, DSCR, cap rate, and break-even occupancy.
            </p>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <NumberInput
                label="Purchase price"
                value={commercialInputs.purchasePrice}
                onChange={(value) => setCommercialInputs((prev) => ({ ...prev, purchasePrice: value }))}
              />
              <NumberInput
                label="Down payment (%)"
                value={commercialInputs.downPaymentPercent}
                step={0.1}
                onChange={(value) => setCommercialInputs((prev) => ({ ...prev, downPaymentPercent: value }))}
              />
              <NumberInput
                label="Interest rate (%)"
                value={commercialInputs.interestRate}
                step={0.01}
                onChange={(value) => setCommercialInputs((prev) => ({ ...prev, interestRate: value }))}
              />
              <NumberInput
                label="Loan term (years)"
                value={commercialInputs.loanTermYears}
                onChange={(value) => setCommercialInputs((prev) => ({ ...prev, loanTermYears: value }))}
              />
              <NumberInput
                label="Gross potential income / year"
                value={commercialInputs.grossPotentialIncomeAnnual}
                onChange={(value) =>
                  setCommercialInputs((prev) => ({ ...prev, grossPotentialIncomeAnnual: value }))
                }
              />
              <NumberInput
                label="Vacancy rate (%)"
                value={commercialInputs.vacancyRate}
                step={0.1}
                onChange={(value) => setCommercialInputs((prev) => ({ ...prev, vacancyRate: value }))}
              />
              <NumberInput
                label="Operating expenses / year"
                value={commercialInputs.operatingExpensesAnnual}
                onChange={(value) =>
                  setCommercialInputs((prev) => ({ ...prev, operatingExpensesAnnual: value }))
                }
              />
              <NumberInput
                label="Seller concessions"
                value={commercialInputs.sellerConcessionAmount}
                onChange={(value) =>
                  setCommercialInputs((prev) => ({ ...prev, sellerConcessionAmount: value }))
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Annual NOI</p>
                <p className="text-2xl font-semibold text-slate-950">{formatCurrency(commercialMetrics.noi)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Annual debt service</p>
                <p className="text-2xl font-semibold text-slate-950">
                  {formatCurrency(commercialMetrics.annualDebtService)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">DSCR</p>
                <p className={`text-2xl font-semibold ${commercialMetrics.dscr >= 1.25 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {commercialMetrics.dscr.toFixed(2)}x
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Cap rate</p>
                <p className="text-2xl font-semibold text-slate-950">{formatPercent(commercialMetrics.capRate, 2)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Break-even occupancy</p>
                <p className="text-2xl font-semibold text-slate-950">
                  {formatPercent(commercialMetrics.breakEvenOccupancy, 1)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Loan amount</p>
                <p className="text-2xl font-semibold text-slate-950">
                  {formatCurrency(commercialDebtCalculation.totalLoanAmount)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Monthly debt payment</p>
                <p className="text-2xl font-semibold text-slate-950">
                  {formatCurrency(commercialDebtCalculation.monthlyPrincipalAndInterest)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Concessions reducing close costs</p>
                <p className="text-2xl font-semibold text-emerald-700">
                  {formatCurrency(commercialMetrics.concessionImpact)}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === 'other' ? (
          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-lg">
              <h2 className="text-2xl font-semibold text-slate-900">Current Home: Sell or Hold</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <NumberInput
                  label="Current home value"
                  value={sellOrHoldInputs.currentHomeValue}
                  onChange={(value) => setSellOrHoldInputs((prev) => ({ ...prev, currentHomeValue: value }))}
                />
                <NumberInput
                  label="Mortgage balance"
                  value={sellOrHoldInputs.currentMortgageBalance}
                  onChange={(value) =>
                    setSellOrHoldInputs((prev) => ({ ...prev, currentMortgageBalance: value }))
                  }
                />
                <NumberInput
                  label="Selling cost rate (%)"
                  value={sellOrHoldInputs.sellingCostRate}
                  step={0.1}
                  onChange={(value) => setSellOrHoldInputs((prev) => ({ ...prev, sellingCostRate: value }))}
                />
                <NumberInput
                  label="Repairs before list"
                  value={sellOrHoldInputs.repairBudgetBeforeList}
                  onChange={(value) =>
                    setSellOrHoldInputs((prev) => ({ ...prev, repairBudgetBeforeList: value }))
                  }
                />
                <NumberInput
                  label="Estimated rent / month"
                  value={sellOrHoldInputs.estimatedMonthlyRent}
                  onChange={(value) =>
                    setSellOrHoldInputs((prev) => ({ ...prev, estimatedMonthlyRent: value }))
                  }
                />
                <NumberInput
                  label="Monthly ownership costs"
                  value={sellOrHoldInputs.monthlyOwnershipCosts}
                  onChange={(value) =>
                    setSellOrHoldInputs((prev) => ({ ...prev, monthlyOwnershipCosts: value }))
                  }
                />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Estimated net sale proceeds</p>
                  <p className="text-2xl font-semibold text-slate-950">
                    {formatCurrency(sellOrHoldMetrics.netSaleProceeds)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Annual cashflow if held as rental</p>
                  <p className={`text-2xl font-semibold ${sellOrHoldMetrics.annualRentCashflow >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {formatCurrency(sellOrHoldMetrics.annualRentCashflow)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                  <p className="text-sm text-slate-600">Years of rental cashflow to match selling now</p>
                  <p className="text-2xl font-semibold text-slate-950">
                    {sellOrHoldMetrics.holdYearsToMatchSale > 0
                      ? `${sellOrHoldMetrics.holdYearsToMatchSale.toFixed(1)} years`
                      : 'Not currently positive'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-lg">
              <h2 className="text-2xl font-semibold text-slate-900">Business Idea Projection</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <NumberInput
                  label="Startup cost"
                  value={businessIdeaInputs.startupCost}
                  onChange={(value) => setBusinessIdeaInputs((prev) => ({ ...prev, startupCost: value }))}
                />
                <NumberInput
                  label="Revenue / month"
                  value={businessIdeaInputs.monthlyRevenue}
                  onChange={(value) => setBusinessIdeaInputs((prev) => ({ ...prev, monthlyRevenue: value }))}
                />
                <NumberInput
                  label="Variable costs / month"
                  value={businessIdeaInputs.monthlyVariableCosts}
                  onChange={(value) =>
                    setBusinessIdeaInputs((prev) => ({ ...prev, monthlyVariableCosts: value }))
                  }
                />
                <NumberInput
                  label="Fixed costs / month"
                  value={businessIdeaInputs.monthlyFixedCosts}
                  onChange={(value) => setBusinessIdeaInputs((prev) => ({ ...prev, monthlyFixedCosts: value }))}
                />
                <NumberInput
                  label="Debt service / month"
                  value={businessIdeaInputs.monthlyDebtService}
                  onChange={(value) => setBusinessIdeaInputs((prev) => ({ ...prev, monthlyDebtService: value }))}
                />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Monthly net cashflow</p>
                  <p className={`text-2xl font-semibold ${businessMetrics.monthlyNetCashflow >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {formatCurrency(businessMetrics.monthlyNetCashflow)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Annual net cashflow</p>
                  <p className={`text-2xl font-semibold ${businessMetrics.annualNetCashflow >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {formatCurrency(businessMetrics.annualNetCashflow)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Net margin</p>
                  <p className="text-2xl font-semibold text-slate-950">{formatPercent(businessMetrics.margin, 1)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Break-even revenue / month</p>
                  <p className="text-2xl font-semibold text-slate-950">
                    {formatCurrency(businessMetrics.breakEvenRevenue)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                  <p className="text-sm text-slate-600">Startup payback period</p>
                  <p className="text-2xl font-semibold text-slate-950">
                    {businessMetrics.paybackMonths > 0
                      ? `${businessMetrics.paybackMonths.toFixed(1)} months`
                      : 'Not positive yet'}
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
