import React, { useState, useEffect, useCallback } from 'react';
import { useTokenPrices } from '../hooks/useTokenPrices';
import { calculateConversion, formatToTwoDecimals, validateInput } from '../utils/swap';
import CurrencyInput from './CurrencyInput';

export default function CurrencySwapForm() {
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [fromCurrency, setFromCurrency] = useState<string>('ETH');
  const [toCurrency, setToCurrency] = useState<string>('USDC');
  const [isSwapping, setIsSwapping] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { tokens, isLoading, error: apiError, getPrice } = useTokenPrices();

  // Handle calculation
  useEffect(() => {
    setToAmount(calculateConversion(fromAmount, getPrice(fromCurrency), getPrice(toCurrency)));
  }, [fromAmount, fromCurrency, toCurrency, tokens, getPrice]);

  const handleSwapValues = useCallback(() => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmount);
  }, [fromCurrency, toCurrency, toAmount]);

  const handleAmountChange = useCallback((val: string) => {
    if (validateInput(val)) setFromAmount(val);
  }, []);

  const handleBlur = useCallback(() => {
    setFromAmount((prev) => formatToTwoDecimals(prev));
  }, []);
  const handleSwap = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const amount = Number(fromAmount);
    if (!fromAmount || isNaN(amount) || amount <= 0) {
      setFormError('Please enter a valid amount to swap.');
      return;
    }

    if (fromCurrency === toCurrency) {
      setFormError('Cannot swap the same currency.');
      return;
    }

    setIsSwapping(true);
    // Simulate API Call
    setTimeout(() => {
      setIsSwapping(false);
      alert(`Successfully swapped ${fromAmount} ${fromCurrency} to ${toAmount} ${toCurrency}!`);
      setFromAmount('');
      setToAmount('');
    }, 1500);
  };

  const error = apiError || formError;

  return (
    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl transition-colors duration-200">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Swap</h2>

      <form onSubmit={handleSwap} className="space-y-3">

        <CurrencyInput
          label="You pay"
          amount={fromAmount}
          currency={fromCurrency}
          tokens={tokens}
          price={getPrice(fromCurrency)}
          onAmountChange={handleAmountChange}
          onCurrencyChange={setFromCurrency}
          onBlur={handleBlur}
        />

        {/* Swap Button (Middle) */}
        <div className="relative flex justify-center -my-5 z-10">
          <button
            type="button"
            tabIndex={0}
            onClick={handleSwapValues}
            className="bg-white dark:bg-slate-800 p-1.5 rounded-xl border-[3px] border-slate-50 dark:border-slate-950 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 16 4 4 4-4" /><path d="M7 20V4" /><path d="m21 8-4-4-4 4" /><path d="M17 4v16" /></svg>
          </button>
        </div>

        <CurrencyInput
          label="You receive"
          amount={toAmount}
          currency={toCurrency}
          tokens={tokens}
          price={getPrice(toCurrency)}
          readOnly
          onCurrencyChange={setToCurrency}
        />

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          tabIndex={0}
          disabled={isSwapping || isLoading}
          className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 text-sm rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {isSwapping || isLoading ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
              {isLoading ? 'Loading Rates...' : 'Swapping...'}
            </>
          ) : (
            'Confirm Swap'
          )}
        </button>
      </form>
    </div>
  );
}
