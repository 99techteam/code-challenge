"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { usePrices } from "../hooks/usePrices";
import { calculateRate, calculateOutput } from "../utils/calculateRate";
import { TokenPrice } from "../types/token";

import TokenSelector from "./TokenSelector";
import AmountInput from "./AmountInput";
import SwapButton from "./SwapButton";
import ExchangeRateInfo from "./ExchangeRateInfo";

export default function SwapCard() {
  const { prices, loading, error } = usePrices();

  const [fromToken, setFromToken] = useState<TokenPrice | null>(null);
  const [toToken, setToToken] = useState<TokenPrice | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default tokens when prices load
  useEffect(() => {
    if (prices.length > 1 && !fromToken && !toToken) {
      setFromToken(prices.find((p) => p.currency === "ETH") || prices[0]);
      setToToken(prices.find((p) => p.currency === "USDC") || prices[1]);
    }
  }, [prices, fromToken, toToken]);

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  const exchangeRate = useMemo(() => {
    if (!fromToken || !toToken) return 0;
    return calculateRate(fromToken.price, toToken.price);
  }, [fromToken, toToken]);

  // Handle amount as number
  const numericAmount = useMemo(() => {
    const parsed = parseFloat(amount);
    return isNaN(parsed) ? 0 : parsed;
  }, [amount]);

  const outputAmount = useMemo(() => {
    return calculateOutput(numericAmount, exchangeRate);
  }, [numericAmount, exchangeRate]);

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast.success(`Successfully swapped ${amount} ${fromToken?.currency} to ${outputAmount.toFixed(4)} ${toToken?.currency}`);
    setAmount("");
    setIsSubmitting(false);
  };

  const isSameToken = fromToken?.currency === toToken?.currency;
  const isInvalidAmount = amount !== "" && numericAmount <= 0;
  
  const isValid = 
    !loading && 
    !error && 
    fromToken && 
    toToken && 
    !isSameToken && 
    amount !== "" && 
    !isInvalidAmount &&
    !isSubmitting;

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 w-full animate-pulse shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl mb-2"></div>
        <div className="flex justify-center -my-3 relative z-10">
          <div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-xl border-4 border-white dark:border-[#0f172a]"></div>
        </div>
        <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl mt-2 mb-6"></div>
        <div className="h-14 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center shadow-xl border border-gray-100 dark:border-gray-800">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-4 sm:p-6 w-full shadow-2xl relative overflow-hidden border border-gray-200 dark:border-gray-800/50"
    >
      <form onSubmit={handleSwap} className="flex flex-col gap-2 relative">
        <div className="relative">
          <AmountInput
            label="You pay"
            amount={amount}
            setAmount={setAmount}
            token={fromToken}
            isOutput={false}
          />
          <div className="absolute top-8 right-4 w-[120px] sm:w-[140px]">
             <TokenSelector
                tokens={prices}
                selectedToken={fromToken}
                onChange={setFromToken}
                excludeToken={toToken}
             />
          </div>
        </div>

        <div className="absolute left-1/2 top-[47%] -translate-x-1/2 -translate-y-1/2 z-10">
          <SwapButton onClick={handleSwapTokens} />
        </div>

        <div className="relative mt-2">
          <AmountInput
            label="You receive"
            amount={outputAmount > 0 ? outputAmount.toFixed(6) : ""}
            setAmount={() => {}}
            token={toToken}
            isOutput={true}
            readOnly
          />
          <div className="absolute top-8 right-4 w-[120px] sm:w-[140px]">
            <TokenSelector
              tokens={prices}
              selectedToken={toToken}
              onChange={setToToken}
              excludeToken={fromToken}
            />
          </div>
        </div>

        {fromToken && toToken && (
          <div className="mt-4 px-2">
            <ExchangeRateInfo 
              fromToken={fromToken} 
              toToken={toToken} 
              rate={exchangeRate} 
            />
          </div>
        )}

        {isSameToken && (
          <p className="text-red-500 text-sm mt-2 px-2 transition-all">
            Cannot swap the same token
          </p>
        )}
        
        {isInvalidAmount && (
          <p className="text-red-500 text-sm mt-2 px-2 transition-all">
            Please enter a valid amount
          </p>
        )}

        <button
          type="submit"
          disabled={!isValid}
          className={`mt-6 w-full h-14 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-2 duration-300
            ${isValid 
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5' 
              : 'bg-gray-100 dark:bg-gray-800/80 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
        >
          {isSubmitting ? (
            <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            "Review Swap"
          )}
        </button>
      </form>
    </motion.div>
  );
}
