import { useState, useEffect } from "react";
import { z } from "zod";
import usePrices from "@/hooks/usePrices";
import { useSwapLogic } from "@/hooks/useSwapLogic";
import { getTokenIconUrl } from "@/constant";
import TokenSelector from "@/components/TokenSelector";
import AmountInput from "@/components/AmountInput";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useSwapHistory } from "@/store/useSwapHistory";
import HistoryModal from "@/components/HistoryModal";

export default function SwapForm() {
  const { data: tokens = [], isLoading, error } = usePrices();
  const [fromToken, setFromToken] = useState<(typeof tokens)[0] | null>(null);
  const [toToken, setToToken] = useState<(typeof tokens)[0] | null>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const addTransaction = useSwapHistory((state) => state.addTransaction);

  const swapSchema = z.object({
    fromToken: z.object({ currency: z.string(), price: z.number() }).nullable(),
    toToken: z.object({ currency: z.string(), price: z.number() }).nullable(),
    amount: z
      .string()
      .trim()
      .min(1, "Enter an amount to swap")
      .refine((v) => /^\d*\.?\d*$/.test(v), "Amount must be a valid number")
      .refine((v) => parseFloat(v) > 0, "Amount must be greater than 0"),
  });

  // Background preload of token icons once prices are loaded
  useEffect(() => {
    if (!tokens.length) return;

    // Default selections: ETH for You Pay, USDT for You Receive
    const eth = tokens.find((t) => t.currency === "ETH") ?? null;
    if (!fromToken && eth) setFromToken(eth);
    if (!toToken && eth) setToToken(eth);

    // Preload a subset of icons in the background
    tokens.slice(0, 64).forEach((token) => {
      const img = new Image();
      img.src = getTokenIconUrl(token.currency);
    });
  }, [tokens, fromToken, toToken]);

  const { toAmount, exchangeRate, isValid } = useSwapLogic(
    fromToken,
    toToken,
    fromAmount,
  );

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  // Fake submit; only called when the CONFIRM SWAP button is clicked
  const handleSubmit = async () => {
    setSubmitError(null);

    const parsed = swapSchema.safeParse({
      fromToken,
      toToken,
      amount: fromAmount,
    });

    if (!parsed.success || !isValid) {
      const message = !parsed.success
        ? (parsed.error.issues[0]?.message ?? "Invalid swap")
        : "Please select tokens and enter a valid amount";

      setSubmitError(message);
      setSubmitSuccess(false);
      return;
    }

    const amountValue = parseFloat(fromAmount);
    if (amountValue > 2.14) {
      setSubmitError("Insufficient balance. Max available is 2.14 ETH.");
      setSubmitSuccess(false);
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);

    // Simulate API call with delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSubmitSuccess(true);
    setSubmitError(null);
    setIsSubmitting(false);

    if (fromToken && toToken) {
      addTransaction({
        fromCurrency: fromToken.currency,
        toCurrency: toToken.currency,
        fromAmount,
        toAmount: toAmount.toString(),
      });
    }

    // Reset form after 2 seconds
    setTimeout(() => {
      setFromAmount("");
      setSubmitSuccess(false);
    }, 2000);
  };

  if (error) {
    return (
      <div className="w-full max-w-xl mx-auto bg-white rounded-3xl shadow-2xl shadow-slate-300/80 border border-slate-200 p-8">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-50 mb-2">
            Error Loading Prices
          </h2>
          <p className="text-slate-400">
            {error instanceof Error
              ? error.message
              : "Failed to load token prices. Please refresh the page."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="w-full bg-white rounded-2xl shadow-md border border-slate-200 p-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Exchange Tokens
          </h1>
          <p className="text-sm text-slate-500">
            Seamlessly swap between popular cryptocurrencies.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-slate-600">Loading tokens...</p>
          </div>
        ) : (
          <form className="space-y-6">
            {/* You Pay */}
            <div className="relative border border-slate-200 rounded-xl px-4 py-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-slate-500 font-medium">
                  You Pay
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <TokenSelector
                  tokens={tokens}
                  selectedToken={fromToken}
                  onSelect={setFromToken}
                  placeholder="ETH"
                />
                <div className="flex-1 ml-4 flex justify-end">
                  <AmountInput
                    value={fromAmount}
                    onChange={setFromAmount}
                    placeholder="0.50"
                    label={undefined}
                    error={
                      fromAmount && isNaN(parseFloat(fromAmount))
                        ? "Invalid amount"
                        : fromAmount && parseFloat(fromAmount) === 0
                          ? "Amount must be greater than 0"
                          : undefined
                    }
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>balance: 2.14 ETH</span>
                <span>~$1,625.50</span>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-3 relative z-10">
              <button
                type="button"
                onClick={handleSwapTokens}
                disabled={!fromToken || !toToken}
                className="bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-500 rounded-full p-3 transition-transform duration-200 shadow-sm"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m0 0l4 4m10-4v12m0 0l4-4m0 0l-4-4"
                  />
                </svg>
              </button>
            </div>

            {/* To Token Section */}
            <div className="border border-slate-200 rounded-xl px-4 py-4 bg-sky-50">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-slate-500 font-medium">
                  You Receive
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <TokenSelector
                  tokens={tokens}
                  selectedToken={toToken}
                  onSelect={setToToken}
                  placeholder="USDT"
                />
                <div className="flex-1 ml-4 flex justify-end">
                  <AmountInput
                    value={toAmount}
                    onChange={() => {}}
                    placeholder="3,251.00"
                    label={undefined}
                    readOnly
                    className="text-sky-600"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>balance: 1450.32156</span>
                <span>~$3,251.0000</span>
              </div>
            </div>

            {/* Exchange Rate & Info */}
            <div className="pt-4 border-t border-slate-200 text-xs text-slate-600 space-y-1">
              {fromToken && toToken && (
                <div className="flex items-center justify-between">
                  <span>
                    1 {fromToken.currency} ={" "}
                    {exchangeRate.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}{" "}
                    {toToken.currency}
                  </span>
                  <span>0.5%</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span>Slippage Tolerance:</span>
                <span>0.5%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Network Fee:</span>
                <span>~$4.80</span>
              </div>
            </div>

            {/* Error notification */}
            {submitError && (
              <div className="text-sm rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2">
                {submitError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              className={`w-full py-3 px-4 rounded-full font-semibold transition-all flex items-center justify-center gap-2
                 ${
                   isValid && !isSubmitting
                     ? "bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-500/50"
                     : "bg-slate-300 text-slate-500 cursor-not-allowed"
                 }
               `}
            >
              {isSubmitting && <LoadingSpinner size="sm" />}
              {isSubmitting ? "Processing..." : "CONFIRM SWAP"}
            </button>

            {/* Success Message */}
            {submitSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center mt-2 text-sm text-emerald-700">
                Swap simulated: {fromAmount} {fromToken?.currency} → {toAmount}{" "}
                {toToken?.currency}
              </div>
            )}
          </form>
        )}
      </div>

      {/* Footer Info */}
      {tokens.length > 0 && (
        <div className="mt-6 text-center text-sm text-slate-600">
          <p>
            Supporting {tokens.length} tokens ·{" "}
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="text-sky-600 hover:text-sky-500 underline underline-offset-2"
            >
              View history
            </button>
          </p>
        </div>
      )}

      <HistoryModal
        open={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}
