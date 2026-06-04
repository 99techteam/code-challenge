import { useCallback, useEffect, useRef, useState } from 'react';

import { currencyApi } from '@/api/currency';

import { getReceiveAmount, getValidatedPayAmount } from '../lib/utils';

type QuoteSource = 'pay' | 'receive';

type QuoteRequest = {
  source: QuoteSource;
  amount: string;
  payCurrency: string;
  receiveCurrency: string;
};

const QUOTE_DEBOUNCE_MS = 500;

export function useSwapQuote(currencies: string[]) {
  const [payAmount, setPayAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [payCurrency, setPayCurrency] = useState('');
  const [receiveCurrency, setReceiveCurrency] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [receiveLoading, setReceiveLoading] = useState(false);
  const [swapButtonRotate, setSwapButtonRotate] = useState(false);
  const [lastEdited, setLastEdited] = useState<QuoteSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resolvedPayCurrency = payCurrency || currencies[0] || '';
  const resolvedReceiveCurrency =
    receiveCurrency || currencies[1] || currencies[0] || '';

  const setInputAmount = useCallback((source: QuoteSource, value: string) => {
    if (source === 'pay') {
      setPayAmount(value);
      return;
    }

    setReceiveAmount(value);
  }, []);

  const setQuotedAmount = useCallback((source: QuoteSource, value: string) => {
    if (source === 'pay') {
      setReceiveAmount(value);
      return;
    }

    setPayAmount(value);
  }, []);

  const setQuotedLoading = useCallback(
    (source: QuoteSource, value: boolean) => {
      if (source === 'pay') {
        setReceiveLoading(value);
        return;
      }

      setPayLoading(value);
    },
    [],
  );

  const clearPendingQuote = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }

    setPayLoading(false);
    setReceiveLoading(false);
  }, []);

  const fetchQuote = useCallback(
    async ({
      source,
      amount,
      payCurrency,
      receiveCurrency,
    }: QuoteRequest) => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setQuotedLoading(source, true);

      try {
        const currentPrices = await currencyApi.fetchPrices(controller);

        if (controller.signal.aborted) {
          return;
        }

        const nextValue =
          source === 'pay'
            ? getReceiveAmount(
              amount,
              payCurrency,
              receiveCurrency,
              currentPrices.prices,
            )
            : getReceiveAmount(
              amount,
              receiveCurrency,
              payCurrency,
              currentPrices.prices,
            );

        setQuotedAmount(source, nextValue);
      } catch {
        if (!controller.signal.aborted) {
          setQuotedAmount(source, '');
        }
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
          setQuotedLoading(source, false);
        }
      }
    },
    [setQuotedAmount, setQuotedLoading],
  );

  const scheduleQuote = useCallback(
    (request: QuoteRequest) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        debounceTimeoutRef.current = null;
        void fetchQuote(request);
      }, QUOTE_DEBOUNCE_MS);
    },
    [fetchQuote],
  );

  const syncQuote = useCallback(
    ({
      nextPayCurrency = resolvedPayCurrency,
      nextReceiveCurrency = resolvedReceiveCurrency,
      nextSource = lastEdited,
    }: {
      nextPayCurrency?: string;
      nextReceiveCurrency?: string;
      nextSource?: QuoteSource | null;
    } = {}) => {
      const source =
        nextSource ?? (payAmount ? 'pay' : receiveAmount ? 'receive' : null);

      if (!source) {
        return;
      }

      const amount = source === 'pay' ? payAmount : receiveAmount;
      if (!amount) {
        setQuotedAmount(source, '');
        return;
      }

      clearPendingQuote();
      scheduleQuote({
        source,
        amount,
        payCurrency: nextPayCurrency,
        receiveCurrency: nextReceiveCurrency,
      });
    },
    [
      clearPendingQuote,
      lastEdited,
      payAmount,
      receiveAmount,
      resolvedPayCurrency,
      resolvedReceiveCurrency,
      scheduleQuote,
      setQuotedAmount,
    ],
  );

  const handleAmountChange = useCallback(
    (source: QuoteSource) => (nextAmount: string) => {
      const validatedAmount = getValidatedPayAmount(nextAmount);
      if (validatedAmount === null) {
        return;
      }

      setLastEdited(source);
      setInputAmount(source, validatedAmount);

      clearPendingQuote();

      if (!validatedAmount) {
        setQuotedAmount(source, '');
        return;
      }

      scheduleQuote({
        source,
        amount: validatedAmount,
        payCurrency: resolvedPayCurrency,
        receiveCurrency: resolvedReceiveCurrency,
      });
    },
    [
      clearPendingQuote,
      resolvedPayCurrency,
      resolvedReceiveCurrency,
      scheduleQuote,
      setInputAmount,
      setQuotedAmount,
    ],
  );

  const handleSwap = useCallback(() => {
    clearPendingQuote();

    const nextSource =
      lastEdited === 'pay' ? 'receive' : lastEdited === 'receive' ? 'pay' : null;
    const nextPayCurrency = resolvedReceiveCurrency;
    const nextReceiveCurrency = resolvedPayCurrency;
    const nextPayAmount = receiveAmount;
    const nextReceiveAmount = payAmount;

    setPayCurrency(nextPayCurrency);
    setReceiveCurrency(nextReceiveCurrency);
    setPayAmount(nextPayAmount);
    setReceiveAmount(nextReceiveAmount);
    setSwapButtonRotate((previous) => !previous);
    setLastEdited(nextSource);

    if (!nextSource) {
      return;
    }

    const nextAmount =
      nextSource === 'pay' ? nextPayAmount : nextReceiveAmount;

    if (!nextAmount) {
      setQuotedAmount(nextSource, '');
      return;
    }

    scheduleQuote({
      source: nextSource,
      amount: nextAmount,
      payCurrency: nextPayCurrency,
      receiveCurrency: nextReceiveCurrency,
    });
  }, [
    clearPendingQuote,
    lastEdited,
    payAmount,
    receiveAmount,
    resolvedPayCurrency,
    resolvedReceiveCurrency,
    scheduleQuote,
    setQuotedAmount,
  ]);

  const handleCurrencyChange = useCallback(
    (source: QuoteSource) => (nextCurrency: string) => {
      const pairedCurrency =
        source === 'pay' ? resolvedReceiveCurrency : resolvedPayCurrency;

      if (nextCurrency === pairedCurrency) {
        handleSwap();
        return;
      }

      if (source === 'pay') {
        setPayCurrency(nextCurrency);
        syncQuote({ nextPayCurrency: nextCurrency });
        return;
      }

      setReceiveCurrency(nextCurrency);
      syncQuote({ nextReceiveCurrency: nextCurrency });
    },
    [handleSwap, resolvedPayCurrency, resolvedReceiveCurrency, syncQuote],
  );

  const reset = useCallback(() => {
    clearPendingQuote();
    setPayAmount('');
    setReceiveAmount('');
  }, [clearPendingQuote]);

  useEffect(() => clearPendingQuote, [clearPendingQuote]);

  return {
    payAmount,
    receiveAmount,
    payLoading,
    receiveLoading,
    resolvedPayCurrency,
    resolvedReceiveCurrency,
    swapButtonRotate,
    handleAmountChange,
    handleCurrencyChange,
    handleSwap,
    reset,
  };
}
