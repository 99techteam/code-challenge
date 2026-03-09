import { useState, useMemo, useCallback, FormEvent } from "react";
import { convertAmount, getExchangeRate } from "../utils/exchange";
import { validateAmount } from "../utils/validation";
import type { Token } from "../types";

const INITIAL_FROM_AMOUNT = "";
const SUBMIT_DELAY_MS = 1800;

export type SubmitState = "idle" | "loading" | "success" | "error";

export interface LastSwapSummary {
  fromAmount: number;
  fromCurrency: string;
  toAmount: number;
  toCurrency: string;
}

export function useSwapForm(_tokens: Token[]) {
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmountRaw, setFromAmountRaw] = useState(INITIAL_FROM_AMOUNT);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [lastSwapSummary, setLastSwapSummary] = useState<LastSwapSummary | null>(null);

  const fromAmount = fromAmountRaw === "" ? 0 : Number(fromAmountRaw);
  const fromAmountError = validateAmount(fromAmountRaw);

  const toAmount = useMemo(() => {
    if (!fromToken || !toToken || fromAmount <= 0) return 0;
    return convertAmount(fromAmount, fromToken, toToken);
  }, [fromToken, toToken, fromAmount]);

  const exchangeRate = useMemo(() => {
    if (!fromToken || !toToken) return null;
    return getExchangeRate(fromToken, toToken);
  }, [fromToken, toToken]);

  const handleSwapDirection = useCallback(() => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmountRaw(toAmount > 0 ? String(toAmount) : "");
  }, [fromToken, toToken, toAmount]);

  const canSubmit =
    !!fromToken &&
    !!toToken &&
    fromToken.currency !== toToken.currency &&
    fromAmount > 0 &&
    !fromAmountError &&
    submitState !== "loading";

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!canSubmit || !fromToken || !toToken) return;
      const fromAmt = fromAmountRaw === "" ? 0 : Number(fromAmountRaw);
      const toAmt = convertAmount(fromAmt, fromToken, toToken);
      setSubmitState("loading");
      try {
        await new Promise((r) => setTimeout(r, SUBMIT_DELAY_MS));
        setLastSwapSummary({
          fromAmount: fromAmt,
          fromCurrency: fromToken.currency,
          toAmount: toAmt,
          toCurrency: toToken.currency,
        });
        setSubmitState("success");
        setFromAmountRaw(INITIAL_FROM_AMOUNT);
        setTimeout(() => setSubmitState("idle"), 2000);
      } catch {
        setLastSwapSummary({
          fromAmount: fromAmt,
          fromCurrency: fromToken.currency,
          toAmount: toAmt,
          toCurrency: toToken.currency,
        });
        setSubmitState("error");
        setTimeout(() => setSubmitState("idle"), 3000);
      }
    },
    [canSubmit, fromToken, toToken, fromAmountRaw]
  );

  return {
    fromToken,
    toToken,
    fromAmountRaw,
    fromAmountError,
    toAmount,
    exchangeRate,
    submitState,
    canSubmit,
    lastSwapSummary,
    setFromToken,
    setToToken,
    setFromAmountRaw,
    handleSwapDirection,
    handleSubmit,
  };
}
