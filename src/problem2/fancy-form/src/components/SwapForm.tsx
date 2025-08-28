import React from "react";
import FormButton from "./FormButton";
import SwapInputGroup from "./SwapInputGroup";
import type { Token } from "@models/token";
// import { formatNumber } from "@utils/formatter";

const formatNumber = (n: number, decimals = 6) => {
  return Number.isFinite(n)
    ? n.toLocaleString(undefined, { maximumFractionDigits: decimals })
    : "-";
};

type SwapFormProps = {
  tokens: Token[];
  fromTokenCurrency: string;
  toTokenCurrency: string;
  fromAmount: string;
  toAmount: string;
  loadingSubmit: boolean;
  lastError: string | null;
  ratesLoading: boolean;
  prices: Record<string, number> | null;
  exchangeRate: number | null;
  onFromTokenChange: (id: string) => void;
  onToTokenChange: (id: string) => void;
  onFromAmountChange: (v: string) => void;
  onSwap: () => void;
  onSubmit: (e?: React.FormEvent) => void;
  onReset: () => void;
};

export default function SwapForm({
  tokens,
  fromTokenCurrency,
  toTokenCurrency,
  fromAmount,
  toAmount,
  loadingSubmit,
  lastError,
  ratesLoading,
  prices,
  exchangeRate,
  onFromTokenChange,
  onToTokenChange,
  onFromAmountChange,
  onSwap,
  onSubmit,
  onReset,
}: SwapFormProps) {
  const fromToken = tokens.find((t) => t.currency === fromTokenCurrency)!;
  const toToken = tokens.find((t) => t.currency === toTokenCurrency)!;

  const fromTokenOptions = tokens.filter((t) => t.currency !== toTokenCurrency);
  const toTokenOptions = tokens.filter((t) => t.currency !== fromTokenCurrency);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <SwapInputGroup
        label="From"
        amount={fromAmount}
        onAmountChange={onFromAmountChange}
        placeholder="0.0"
        tokenCurrency={fromTokenCurrency}
        onTokenChange={onFromTokenChange}
        tokens={fromTokenOptions}
        inputProps={{ inputMode: "decimal", type: "text", "aria-label": "From amount" }}
      />

      <div className="flex justify-center">
        <FormButton
          type="button"
          onClick={onSwap}
          title="Swap tokens"
          className="rounded-full p-2 border bg-slate-100 hover:bg-slate-200"
        >
          ⇅
        </FormButton>
      </div>

      <SwapInputGroup
        label="To"
        amount={toAmount}
        readOnly
        placeholder="Calculated amount"
        tokenCurrency={toTokenCurrency}
        onTokenChange={onToTokenChange}
        tokens={toTokenOptions}
      />

      <div className="flex items-center justify-between text-sm text-slate-600">
        <div>
          {ratesLoading ? (
            <span>Loading rates…</span>
          ) : exchangeRate == null ? (
            <span>Rate unavailable</span>
          ) : (
            <span>
              1 {fromToken.currency} ≈ {formatNumber(exchangeRate, 6)} {toToken.currency}
            </span>
          )}
        </div>
        <div>
          {prices && (
            <span className="text-xs text-slate-400">Prices in USD: {fromToken.currency} ${prices[fromToken.currency] ?? 0}</span>
          )}
        </div>
      </div>

      {lastError && <div className="text-sm text-red-600">{lastError}</div>}

      <div className="flex gap-3">
        <FormButton
          type="submit"
          disabled={loadingSubmit}
          className="flex-1 py-2 rounded bg-blue-600 text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loadingSubmit ? "Swapping…" : "Swap"}
        </FormButton>
        <FormButton
          type="button"
          onClick={onReset}
          className="px-4 py-2 rounded border"
        >
          Reset
        </FormButton>
      </div>
    </form>
  );
}