import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import type { Token, SwapFormValues, Transaction, ValidationError } from '../types';
import { calcToAmount, calcFromAmount } from '../utils/swap';
import { DEFAULT_AMOUNT } from '../constants';

export function useSwapForm(tokens: Token[]) {
  const initialized = useRef(false);

  const {
    control,
    setValue,
    reset,
    formState: { isDirty },
    handleSubmit,
  } = useForm<SwapFormValues>({
    defaultValues: {
      fromAmount: '',
      toAmount: '',
      fromToken: null,
      toToken: null,
    },
    mode: 'onChange',
  });

  const watched = useWatch({ control });
  const fromToken = (watched.fromToken ?? null) as Token | null;
  const toToken = (watched.toToken ?? null) as Token | null;
  const fromAmount = (watched.fromAmount ?? '') as string;
  const toAmount = (watched.toAmount ?? '') as string;

  // Set default tokens when prices load
  useEffect(() => {
    if (tokens.length > 0 && !initialized.current) {
      initialized.current = true;
      const ethToken = tokens.find((t) => t.currency === 'ETH');
      const usdcToken = tokens.find((t) => t.currency === 'USDC');
      const from = ethToken || tokens[0];
      const to = usdcToken || tokens[1] || tokens[0];
      const toAmt = calcToAmount(from, to, DEFAULT_AMOUNT);
      reset({
        fromToken: from,
        toToken: to,
        fromAmount: DEFAULT_AMOUNT,
        toAmount: toAmt,
      });
    }
  }, [tokens, reset]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const exchangeRate = useMemo(() => {
    if (!fromToken || !toToken) return null;
    return fromToken.price / toToken.price;
  }, [fromToken, toToken]);

  const priceImpact = useMemo(() => {
    if (!fromToken || !toToken || !fromAmount) return 0;
    const amount = parseFloat(fromAmount);
    if (isNaN(amount) || amount <= 0) return 0;
    const usdValue = amount * fromToken.price;
    return Math.min(usdValue * 0.0001, 15);
  }, [fromToken, toToken, fromAmount]);

  // --- Field updaters ---
  const updateFromAmount = useCallback((value: string) => {
    setValue('fromAmount', value, { shouldDirty: true });
    setValue('toAmount', calcToAmount(fromToken, toToken, value));
  }, [fromToken, toToken, setValue]);

  const updateToAmount = useCallback((value: string) => {
    setValue('toAmount', value, { shouldDirty: true });
    setValue('fromAmount', calcFromAmount(fromToken, toToken, value));
  }, [fromToken, toToken, setValue]);

  const setFromToken = useCallback((token: Token) => {
    setValue('fromToken', token, { shouldDirty: true });
    setValue('toAmount', calcToAmount(token, toToken, fromAmount));
  }, [toToken, fromAmount, setValue]);

  const setToToken = useCallback((token: Token) => {
    setValue('toToken', token, { shouldDirty: true });
    setValue('toAmount', calcToAmount(fromToken, token, fromAmount));
  }, [fromToken, fromAmount, setValue]);

  const swapDirection = useCallback(() => {
    setValue('fromToken', toToken);
    setValue('toToken', fromToken);
    setValue('fromAmount', toAmount);
    setValue('toAmount', fromAmount);
  }, [fromToken, toToken, fromAmount, toAmount, setValue]);

  // --- Validation ---
  const errors = useMemo(() => {
    const errs: ValidationError[] = [];
    if (!fromToken) errs.push({ field: 'fromToken', message: 'Select a token to send' });
    if (!toToken) errs.push({ field: 'toToken', message: 'Select a token to receive' });
    if (fromToken && toToken && fromToken.currency === toToken.currency) {
      errs.push({ field: 'general', message: 'Cannot swap the same token' });
    }
    if (fromAmount) {
      const num = parseFloat(fromAmount);
      if (isNaN(num) || num <= 0) {
        errs.push({ field: 'fromAmount', message: 'Enter a valid positive amount' });
      }
    } else {
      errs.push({ field: 'fromAmount', message: 'Enter an amount' });
    }
    return errs;
  }, [fromToken, toToken, fromAmount]);

  const isValid = errors.length === 0;

  // --- Submit ---
  const submitSwap = useCallback(async () => {
    if (!isValid || !fromToken || !toToken) return;
    setIsSubmitting(true);
    setSubmitSuccess(false);
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1500));
    const newTx: Transaction = {
      id: crypto.randomUUID(),
      fromToken: fromToken.currency,
      toToken: toToken.currency,
      fromAmount: parseFloat(fromAmount),
      toAmount: parseFloat(toAmount),
      rate: fromToken.price / toToken.price,
      timestamp: new Date(),
      status: 'completed',
    };
    setTransactions((prev) => [newTx, ...prev]);
    // Reset amounts but keep tokens selected — reset makes isDirty false
    reset({
      fromToken,
      toToken,
      fromAmount: '',
      toAmount: '',
    });
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  }, [fromToken, toToken, fromAmount, toAmount, isValid, reset]);

  return {
    form: { fromToken, toToken, fromAmount, toAmount },
    isDirty,
    exchangeRate,
    priceImpact,
    errors,
    isValid,
    isSubmitting,
    submitSuccess,
    transactions,
    updateFromAmount,
    updateToAmount,
    swapDirection,
    setFromToken,
    setToToken,
    submitSwap: handleSubmit(submitSwap),
  };
}
