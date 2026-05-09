import { createListCollection } from "@chakra-ui/react";
import type { TPrice } from "./models";
import { TOKEN_ICONS_BASE_URL } from "./consts";

export function tokenIconUrl(currency: string): string {
  const safe = encodeURIComponent(currency);
  return `${TOKEN_ICONS_BASE_URL}/${safe}.svg`;
}
export const transformData = (
  data: Array<Omit<TPrice, "date"> & { date: number }>
) =>
  createListCollection({
    items: data.map((x, i) => ({
      id: x.currency,
      value: x.currency,
      name: x.currency,
      avatar: tokenIconUrl(x.currency),
    })),
  });

export function formatAmount(n: number): string {
  const abs = Math.abs(n);
  const digits = abs >= 1 ? 6 : abs >= 0.0001 ? 8 : 10;
  return n.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}
export function formatUsd(n: number): string {
  if (n >= 1000)
    return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (n >= 1)
    return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (n >= 0.0001)
    return `$${n.toLocaleString("en-US", { maximumFractionDigits: 6 })}`;
  return `$${n.toExponential(2)}`;
}

/** Price ratio: how many `to` tokens per one `from`. */
export function rate(
  from: string,
  to: string,
  prices: Map<string, number>
): number | null {
  const pf = prices.get(from);
  const pt = prices.get(to);
  if (!pf || !Boolean(pt)) return null;
  return pf / (pt as number);
}
