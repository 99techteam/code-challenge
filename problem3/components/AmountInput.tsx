"use client";

import React, { useState, useEffect } from "react";
import { TokenPrice } from "../types/token";

interface AmountInputProps {
  label: string;
  amount: string;
  setAmount: (val: string) => void;
  token: TokenPrice | null;
  isOutput: boolean;
  readOnly?: boolean;
}

export default function AmountInput({ 
  label, 
  amount, 
  setAmount, 
  token,
  isOutput,
  readOnly = false 
}: AmountInputProps) {
  const [localAmount, setLocalAmount] = useState(amount);

  // Sync prop to local state
  useEffect(() => {
    setLocalAmount(amount);
  }, [amount]);

  // Debouncing logic
  useEffect(() => {
    if (readOnly) return;
    const timer = setTimeout(() => {
      setAmount(localAmount);
    }, 300);
    return () => clearTimeout(timer);
  }, [localAmount, setAmount, readOnly]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow empty or valid decimal numbers
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setLocalAmount(val);
    }
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200
      ${isOutput ? 'bg-gray-50/50 dark:bg-gray-800/30 border-transparent' : 'bg-gray-100/80 dark:bg-gray-800/80 border-transparent'}
      hover:border-gray-200 dark:hover:border-gray-700
      focus-within:border-blue-500 dark:focus-within:border-blue-600 focus-within:bg-white dark:focus-within:bg-gray-900 focus-within:shadow-[0_0_0_1px_rgba(59,130,246,1)]
    `}>
      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
        {label}
      </label>
      <div className="flex items-center">
        <input
          type="text"
          value={localAmount}
          onChange={handleChange}
          placeholder="0.0"
          readOnly={readOnly}
          className={`w-full bg-transparent text-3xl sm:text-4xl font-semibold outline-none truncate pr-[140px]
            ${readOnly ? 'text-gray-900 dark:text-gray-100' : 'text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600'}
          `}
        />
      </div>
      <div className="h-6 mt-1 flex items-center">
        {token && token.price ? (
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
            {localAmount && !isNaN(parseFloat(localAmount))
              ? `~$${(parseFloat(localAmount) * token.price).toFixed(2)}`
              : `~$0.00`}
          </p>
        ) : (
          <p className="text-sm font-medium text-transparent">Sp</p> 
        )}
      </div>
    </div>
  );
}
