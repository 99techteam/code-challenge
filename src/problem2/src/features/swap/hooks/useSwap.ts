import BigNumber from "bignumber.js";

export function useSwapBigNumber(
  priceMap: Record<string, number>,
  fromToken: string,
  toToken: string,
  fromAmount: string
) {
  try {
    const fromPrice = priceMap[fromToken] ?? 0;
    const toPrice = priceMap[toToken] ?? 0;
    const amountBN = new BigNumber(fromAmount || 0);

    const rate =
      fromPrice && toPrice ? new BigNumber(toPrice).dividedBy(fromPrice) : new BigNumber(0);
    const output = amountBN.multipliedBy(rate);

    return { rate, output };
  } catch (e) {
    console.error("Swap calculation error:", e);
    return { rate: new BigNumber(0), output: new BigNumber(0) };
  }
}
