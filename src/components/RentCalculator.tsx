"use client";
import { useState } from "react";
import { formatPriceFull } from "@/lib/types";

export function RentCalculator({
  monthlyRent,
  currency,
}: {
  monthlyRent: number;
  currency: string;
}) {
  const [months, setMonths] = useState(12);
  const [deposit, setDeposit] = useState(2);

  const totalRent = monthlyRent * months;
  const depositAmount = monthlyRent * deposit;
  const totalCost = totalRent + depositAmount;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 print:hidden">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        🧮 Rent Calculator
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rental Period (months)
          </label>
          <select
            value={months}
            onChange={(e) => setMonths(parseInt(e.target.value))}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value={6}>6 months</option>
            <option value={12}>12 months (1 year)</option>
            <option value={24}>24 months (2 years)</option>
            <option value={36}>36 months (3 years)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Security Deposit
          </label>
          <select
            value={deposit}
            onChange={(e) => setDeposit(parseInt(e.target.value))}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value={1}>1 month</option>
            <option value={2}>2 months</option>
            <option value={3}>3 months</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Monthly Rent</span>
          <span className="font-medium">{formatPriceFull(monthlyRent, currency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total Rent ({months} months)</span>
          <span className="font-medium">{formatPriceFull(totalRent, currency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Security Deposit ({deposit} month{deposit > 1 ? "s" : ""})</span>
          <span className="font-medium">{formatPriceFull(depositAmount, currency)}</span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between">
          <span className="font-bold text-gray-800">Total Upfront Cost</span>
          <span className="font-bold text-primary text-lg">
            {formatPriceFull(monthlyRent + depositAmount, currency)}
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Total Contract Value</span>
          <span>{formatPriceFull(totalCost, currency)}</span>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        * This is an estimate. Actual terms may vary. Contact the agent for exact costs.
      </p>
    </div>
  );
}
