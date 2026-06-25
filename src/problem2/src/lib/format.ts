/**
 * How many units of `toToken` you get for one unit of `fromToken`.
 * Returns 0 if either price is missing or zero.
 */
export function computeReceiveAmount(
  sendAmount: number,
  fromPrice: number,
  toPrice: number
): number {
  if (!toPrice || !fromPrice) return 0;
  return (sendAmount * fromPrice) / toPrice;
}

// Reuse one formatter instance — constructing Intl objects is expensive.
const amountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});

export function formatAmount(value: number): string {
  return amountFormatter.format(value);
}

export function formatRate(
  fromSymbol: string,
  toSymbol: string,
  fromPrice: number,
  toPrice: number
): string {
  if (!toPrice) return "—";
  const rate = fromPrice / toPrice;
  return `1 ${fromSymbol} ≈ ${formatAmount(rate)} ${toSymbol}`;
}
