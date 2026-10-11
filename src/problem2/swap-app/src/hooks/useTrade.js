import { useMemo } from "react";
import { computeRate, computeTrade } from "../lib/trade.js";
import { fmt, } from "../lib/format.js";
import { symFor } from "../lib/constants.js";

export function useTrade(fromId, toId, amountIn, prices, loading) {
  const rate = useMemo(
    () => computeRate(prices, fromId, toId),
    [prices, fromId, toId]
  );

  const trade = useMemo(
    () => computeTrade(amountIn, fromId, prices, rate),
    [amountIn, fromId, prices, rate]
  );

  const rateLabel = loading
    ? "Fetching prices…"
    : isFinite(rate)
    ? `1 ${symFor(fromId)} ≈ ${fmt(rate)} ${symFor(toId)}`
    : "Rate unavailable";

  const canSubmit = !trade.err && !!amountIn.trim() && isFinite(rate);

  return { rate, rateLabel, trade, canSubmit };
}
