// ── Presentation Hook ─────────────────────────────────────────────────────────
// Bridges the application service with React state.

import { useState, useEffect } from "react";
import type { Token } from "../../../domain/token/entities/Token";
import { swapService } from "../../../application/swap/SwapService";
import { tokenRepository } from "../../../infrastructure/token/SwitcheoTokenRepository";

export function useSwap() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmountState] = useState("");
  const [toAmount, setToAmountState] = useState("");
  const [loading, setLoading] = useState(true);
  const [swapping, setSwapping] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    tokenRepository
      .fetchAll()
      .then((list) => {
        setTokens(list);
        setFromToken(list.find((t) => t.symbol === "ETH") ?? list[0]);
        setToToken(list.find((t) => t.symbol === "USDC") ?? list[1]);
      })
      .catch(() => setError("Failed to load token prices"))
      .finally(() => setLoading(false));
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const resetFeedback = () => {
    setError("");
    setSuccess(false);
  };

  // ── Amount handlers ────────────────────────────────────────────────────────
  const setFromAmount = (val: string) => {
    setFromAmountState(val);
    setToAmountState(swapService.computeToAmount(val, fromToken, toToken));
    resetFeedback();
  };

  const setToAmount = (val: string) => {
    setToAmountState(val);
    setFromAmountState(swapService.computeFromAmount(val, fromToken, toToken));
    resetFeedback();
  };

  // ── Token handlers ─────────────────────────────────────────────────────────
  const selectFromToken = (t: Token) => {
    setFromToken(t);
    setToAmountState(swapService.computeToAmount(fromAmount, t, toToken));
    resetFeedback();
  };

  const selectToToken = (t: Token) => {
    setToToken(t);
    setToAmountState(swapService.computeToAmount(fromAmount, fromToken, t));
    resetFeedback();
  };

  const flipTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmountState(toAmount);
    setToAmountState(fromAmount);
    resetFeedback();
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const submit = async () => {
    if (!fromToken || !toToken) return;

    const validationError = swapService.validate({ fromToken, toToken, fromAmount, toAmount });
    if (validationError) {
      setError(validationError);
      return;
    }

    setSwapping(true);
    setError("");

    const result = await swapService.execute({ fromToken, toToken, fromAmount, toAmount });

    setSwapping(false);
    if (result.success) {
      setSuccess(true);
      setFromAmountState("");
      setToAmountState("");
    } else {
      setError(result.error ?? "Swap failed");
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const rate = swapService.rateLabel(fromToken, toToken);

  return {
    // state
    tokens,
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    loading,
    swapping,
    success,
    error,
    rate,
    // actions
    setFromAmount,
    setToAmount,
    selectFromToken,
    selectToToken,
    flipTokens,
    submit,
  };
}