import React, { useState, useEffect, useRef } from "react";
import { useTokensWithPrices } from "../hooks/useTokensWithPrices";
import { useSwapForm } from "../hooks/useSwapForm";
import { SwapCard } from "./SwapCard";
import { SwapFormStyles } from "./SwapFormStyles";
import { Toast } from "./Toast";

function formatAmount(num) {
  if (num >= 1e6) return num.toExponential(2);
  if (num >= 1) return num.toFixed(4);
  if (num > 0) return num.toFixed(6);
  return "0";
}

export function SwapForm() {
  const { tokens, loading: tokensLoading, error: tokensError, refetch } = useTokensWithPrices();
  const swap = useSwapForm(tokens);
  const [toast, setToast] = useState(null);
  const prevSubmitState = useRef(swap.submitState);

  useEffect(() => {
    if (swap.submitState === "success" && prevSubmitState.current !== "success") {
      const s = swap.lastSwapSummary;
      const msg = s
        ? `Swapped ${formatAmount(s.fromAmount)} ${s.fromCurrency} for ${formatAmount(s.toAmount)} ${s.toCurrency}`
        : "Swap successful";
      setToast({ message: msg, type: "success" });
    } else if (swap.submitState === "error" && prevSubmitState.current !== "error") {
      const s = swap.lastSwapSummary;
      const msg = s
        ? `Swap failed: ${formatAmount(s.fromAmount)} ${s.fromCurrency} → ${formatAmount(s.toAmount)} ${s.toCurrency}. Please try again.`
        : "Swap failed. Please try again.";
      setToast({ message: msg, type: "error" });
    }
    prevSubmitState.current = swap.submitState;
  }, [swap.submitState, swap.lastSwapSummary]);

  return (
    <>
      <SwapFormStyles />
      {toast && (
        <div className="toast-container">
          <Toast
            message={toast.message}
            type={toast.type}
            onDismiss={() => setToast(null)}
            duration={4000}
          />
        </div>
      )}
      <SwapCard
        tokens={tokens}
        tokensLoading={tokensLoading}
        tokensError={tokensError}
        onRetry={refetch}
        fromToken={swap.fromToken}
        toToken={swap.toToken}
        fromAmountRaw={swap.fromAmountRaw}
        fromAmountError={swap.fromAmountError}
        toAmount={swap.toAmount}
        exchangeRate={swap.exchangeRate}
        submitState={swap.submitState}
        canSubmit={swap.canSubmit}
        sameTokenError={
          swap.fromToken && swap.toToken && swap.fromToken.currency === swap.toToken.currency
        }
        onFromTokenSelect={swap.setFromToken}
        onToTokenSelect={swap.setToToken}
        onFromAmountChange={swap.setFromAmountRaw}
        onSwapDirection={swap.handleSwapDirection}
        onSubmit={swap.handleSubmit}
      />
    </>
  );
}
