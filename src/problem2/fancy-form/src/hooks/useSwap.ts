import { useState, useCallback, useMemo } from 'react';
import type { Token } from '@/types';
import { SwapStatus } from '@/types/swap';
import { parseAmountInput } from '@/utils/format';

interface UseSwapReturn {
  sellToken: Token | null;
  buyToken: Token | null;
  sellAmount: string;
  buyAmount: string;
  status: SwapStatus;
  exchangeRate: number | null;
  usdValueSell: number;
  usdValueBuy: number;
  priceImpact: number;
  setSellToken: (token: Token) => void;
  setBuyToken: (token: Token) => void;
  setSellAmount: (amount: string) => void;
  setBuyAmount: (amount: string) => void;
  flipTokens: () => void;
  executeSwap: () => Promise<void>;
  canSwap: boolean;
  buttonLabel: string;
}

export function useSwap(): UseSwapReturn {
  const [sellToken, setSellTokenState] = useState<Token | null>(null);
  const [buyToken, setBuyTokenState] = useState<Token | null>(null);
  const [sellAmount, setSellAmountState] = useState('');
  const [buyAmount, setBuyAmountState] = useState('');
  const [status, setStatus] = useState<SwapStatus>(SwapStatus.IDLE);
  const [lastEdited, setLastEdited] = useState<'sell' | 'buy'>('sell');

  // Calculate exchange rate between sell and buy tokens
  const exchangeRate = useMemo(() => {
    if (!sellToken || !buyToken || sellToken.price <= 0 || buyToken.price <= 0) return null;
    return sellToken.price / buyToken.price;
  }, [sellToken, buyToken]);

  // USD values
  const usdValueSell = useMemo(() => {
    const amount = parseAmountInput(sellAmount);
    return sellToken ? amount * sellToken.price : 0;
  }, [sellAmount, sellToken]);

  const usdValueBuy = useMemo(() => {
    const amount = parseAmountInput(buyAmount);
    return buyToken ? amount * buyToken.price : 0;
  }, [buyAmount, buyToken]);

  // Simulated price impact (small random variation for realism)
  const priceImpact = useMemo(() => {
    const sellNum = parseAmountInput(sellAmount);
    if (!sellToken || !buyToken || sellNum <= 0) return 0;
    // Simulate higher impact for larger trades
    return Math.min(sellNum * 0.001, 5);
  }, [sellAmount, sellToken, buyToken]);

  // Auto-calculate the other amount when one changes
  const setSellAmount = useCallback(
    (amount: string) => {
      setSellAmountState(amount);
      setLastEdited('sell');
      if (exchangeRate !== null) {
        const parsed = parseAmountInput(amount);
        if (parsed > 0) {
          const computed = parsed * exchangeRate;
          setBuyAmountState(computed.toFixed(6).replace(/\.?0+$/, ''));
        } else {
          setBuyAmountState('');
        }
      }
    },
    [exchangeRate],
  );

  const setBuyAmount = useCallback(
    (amount: string) => {
      setBuyAmountState(amount);
      setLastEdited('buy');
      if (exchangeRate !== null && exchangeRate > 0) {
        const parsed = parseAmountInput(amount);
        if (parsed > 0) {
          const computed = parsed / exchangeRate;
          setSellAmountState(computed.toFixed(6).replace(/\.?0+$/, ''));
        } else {
          setSellAmountState('');
        }
      }
    },
    [exchangeRate],
  );

  const setSellToken = useCallback(
    (token: Token) => {
      // Prevent selecting the same token for both sides
      if (buyToken && token.currency === buyToken.currency) {
        // Swap them
        setBuyTokenState(sellToken);
      }
      setSellTokenState(token);
      // Recalculate amounts based on new rate
      if (buyToken && lastEdited === 'sell' && sellAmount) {
        const rate = token.price / buyToken.price;
        const parsed = parseAmountInput(sellAmount);
        if (parsed > 0) {
          setBuyAmountState((parsed * rate).toFixed(6).replace(/\.?0+$/, ''));
        }
      }
    },
    [buyToken, sellToken, sellAmount, lastEdited],
  );

  const setBuyToken = useCallback(
    (token: Token) => {
      if (sellToken && token.currency === sellToken.currency) {
        setSellTokenState(buyToken);
      }
      setBuyTokenState(token);
      if (sellToken && lastEdited === 'sell' && sellAmount) {
        const rate = sellToken.price / token.price;
        const parsed = parseAmountInput(sellAmount);
        if (parsed > 0) {
          setBuyAmountState((parsed * rate).toFixed(6).replace(/\.?0+$/, ''));
        }
      }
    },
    [sellToken, buyToken, sellAmount, lastEdited],
  );

  const flipTokens = useCallback(() => {
    setSellTokenState(buyToken);
    setBuyTokenState(sellToken);
    setSellAmountState(buyAmount);
    setBuyAmountState(sellAmount);
    setLastEdited((prev) => (prev === 'sell' ? 'buy' : 'sell'));
  }, [sellToken, buyToken, sellAmount, buyAmount]);

  // Determine button state
  const canSwap = useMemo(() => {
    if (!sellToken || !buyToken) return false;
    const sellNum = parseAmountInput(sellAmount);
    return sellNum > 0 && status === SwapStatus.IDLE;
  }, [sellToken, buyToken, sellAmount, status]);

  const buttonLabel = useMemo(() => {
    if (status === SwapStatus.PROCESSING) return 'Swapping...';
    if (status === SwapStatus.SUCCESS) return 'Swap Successful!';
    if (!sellToken || !buyToken) return 'Select tokens';
    const sellNum = parseAmountInput(sellAmount);
    if (sellNum <= 0) return 'Enter an amount';
    return 'Swap';
  }, [sellToken, buyToken, sellAmount, status]);

  // Simulated swap execution
  const executeSwap = useCallback(async () => {
    if (!canSwap) return;

    setStatus(SwapStatus.PROCESSING);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setStatus(SwapStatus.SUCCESS);

    // Reset after showing success
    setTimeout(() => {
      setStatus(SwapStatus.IDLE);
      setSellAmountState('');
      setBuyAmountState('');
    }, 1500);
  }, [canSwap]);

  return {
    sellToken,
    buyToken,
    sellAmount,
    buyAmount,
    status,
    exchangeRate,
    usdValueSell,
    usdValueBuy,
    priceImpact,
    setSellToken,
    setBuyToken,
    setSellAmount,
    setBuyAmount,
    flipTokens,
    executeSwap,
    canSwap,
    buttonLabel,
  };
}
