import React, { useEffect, useMemo, useState } from "react";
import SwapForm from "./components/SwapForm";
import { TOKENS } from "@data/mock_tokens";
import { getErrorMessage } from "@utils/validators";
// import { formatNumber } from "@utils/formatter";

const formatNumber = (n: number, decimals = 6) => {
  return Number.isFinite(n)
    ? n.toLocaleString(undefined, { maximumFractionDigits: decimals })
    : "-";
};

export default function App() {
  const [fromTokenCurrency, setFromTokenCurrency] = useState(TOKENS[0].currency);
  const [toTokenCurrency, setToTokenCurrency] = useState(TOKENS[1].currency);
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [prices, setPrices] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    setRatesLoading(true);
    const t = setTimeout(() => {
      // Convert array to object for fast lookup
      const pricesObj: Record<string, number> = {};
      TOKENS.forEach((token) => {
        pricesObj[token.currency] = token.price;
      });
      setPrices(pricesObj);
      setRatesLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const exchangeRate = useMemo(() => {
    if (!prices) return null;
    const pFrom = prices[fromTokenCurrency];
    const pTo = prices[toTokenCurrency];
    if (pFrom == null || pTo == null) return null;
    return pFrom === 0 ? null : pFrom / pTo;
  }, [prices, fromTokenCurrency, toTokenCurrency]);

  useEffect(() => {
    const amt = Number(fromAmount);
    if (!exchangeRate || fromAmount.trim() === "" || isNaN(amt) || !isFinite(amt)) {
      setToAmount("");
      return;
    }
    setToAmount((amt * exchangeRate).toString());
  }, [fromAmount, exchangeRate]);

  function swapTokens() {
    setFromTokenCurrency((prev) => {
      setToTokenCurrency(prev);
      return toTokenCurrency;
    });
    setFromAmount(toAmount);
    setToAmount(fromAmount);
    setLastError(null);
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setLastError(null);
    const err = getErrorMessage(fromAmount);
    if (err) {
      setLastError(err);
      return;
    }
    setLoadingSubmit(true);
    try {
      await new Promise((res) => setTimeout(res, 1200));
      alert(
        `Swapped ${formatNumber(Number(fromAmount), 6)} ${fromTokenCurrency} → ${formatNumber(
          Number(toAmount),
          6
        )} ${toTokenCurrency}`
      );
      setFromAmount("");
      setToAmount("");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setLastError("Swap failed — please try again.");
    } finally {
      setLoadingSubmit(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-3">Currency Swap</h1>

        <SwapForm
          tokens={TOKENS}
          fromTokenCurrency={fromTokenCurrency}
          toTokenCurrency={toTokenCurrency}
          fromAmount={fromAmount}
          toAmount={toAmount}
          loadingSubmit={loadingSubmit}
          lastError={lastError}
          ratesLoading={ratesLoading}
          prices={prices}
          exchangeRate={exchangeRate}
          onFromTokenChange={setFromTokenCurrency}
          onToTokenChange={setToTokenCurrency}
          onFromAmountChange={setFromAmount}
          onSwap={swapTokens}
          onSubmit={handleSubmit}
          onReset={() => {
            setFromAmount("");
            setToAmount("");
            setLastError(null);
          }}
        />
      </div>
    </div>
  );
}