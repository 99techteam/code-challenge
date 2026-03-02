import { useState } from "react";
import { toast } from "sonner";
import { usePrices } from "@/hooks/usePrices";
import { TokenInput } from "./TokenInput";
import { SwapButton } from "./SwapButton";
import { RateDisplay } from "./RateDisplay";
import { SubmitButton } from "./SubmitButton";
import type { Token, SwapErrors } from "@/types/swap";

export function SwapCard() {
  const { tokens, loading, error: fetchError } = usePrices();
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [errors, setErrors] = useState<SwapErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toAmount =
    fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0
      ? String(
          parseFloat(
            (
              (parseFloat(fromAmount) * fromToken.price) /
              toToken.price
            ).toFixed(6),
          ),
        )
      : "";

  const exchangeRate =
    fromToken && toToken ? fromToken.price / toToken.price : null;

  function handleSwapDirection() {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: SwapErrors = {};
    if (!fromToken) newErrors.fromToken = "Select a token";
    if (!toToken) newErrors.toToken = "Select a token";
    if (fromToken && toToken && fromToken.symbol === toToken.symbol)
      newErrors.sameToken = "Cannot swap the same token";
    if (!fromAmount || parseFloat(fromAmount) <= 0)
      newErrors.fromAmount = "Enter a valid amount";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsSubmitting(false);

    const failed = Math.random() < 0.2;
    if (failed) {
      toast.error("Swap failed", {
        description: "Transaction could not be completed. Please try again.",
      });
    } else {
      toast.success("Swap confirmed!", {
        description: `${fromAmount} ${fromToken!.symbol} → ${toAmount} ${toToken!.symbol}`,
      });
      setFromAmount("");
      setFromToken(null);
      setToToken(null);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-card/80 backdrop-blur-xl border border-border shadow-2xl p-6">
      <h1 className="text-xl text-foreground font-bold mb-5">Swap</h1>

      {fetchError && (
        <div className="text-sm text-destructive mb-4 p-3 rounded-lg bg-destructive/10">
          Failed to load prices: {fetchError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-1">
        <TokenInput
          label="You pay"
          token={fromToken}
          amount={fromAmount}
          onAmountChange={(val) => {
            setFromAmount(val);
            if (errors.fromAmount)
              setErrors((prev) => ({ ...prev, fromAmount: undefined }));
          }}
          onTokenSelect={(token) => {
            setFromToken(token);
            if (errors.fromToken)
              setErrors((prev) => ({ ...prev, fromToken: undefined }));
            if (errors.sameToken)
              setErrors((prev) => ({ ...prev, sameToken: undefined }));
          }}
          tokens={tokens}
          disabledToken={toToken}
          error={errors.fromToken || errors.fromAmount}
        />

        <SwapButton onClick={handleSwapDirection} />

        <TokenInput
          label="You receive"
          token={toToken}
          amount={toAmount}
          onTokenSelect={(token) => {
            setToToken(token);
            if (errors.toToken)
              setErrors((prev) => ({ ...prev, toToken: undefined }));
            if (errors.sameToken)
              setErrors((prev) => ({ ...prev, sameToken: undefined }));
          }}
          tokens={tokens}
          readonly
          disabledToken={fromToken}
          error={errors.toToken}
        />

        {loading && (
          <div className="text-sm text-muted-foreground text-center py-1">
            Loading tokens...
          </div>
        )}

        <div className="mt-2">
          <RateDisplay
            fromToken={fromToken}
            toToken={toToken}
            exchangeRate={exchangeRate}
          />
        </div>

        {errors.sameToken && (
          <div className="text-sm text-destructive text-center">
            {errors.sameToken}
          </div>
        )}

        <div className="mt-3">
          <SubmitButton loading={isSubmitting} />
        </div>
      </form>
    </div>
  );
}
