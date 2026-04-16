'use client';

import { useEffect, useMemo } from 'react';
import { useForm, UseFormRegister, FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { MortgageInputs } from '../types/mortgage';
import { calculateMortgage } from '../utils/mortgageCalculator';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLLIN_COUNTY_BASELINE = {
  homePrice: 519000,
  interestRate: 6.37,
  propertyTaxRatePrimary: 1.66,
  propertyTaxRateNonPrimary: 2.2,
  annualHomeInsurance: 4200,
  monthlyHOA: 70,
  monthlyUtilities: 325,
  maintenanceRate: 1.0,
  closingCostRate: 3.0,
  annualIncome: 124920,
  monthlyDebts: 650,
};

type MortgageFormValues = MortgageInputs & {
  autoPMI: boolean;
  isPrimaryResidence: boolean;
};

const schema = z.object({
  homePrice: z.number().min(1, 'Home price is required'),
  downPayment: z.number().min(0, 'Down payment cannot be negative'),
  loanTerm: z.number().min(1, 'Loan term must be at least 1 year'),
  interestRate: z.number().min(0, 'Interest rate cannot be negative'),
  propertyTaxRate: z.number().min(0, 'Property tax rate cannot be negative'),
  annualHomeInsurance: z.number().min(0, 'Insurance cannot be negative'),
  pmiRate: z.number().min(0, 'PMI rate cannot be negative'),
  monthlyHOA: z.number().min(0, 'HOA cannot be negative'),
  monthlyUtilities: z.number().min(0, 'Utilities cannot be negative'),
  maintenanceRate: z.number().min(0, 'Maintenance rate cannot be negative'),
  monthlyExtraPayment: z.number().min(0, 'Extra payment cannot be negative'),
  closingCostRate: z.number().min(0, 'Closing costs cannot be negative'),
  annualIncome: z.number().min(0, 'Income cannot be negative'),
  monthlyDebts: z.number().min(0, 'Debts cannot be negative'),
  autoPMI: z.boolean(),
  isPrimaryResidence: z.boolean(),
});

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercent(amount: number, digits = 1) {
  return `${(amount * 100).toFixed(digits)}%`;
}

function formatRate(amount: number, digits = 2) {
  return `${amount.toFixed(digits)}%`;
}

function calculateSuggestedPMIRate(downPaymentPercent: number) {
  if (downPaymentPercent >= 0.2) return 0;
  if (downPaymentPercent >= 0.15) return 0.35;
  if (downPaymentPercent >= 0.1) return 0.5;
  if (downPaymentPercent >= 0.05) return 0.75;
  return 0.9;
}

function formatNumberWithCommas(value: string | number) {
  const numberString = value.toString().replace(/,/g, '');
  const parts = numberString.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

interface NumberFieldProps {
  label: string;
  name: keyof MortgageFormValues;
  register: UseFormRegister<MortgageFormValues>;
  error?: FieldError;
  placeholder: string;
  helpText?: string;
  isPercentage?: boolean;
}

function NumberField({
  label,
  name,
  register,
  error,
  placeholder,
  helpText,
  isPercentage = false,
}: NumberFieldProps) {
  const registration = register(name, {
    setValueAs: (value: string | number) => {
      if (typeof value === 'number') {
        return value;
      }

      if (!value) {
        return 0;
      }

      return Number.parseFloat(value.replace(/,/g, '')) || 0;
    },
  });

  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <input
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        onFocus={(event) => event.target.select()}
        {...registration}
        onChange={(event) => {
          let value = event.target.value.replace(/[^\d.]/g, '');
          const parts = value.split('.');

          if (parts.length > 2) {
            value = `${parts[0]}.${parts.slice(1).join('')}`;
          }

          const maxDecimals = isPercentage ? 3 : 2;
          const normalizedParts = value.split('.');
          if (normalizedParts[1]) {
            normalizedParts[1] = normalizedParts[1].slice(0, maxDecimals);
            value = normalizedParts.join('.');
          }

          event.target.value = value ? formatNumberWithCommas(value) : '';
          registration.onChange(event);
        }}
        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />
      {helpText ? <span className="text-xs text-slate-500">{helpText}</span> : null}
      {error ? <span className="text-xs text-red-600">{error.message}</span> : null}
    </label>
  );
}

interface ToggleFieldProps {
  label: string;
  description: string;
  name: keyof MortgageFormValues;
  register: UseFormRegister<MortgageFormValues>;
}

function ToggleField({ label, description, name, register }: ToggleFieldProps) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <input
        type="checkbox"
        {...register(name)}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />
      <span>
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        <span className="block text-xs text-slate-600">{description}</span>
      </span>
    </label>
  );
}

export default function Home() {
  const defaultDownPayment = COLLIN_COUNTY_BASELINE.homePrice * 0.2;

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MortgageFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      homePrice: COLLIN_COUNTY_BASELINE.homePrice,
      downPayment: defaultDownPayment,
      loanTerm: 30,
      interestRate: COLLIN_COUNTY_BASELINE.interestRate,
      propertyTaxRate: COLLIN_COUNTY_BASELINE.propertyTaxRatePrimary,
      annualHomeInsurance: COLLIN_COUNTY_BASELINE.annualHomeInsurance,
      pmiRate: calculateSuggestedPMIRate(0.2),
      monthlyHOA: COLLIN_COUNTY_BASELINE.monthlyHOA,
      monthlyUtilities: COLLIN_COUNTY_BASELINE.monthlyUtilities,
      maintenanceRate: COLLIN_COUNTY_BASELINE.maintenanceRate,
      monthlyExtraPayment: 0,
      closingCostRate: COLLIN_COUNTY_BASELINE.closingCostRate,
      annualIncome: COLLIN_COUNTY_BASELINE.annualIncome,
      monthlyDebts: COLLIN_COUNTY_BASELINE.monthlyDebts,
      autoPMI: true,
      isPrimaryResidence: true,
    },
  });

  const values = watch();
  const homePrice = values.homePrice || 0;
  const downPayment = values.downPayment || 0;
  const downPaymentPercent = homePrice > 0 ? downPayment / homePrice : 0;

  useEffect(() => {
    const nextRate = values.isPrimaryResidence
      ? COLLIN_COUNTY_BASELINE.propertyTaxRatePrimary
      : COLLIN_COUNTY_BASELINE.propertyTaxRateNonPrimary;

    setValue('propertyTaxRate', nextRate, { shouldValidate: true, shouldDirty: true });
  }, [setValue, values.isPrimaryResidence]);

  useEffect(() => {
    if (!values.autoPMI) {
      return;
    }

    setValue('pmiRate', calculateSuggestedPMIRate(downPaymentPercent), {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [downPaymentPercent, setValue, values.autoPMI]);

  const calculation = useMemo(
    () =>
      calculateMortgage({
        homePrice: values.homePrice || 0,
        downPayment: values.downPayment || 0,
        loanTerm: values.loanTerm || 30,
        interestRate: values.interestRate || 0,
        propertyTaxRate: values.propertyTaxRate || 0,
        annualHomeInsurance: values.annualHomeInsurance || 0,
        pmiRate: values.pmiRate || 0,
        monthlyHOA: values.monthlyHOA || 0,
        monthlyUtilities: values.monthlyUtilities || 0,
        maintenanceRate: values.maintenanceRate || 0,
        monthlyExtraPayment: values.monthlyExtraPayment || 0,
        closingCostRate: values.closingCostRate || 0,
        annualIncome: values.annualIncome || 0,
        monthlyDebts: values.monthlyDebts || 0,
      }),
    [values]
  );

  const chartData = useMemo(
    () => ({
      labels: [
        'Principal & interest',
        'Property tax',
        'Insurance',
        'PMI',
        'HOA',
        'Utilities',
        'Maintenance',
      ],
      datasets: [
        {
          data: [
            calculation.monthlyPrincipalAndInterest,
            calculation.monthlyPropertyTax,
            calculation.monthlyInsurance,
            calculation.monthlyPMI,
            calculation.monthlyHOA,
            calculation.monthlyUtilities,
            calculation.monthlyMaintenance,
          ],
          backgroundColor: [
            '#2563eb',
            '#0f766e',
            '#7c3aed',
            '#db2777',
            '#f59e0b',
            '#0891b2',
            '#64748b',
          ],
          borderWidth: 0,
        },
      ],
    }),
    [calculation]
  );

  const affordabilityTone =
    calculation.frontEndDTI <= 0.28 && calculation.backEndDTI <= 0.36
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : calculation.backEndDTI <= 0.43
        ? 'text-amber-700 bg-amber-50 border-amber-200'
        : 'text-red-700 bg-red-50 border-red-200';

  const applySuggestedDefaults = (downPaymentPercentOverride: number) => {
    const suggestedDownPayment = COLLIN_COUNTY_BASELINE.homePrice * downPaymentPercentOverride;

    setValue('homePrice', COLLIN_COUNTY_BASELINE.homePrice, { shouldValidate: true });
    setValue('downPayment', suggestedDownPayment, { shouldValidate: true });
    setValue('loanTerm', 30, { shouldValidate: true });
    setValue('interestRate', COLLIN_COUNTY_BASELINE.interestRate, { shouldValidate: true });
    setValue('propertyTaxRate', COLLIN_COUNTY_BASELINE.propertyTaxRatePrimary, {
      shouldValidate: true,
    });
    setValue('annualHomeInsurance', COLLIN_COUNTY_BASELINE.annualHomeInsurance, {
      shouldValidate: true,
    });
    setValue('monthlyHOA', COLLIN_COUNTY_BASELINE.monthlyHOA, { shouldValidate: true });
    setValue('monthlyUtilities', COLLIN_COUNTY_BASELINE.monthlyUtilities, {
      shouldValidate: true,
    });
    setValue('maintenanceRate', COLLIN_COUNTY_BASELINE.maintenanceRate, {
      shouldValidate: true,
    });
    setValue('monthlyExtraPayment', 0, { shouldValidate: true });
    setValue('closingCostRate', COLLIN_COUNTY_BASELINE.closingCostRate, {
      shouldValidate: true,
    });
    setValue('annualIncome', COLLIN_COUNTY_BASELINE.annualIncome, { shouldValidate: true });
    setValue('monthlyDebts', COLLIN_COUNTY_BASELINE.monthlyDebts, { shouldValidate: true });
    setValue('isPrimaryResidence', true, { shouldValidate: true });
    setValue('autoPMI', true, { shouldValidate: true });
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-xl md:px-8">
          <div className="max-w-4xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
              Collin County, Texas
            </p>
            <h1 className="text-3xl font-bold md:text-5xl">Mortgage calculator with real planning inputs</h1>
            <p className="max-w-3xl text-sm text-slate-200 md:text-base">
              Estimate your payment, cash needed up front, debt-to-income ratios, PMI, and how
              much faster you can pay off the loan with extra principal. Suggested defaults are
              tuned to Collin County using 2025 home-value context and 2026 rate assumptions.
            </p>
            <div className="flex flex-wrap gap-3 pt-2 text-xs text-slate-200">
              <button
                type="button"
                onClick={() => applySuggestedDefaults(0.05)}
                className="rounded-full bg-white/10 px-4 py-2 font-medium hover:bg-white/20"
              >
                5% down starter preset
              </button>
              <button
                type="button"
                onClick={() => applySuggestedDefaults(0.1)}
                className="rounded-full bg-white/10 px-4 py-2 font-medium hover:bg-white/20"
              >
                10% down balanced preset
              </button>
              <button
                type="button"
                onClick={() => applySuggestedDefaults(0.2)}
                className="rounded-full bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-400"
              >
                20% down county median preset
              </button>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-6 rounded-3xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Inputs</h2>
                <p className="text-sm text-slate-600">Estimates update instantly as you type.</p>
              </div>
              <div className="rounded-2xl bg-blue-50 px-4 py-3 text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
                  Down payment
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatPercent(calculation.downPaymentPercent)}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <NumberField
                label="Home price"
                name="homePrice"
                register={register}
                error={errors.homePrice}
                placeholder="519,000"
                helpText="Collin County median value context used for preset defaults."
              />
              <NumberField
                label="Down payment"
                name="downPayment"
                register={register}
                error={errors.downPayment}
                placeholder="103,800"
              />
              <NumberField
                label="Loan term (years)"
                name="loanTerm"
                register={register}
                error={errors.loanTerm}
                placeholder="30"
              />
              <NumberField
                label="Interest rate"
                name="interestRate"
                register={register}
                error={errors.interestRate}
                placeholder="6.37"
                helpText="Default tracks April 2026 Freddie Mac 30-year survey territory."
                isPercentage
              />
              <NumberField
                label="Property tax rate"
                name="propertyTaxRate"
                register={register}
                error={errors.propertyTaxRate}
                placeholder="1.66"
                helpText="Primary-residence preset is lower than non-homestead investor use."
                isPercentage
              />
              <NumberField
                label="Home insurance per year"
                name="annualHomeInsurance"
                register={register}
                error={errors.annualHomeInsurance}
                placeholder="4,200"
              />
              <NumberField
                label="PMI rate"
                name="pmiRate"
                register={register}
                error={errors.pmiRate}
                placeholder="0.75"
                helpText="Automatically suggested from your down payment unless you override it."
                isPercentage
              />
              <NumberField
                label="Closing costs"
                name="closingCostRate"
                register={register}
                error={errors.closingCostRate}
                placeholder="3"
                helpText="Typical buyer-side estimate for lender fees, title, and prepaid items."
                isPercentage
              />
              <NumberField
                label="HOA per month"
                name="monthlyHOA"
                register={register}
                error={errors.monthlyHOA}
                placeholder="70"
              />
              <NumberField
                label="Utilities per month"
                name="monthlyUtilities"
                register={register}
                error={errors.monthlyUtilities}
                placeholder="325"
              />
              <NumberField
                label="Maintenance reserve"
                name="maintenanceRate"
                register={register}
                error={errors.maintenanceRate}
                placeholder="1"
                helpText="Annual percentage of home value reserved for repairs and upkeep."
                isPercentage
              />
              <NumberField
                label="Extra principal per month"
                name="monthlyExtraPayment"
                register={register}
                error={errors.monthlyExtraPayment}
                placeholder="0"
              />
              <NumberField
                label="Household income per year"
                name="annualIncome"
                register={register}
                error={errors.annualIncome}
                placeholder="124,920"
              />
              <NumberField
                label="Other monthly debts"
                name="monthlyDebts"
                register={register}
                error={errors.monthlyDebts}
                placeholder="650"
                helpText="Car loans, student loans, credit cards, child support, etc."
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <ToggleField
                label="Primary residence"
                description="Uses a lower suggested Collin County tax estimate for owner-occupied homes."
                name="isPrimaryResidence"
                register={register}
              />
              <ToggleField
                label="Auto-suggest PMI"
                description="Keeps PMI aligned with your down payment instead of making you guess."
                name="autoPMI"
                register={register}
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Suggested local assumptions</p>
              <p className="mt-2">
                Presets use a roughly <span className="font-semibold">$519k</span> county median
                home value, a <span className="font-semibold">6.37%</span> 30-year fixed baseline,
                <span className="font-semibold"> 1.66%</span> owner-occupied property tax, and
                <span className="font-semibold"> $4,200/year</span> for homeowners insurance in the
                North Texas hail corridor. Treat these as a planning baseline, not a quote.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-lg">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">Estimated monthly outflow</p>
                  <h2 className="text-4xl font-bold text-slate-950">
                    {formatCurrency(calculation.totalMonthlyPayment)}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Includes mortgage payment, HOA, utilities, maintenance reserve, and optional
                    extra principal.
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Loan amount</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(calculation.totalLoanAmount)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatPercent(calculation.loanToValueRatio)} LTV
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  ['Principal & interest', calculation.monthlyPrincipalAndInterest],
                  ['Property tax', calculation.monthlyPropertyTax],
                  ['Insurance', calculation.monthlyInsurance],
                  ['PMI', calculation.monthlyPMI],
                  ['HOA', calculation.monthlyHOA],
                  ['Utilities', calculation.monthlyUtilities],
                  ['Maintenance reserve', calculation.monthlyMaintenance],
                  ['Extra principal', calculation.monthlyExtraPayment],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-600">{label}</p>
                    <p className="mt-1 text-xl font-semibold text-slate-950">
                      {formatCurrency(Number(value))}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-3xl bg-white p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-slate-900">Payment mix</h3>
                <div className="mx-auto mt-4 max-w-xs">
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

              <div className="rounded-3xl bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xl font-semibold text-slate-900">Affordability snapshot</h3>
                  <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${affordabilityTone}`}>
                    Front-end {formatPercent(calculation.frontEndDTI)} / Back-end{' '}
                    {formatPercent(calculation.backEndDTI)}
                  </div>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-600">Mortgage-only payment</p>
                    <p className="mt-1 text-xl font-semibold text-slate-950">
                      {formatCurrency(calculation.monthlyMortgagePayment)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-600">Income for 28% rule</p>
                    <p className="mt-1 text-xl font-semibold text-slate-950">
                      {formatCurrency(calculation.recommendedMonthlyIncome)}/mo
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-600">Cash to close</p>
                    <p className="mt-1 text-xl font-semibold text-slate-950">
                      {formatCurrency(calculation.cashToClose)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Down payment plus estimated closing costs.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-600">Estimated closing costs</p>
                    <p className="mt-1 text-xl font-semibold text-slate-950">
                      {formatCurrency(calculation.closingCosts)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Based on {formatRate(values.closingCostRate || 0)} of the purchase price.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-slate-900">Long-term impact</h3>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-600">Interest over full term</p>
                  <p className="mt-1 text-xl font-semibold text-slate-950">
                    {formatCurrency(calculation.totalInterestPaid)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-600">Interest with extra payments</p>
                  <p className="mt-1 text-xl font-semibold text-slate-950">
                    {formatCurrency(calculation.totalInterestPaidWithExtraPayments)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-600">Interest saved</p>
                  <p className="mt-1 text-xl font-semibold text-emerald-700">
                    {formatCurrency(calculation.interestSavingsFromExtraPayments)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-600">Time saved</p>
                  <p className="mt-1 text-xl font-semibold text-slate-950">
                    {calculation.yearsSavedWithExtraPayments.toFixed(1)} years
                  </p>
                  <p className="text-xs text-slate-500">
                    Payoff in {Math.max(calculation.payoffMonthsWithExtraPayments, 0)} months.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
