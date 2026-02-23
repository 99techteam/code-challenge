import { useState, useEffect, useCallback } from 'react';
import { Token } from '../types';
import { MOCK_TOKENS } from '../constants/tokens';

export const useSwap = () => {
  const [fromToken, setFromToken] = useState<Token>(MOCK_TOKENS[0]); // Default BTC
  const [toToken, setToToken] = useState<Token>(MOCK_TOKENS[2]);   // Default USDT
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [slippage, setSlippage] = useState(0.5);

  const getExchangeRate = useCallback(() => {
    return fromToken.price / toToken.price;
  }, [fromToken, toToken]);

  const exchangeRate = getExchangeRate();

  useEffect(() => {
    if (!fromAmount || isNaN(Number(fromAmount))) {
      setToAmount('');
      setLoading(false);
      return;
    }

    setLoading(true);
    // Simulate network delay
    const timer = setTimeout(() => {
      const val = Number(fromAmount) * exchangeRate;
      // Format to reasonable decimals based on price
      const decimals = toToken.price < 1 ? 2 : 6;
      setToAmount(val.toFixed(decimals));
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [fromAmount, exchangeRate, toToken.price]);

  const handleSwitch = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount); // Carry over the amount? Usually yes, or clear it.
    // If we carry over, the effect will run and recalculate the new "to"
  };

  return {
    fromToken,
    setFromToken,
    toToken,
    setToToken,
    fromAmount,
    setFromAmount,
    toAmount,
    exchangeRate,
    loading,
    slippage,
    setSlippage,
    handleSwitch
  };
};
