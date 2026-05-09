import type { TPrice } from "../models";
import { formatAmount, formatUsd, rate } from "../utils";

export const useSwapUI = (
  data: Array<
    Omit<TPrice, "date"> & {
      date: number;
    }
  >,
  from: string,
  to: string,
  rawAmount: string
) => {
  const prices = new Map(
    data
      .filter((x) => [from, to].includes(x.currency))
      .map((x) => [x.currency, x.price])
  );
  const pf = prices.get(from);
  const pt = prices.get(to);
  const fromPriceHint = !!pf ? `Ref ${formatUsd(pf)}` : "";
  const toPriceHint = !!pt ? `Ref ${formatUsd(pt)}` : "";

  if (from === to) {
    return {
      fromPriceHint,
      toPriceHint,
      outputAmount: "—",
      rate: null,
      pairRate: "",
    };
  }

  const r = rate(from, to, prices);
  if (r === null) {
    return {
      fromPriceHint,
      toPriceHint,
      outputAmount: "—",
      rate: null,
      pairRate: "",
    };
  }

  return {
    fromPriceHint,
    toPriceHint,
    outputAmount: rawAmount !== "" ? formatAmount(Number(rawAmount) * r) : "—",
    rate: r,
    pairRate: `1 ${from} ≈ ${formatAmount(r)} ${to}`,
  };
};
