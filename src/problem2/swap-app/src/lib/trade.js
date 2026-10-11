import { FEE_BPS, SLIPPAGE_BPS } from "./constants.js";
import { fmt, validateAmount } from "./format.js";

export const computeRate = (prices, fromId, toId) => {
  const a = prices[fromId]?.usd, b = prices[toId]?.usd;
  return isFinite(a) && isFinite(b) && b !== 0 ? a / b : NaN;
};

export const computeTrade = (amountRaw, fromId, prices, rate) => {
  const v = validateAmount(amountRaw);
  if (!v.ok) return { err: v.msg, outStr: "", fee: 0, impactBps: 0, minTo: 0 };

  if (!isFinite(rate))
    return { err: "Rate unavailable.", outStr: "", fee: 0, impactBps: 0, minTo: 0 };

  const fee = (v.value * FEE_BPS) / 10_000;
  const afterFee = v.value - fee;
  const outNoImpact = afterFee * rate;

  const notionalUsd = v.value * (prices[fromId]?.usd ?? 0);
  const impactBps = Math.min(200, (notionalUsd / 1_000_000) * 1000); // simple curve
  const outWithImpact = outNoImpact * (1 - impactBps / 10_000);
  const minTo = outWithImpact * (1 - SLIPPAGE_BPS / 10_000);

  return { err: "", outStr: fmt(outWithImpact), fee, impactBps, minTo };
};
