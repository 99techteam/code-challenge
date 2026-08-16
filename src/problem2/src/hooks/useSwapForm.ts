import { useEffect, useMemo, useState } from "react";
import type { PriceMap } from "../types";
import { loadPrices } from "../utils/loadPrices";
import { formatAmount } from "../utils/format";

const DEFAULT_FROM = "ETH";
const DEFAULT_TO = "USDC";

type Status = "loading" | "ready" | "error";

export function useSwapForm() {
  const [prices, setPrices] = useState<PriceMap>({});
  const [status, setStatus] = useState<Status>("loading");

  const [fromCurrency, setFromCurrency] = useState(DEFAULT_FROM);
  const [toCurrency, setToCurrency] = useState(DEFAULT_TO);
  const [fromAmount, setFromAmount] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadPrices()
      .then((map) => {
        if (cancelled) return;
        setPrices(map);
        setStatus("ready");
        // Fall back to whatever two currencies actually have prices,
        // in case the defaults are ever missing from the feed.
        const currencies = Object.keys(map);
        if (!map[DEFAULT_FROM] || !map[DEFAULT_TO]) {
          setFromCurrency(currencies[0] ?? "");
          setToCurrency(currencies[1] ?? currencies[0] ?? "");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const currencies = useMemo(() => Object.keys(prices).sort(), [prices]);

  const rate = useMemo(() => {
    const fromPrice = prices[fromCurrency]?.price;
    const toPrice = prices[toCurrency]?.price;
    if (!fromPrice || !toPrice) return null;
    return fromPrice / toPrice;
  }, [prices, fromCurrency, toCurrency]);

  const parsedAmount = Number(fromAmount);
  const hasAmount = fromAmount.trim().length > 0;
  const isAmountValid = hasAmount && Number.isFinite(parsedAmount) && parsedAmount > 0;

  const toAmount = rate !== null && isAmountValid ? parsedAmount * rate : null;

  const error = useMemo(() => {
    if (!hasAmount) return null;
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return "Enter an amount greater than 0.";
    }
    return null;
  }, [hasAmount, parsedAmount]);

  const canSubmit =
    status === "ready" &&
    isAmountValid &&
    rate !== null &&
    fromCurrency !== toCurrency &&
    !submitting;

  function handleSwapDirection() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmount !== null ? String(Number(toAmount.toFixed(6))) : "");
    setSuccessMessage(null);
  }

  function handleFromCurrencyChange(currency: string) {
    setFromCurrency(currency);
    setSuccessMessage(null);
  }

  function handleToCurrencyChange(currency: string) {
    setToCurrency(currency);
    setSuccessMessage(null);
  }

  function handleAmountChange(value: string) {
    // Allow only digits and a single decimal point while typing.
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    setFromAmount(value);
    setSuccessMessage(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setSuccessMessage(null);

    // No real backend for this challenge — simulate network latency so the
    // loading state on the submit button is visible.
    window.setTimeout(() => {
      setSubmitting(false);
      setSuccessMessage(
        `Swapped ${formatAmount(parsedAmount)} ${fromCurrency} for ${formatAmount(
          toAmount ?? 0
        )} ${toCurrency}.`
      );
      setFromAmount("");
    }, 1200);
  }

  return {
    status,
    currencies,
    fromCurrency,
    toCurrency,
    fromAmount,
    toAmount,
    rate,
    error,
    canSubmit,
    submitting,
    successMessage,
    handleSwapDirection,
    handleFromCurrencyChange,
    handleToCurrencyChange,
    handleAmountChange,
    handleSubmit,
  };
}
