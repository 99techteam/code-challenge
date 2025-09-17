'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowUpDown, Loader2, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import TokenSelector from './TokenSelector';
import { Token, TOKENS, calculateExchangeRate, mockSwapTransaction } from '@/lib/tokens';
import { swapFormSchema, SwapFormData } from '@/lib/validations';

interface ExchangeRate {
  rate: number;
  outputAmount: number;
  fee: number;
}

export default function SwapForm() {
  const [fromToken, setFromToken] = useState<Token | null>(TOKENS[0]); // Default to BTC
  const [toToken, setToToken] = useState<Token | null>(TOKENS[1]); // Default to ETH
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapResult, setSwapResult] = useState<{ success: boolean; txHash?: string; error?: string } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<SwapFormData>({
    resolver: zodResolver(swapFormSchema),
    mode: 'onChange',
    defaultValues: {
      fromToken: TOKENS[0].id,
      toToken: TOKENS[1].id,
      fromAmount: '',
    },
  });

  const fromAmount = watch('fromAmount');

  // Update form when tokens change
  useEffect(() => {
    if (fromToken) setValue('fromToken', fromToken.id);
  }, [fromToken, setValue]);

  useEffect(() => {
    if (toToken) setValue('toToken', toToken.id);
  }, [toToken, setValue]);

  // Calculate exchange rate when amount or tokens change
  useEffect(() => {
    const calculateRate = async () => {
      if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
        setExchangeRate(null);
        return;
      }

      setIsCalculating(true);
      try {
        const rate = await calculateExchangeRate(
          fromToken.id,
          toToken.id,
          parseFloat(fromAmount)
        );
        setExchangeRate(rate);
      } catch (error) {
        console.error('Error calculating exchange rate:', error);
        setExchangeRate(null);
      } finally {
        setIsCalculating(false);
      }
    };

    const debounceTimer = setTimeout(calculateRate, 500);
    return () => clearTimeout(debounceTimer);
  }, [fromToken, toToken, fromAmount]);

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    
    // Clear amount when swapping
    setValue('fromAmount', '');
    setExchangeRate(null);
  };

  const onSubmit = async (data: SwapFormData) => {
    if (!fromToken || !toToken || !exchangeRate) return;

    setIsSwapping(true);
    setSwapResult(null);

    try {
      const result = await mockSwapTransaction(
        fromToken.id,
        toToken.id,
        parseFloat(data.fromAmount)
      );
      
      setSwapResult(result);
      
      if (result.success) {
        // Reset form on successful swap
        reset();
        setFromToken(TOKENS[0]);
        setToToken(TOKENS[1]);
        setExchangeRate(null);
      }
    } catch (error) {
      setSwapResult({
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const formatNumber = (num: number, decimals: number = 6) => {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Swap
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Trade tokens in an instant
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        {/* From Token Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            From
          </label>
          <div className="relative">
            <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus-within:border-blue-500 transition-colors">
              <TokenSelector
                selectedToken={fromToken}
                onSelectToken={setFromToken}
                excludeToken={toToken}
              />
              <input
                {...register('fromAmount')}
                type="text"
                placeholder="0.0"
                className="flex-1 bg-transparent text-right text-lg font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
              />
            </div>
            {fromToken && fromAmount && !isNaN(parseFloat(fromAmount)) && (
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                ≈ ${formatNumber(parseFloat(fromAmount) * fromToken.price, 2)} USD
              </div>
            )}
          </div>
          {errors.fromAmount && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.fromAmount.message}
            </p>
          )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleSwapTokens}
            className="p-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowUpDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* To Token Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            To
          </label>
          <div className="relative">
            <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <TokenSelector
                selectedToken={toToken}
                onSelectToken={setToToken}
                excludeToken={fromToken}
              />
              <div className="flex-1 text-right">
                {isCalculating ? (
                  <div className="flex items-center justify-end gap-2 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-lg">Calculating...</span>
                  </div>
                ) : exchangeRate ? (
                  <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {formatNumber(exchangeRate.outputAmount)}
                  </div>
                ) : (
                  <div className="text-lg font-medium text-gray-400">0.0</div>
                )}
              </div>
            </div>
            {toToken && exchangeRate && (
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                ≈ ${formatNumber(exchangeRate.outputAmount * toToken.price, 2)} USD
              </div>
            )}
          </div>
          {errors.toToken && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.toToken.message}
            </p>
          )}
        </div>

        {/* Exchange Rate Info */}
        {exchangeRate && fromToken && toToken && (
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="text-sm space-y-1">
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Rate</span>
                <span>
                  1 {fromToken.symbol} = {formatNumber(exchangeRate.rate, 4)} {toToken.symbol}
                </span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Fee (0.3%)</span>
                <span>{formatNumber(exchangeRate.fee, 6)} {fromToken.symbol}</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isValid || isSwapping || !exchangeRate}
          className={`
            w-full py-4 px-6 rounded-xl font-medium text-white transition-all
            ${
              isValid && exchangeRate && !isSwapping
                ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isSwapping ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Swapping...
            </div>
          ) : (
            'Confirm Swap'
          )}
        </button>

        {/* Swap Result */}
        {swapResult && (
          <div className={`p-4 rounded-xl ${
            swapResult.success 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-start gap-2">
              {swapResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              )}
              <div>
                <div className={`font-medium ${
                  swapResult.success 
                    ? 'text-green-800 dark:text-green-300'
                    : 'text-red-800 dark:text-red-300'
                }`}>
                  {swapResult.success ? 'Swap Successful!' : 'Swap Failed'}
                </div>
                {swapResult.success && swapResult.txHash && (
                  <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Transaction: {swapResult.txHash}
                  </div>
                )}
                {!swapResult.success && swapResult.error && (
                  <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {swapResult.error}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}