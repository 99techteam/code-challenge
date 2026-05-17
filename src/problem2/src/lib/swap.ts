/**
 * Convert an amount of one token to its USD-equivalent amount of another token.
 *
 * Both prices are USD per 1 token. The rate is fromPrice / toPrice.
 * Returns 0 for any non-finite or zero-denominator input — callers display "0"
 * in the receive field in that case, which is the right user-facing behavior.
 */
export function convert(
  amountIn: number,
  fromPrice: number,
  toPrice: number,
): number {
  if (
    !Number.isFinite(amountIn) ||
    !Number.isFinite(fromPrice) ||
    !Number.isFinite(toPrice) ||
    toPrice === 0
  ) {
    return 0;
  }
  return amountIn * (fromPrice / toPrice);
}
