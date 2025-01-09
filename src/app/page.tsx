'use client';

import { useState } from 'react';
import { useForm, UseFormRegister, FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { MortgageInputs, MortgageCalculation } from '../types/mortgage';
import { calculateMortgage } from '../utils/mortgageCalculator';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

const schema = z.object({
  homePrice: z.number().min(1, "Home price is required"),
  downPayment: z.number().min(0, "Down payment must be positive"),
  loanTerm: z.number().min(1, "Loan term must be at least 1 year"),
  interestRate: z.number().min(0, "Interest rate must be positive"),
  propertyTax: z.number().min(0, "Property tax must be positive"),
  homeInsurance: z.number().min(0, "Home insurance must be positive"),
  pmi: z.number().min(0, "PMI must be positive"),
  hoa: z.number().min(0, "HOA must be positive"),
  utilities: z.number().min(0, "Utilities must be positive"),
  maintenance: z.number().min(0, "Maintenance must be positive"),
});

interface InputFieldProps {
  label: string;
  register: UseFormRegister<MortgageInputs>;
  name: keyof MortgageInputs;
  error: FieldError | undefined;
  placeholder: string;
}

const formatNumberWithCommas = (value: string | number): string => {
  // Convert to string and remove existing commas
  const numberStr = value.toString().replace(/,/g, '');

  // Split on decimal point
  const parts = numberStr.split('.');

  // Format the whole number part with commas
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Rejoin with decimal part if it exists
  return parts.join('.');
};

const InputField = ({ label, register, name, error, placeholder }: InputFieldProps) => {
  const formatValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Remove all characters except numbers and decimal point
    value = value.replace(/[^\d.]/g, '');

    // Ensure only one decimal point
    const decimalCount = (value.match(/\./g) || []).length;
    if (decimalCount > 1) {
      value = value.replace(/\./g, (match, index, string) =>
        index === string.indexOf('.') ? '.' : ''
      );
    }

    if (value) {
      // For percentage fields, allow more decimal places
      const isPercentage = name === 'interestRate' || name === 'propertyTax' || name === 'pmi';
      const decimalPlaces = isPercentage ? 3 : 2;

      // Split number into whole and decimal parts
      const parts = value.split('.');
      if (parts[1] && parts[1].length > decimalPlaces) {
        parts[1] = parts[1].slice(0, decimalPlaces);
        value = parts.join('.');
      }

      const number = parseFloat(value);
      if (!isNaN(number)) {
        e.target.value = formatNumberWithCommas(value);
      }
    }
  };

  const registerOptions = {
    ...register(name, {
      setValueAs: (value: string | number): number => {
        if (!value) return 0;
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
          return parseFloat(value.replace(/,/g, '')) || 0;
        }
        return 0;
      }
    }),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      formatValue(e);
      registerOptions.onChange(e); // Call the original onChange from register
    }
  };

  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-gray-800">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        onFocus={(e) => e.target.select()}
        {...registerOptions}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
      />
      {error && <span className="text-red-500 text-xs">{error.message}</span>}
    </div>
  );
};

export default function Home() {
  const [calculation, setCalculation] = useState<MortgageCalculation | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<MortgageInputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      homePrice: 300000,
      downPayment: 60000,
      loanTerm: 30,
      interestRate: 3.5,
      propertyTax: 1.2,
      homeInsurance: 1200,
      pmi: 0.5,
      hoa: 250,
      utilities: 200,
      maintenance: 200,
    },
  });

  const onSubmit = (data: MortgageInputs) => {
    const result = calculateMortgage(data);
    setCalculation(result);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900">
          Mortgage Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Home Price ($)"
                  register={register}
                  name="homePrice"
                  error={errors.homePrice}
                  placeholder="300,000"
                />
                <InputField
                  label="Down Payment ($)"
                  register={register}
                  name="downPayment"
                  error={errors.downPayment}
                  placeholder="60,000"
                />
                <InputField
                  label="Loan Term (years)"
                  register={register}
                  name="loanTerm"
                  error={errors.loanTerm}
                  placeholder="30"
                />
                <InputField
                  label="Interest Rate (%)"
                  register={register}
                  name="interestRate"
                  error={errors.interestRate}
                  placeholder="3.5"
                />
                <InputField
                  label="Property Tax Rate (%)"
                  register={register}
                  name="propertyTax"
                  error={errors.propertyTax}
                  placeholder="1.2"
                />
                <InputField
                  label="Home Insurance ($/year)"
                  register={register}
                  name="homeInsurance"
                  error={errors.homeInsurance}
                  placeholder="1,200"
                />
                <InputField
                  label="PMI Rate (%)"
                  register={register}
                  name="pmi"
                  error={errors.pmi}
                  placeholder="0.5"
                />
                <InputField
                  label="HOA ($/month)"
                  register={register}
                  name="hoa"
                  error={errors.hoa}
                  placeholder="250"
                />
                <InputField
                  label="Utilities ($/month)"
                  register={register}
                  name="utilities"
                  error={errors.utilities}
                  placeholder="200"
                />
                <InputField
                  label="Maintenance ($/month)"
                  register={register}
                  name="maintenance"
                  error={errors.maintenance}
                  placeholder="200"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Calculate
              </button>
            </form>
          </div>

          {calculation && (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Monthly Payment Breakdown</h2>
              <div className="space-y-4">
                <div className="bg-blue-100 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-blue-900">
                    Total Monthly Payment: {formatCurrency(calculation.totalMonthlyPayment)}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <p className="text-sm font-medium text-gray-900 mb-1">Principal & Interest</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(calculation.monthlyPrincipalAndInterest)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <p className="text-sm font-medium text-gray-900 mb-1">Property Tax</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(calculation.monthlyPropertyTax)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <p className="text-sm font-medium text-gray-900 mb-1">Insurance</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(calculation.monthlyInsurance)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <p className="text-sm font-medium text-gray-900 mb-1">PMI</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(calculation.monthlyPMI)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <p className="text-sm font-medium text-gray-900 mb-1">HOA</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(calculation.monthlyHOA)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <p className="text-sm font-medium text-gray-900 mb-1">Utilities</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(calculation.monthlyUtilities)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <p className="text-sm font-medium text-gray-900 mb-1">Maintenance</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(calculation.monthlyMaintenance)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-5 bg-blue-100 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">Loan Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Total Loan Amount</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(calculation.totalLoanAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Total Interest Paid</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(calculation.totalInterestPaid)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
