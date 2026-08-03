/**
 * Problem 4: Three ways to sum to n.
 *
 * Negative-input convention:
 * sum_to_n(-4) = -1 + -2 + -3 + -4 = -10
 */

function assertSafeInteger(n: number): void {
  if (!Number.isSafeInteger(n)) {
    throw new TypeError("n must be a safe integer");
  }
}

function applySign(n: number, positiveResult: number): number {
  if (!Number.isSafeInteger(positiveResult)) {
    throw new RangeError(
      "The result must be smaller than Number.MAX_SAFE_INTEGER",
    );
  }

  return n < 0 ? -positiveResult : positiveResult;
}

/**
 * Solution A: arithmetic-series formula.
 *
 * Uses n(n + 1) / 2 and divides the even factor before multiplication
 * to avoid an unnecessarily large intermediate value.
 *
 * Time complexity: O(1)
 * Space complexity: O(1)
 */
export function sum_to_n_a(n: number): number {
  assertSafeInteger(n);

  const magnitude = Math.abs(n);
  const positiveResult =
    magnitude % 2 === 0
      ? (magnitude / 2) * (magnitude + 1)
      : magnitude * ((magnitude + 1) / 2);

  return applySign(n, positiveResult);
}

/**
 * Solution B: iterative accumulation.
 *
 * Adds every integer from 1 through |n|.
 *
 * Time complexity: O(|n|)
 * Space complexity: O(1)
 */
export function sum_to_n_b(n: number): number {
  assertSafeInteger(n);

  const magnitude = Math.abs(n);
  let positiveResult = 0;

  for (let value = 1; value <= magnitude; value += 1) {
    positiveResult += value;
  }

  return applySign(n, positiveResult);
}

/**
 * Solution C: divide-and-conquer recurrence.
 *
 * Uses:
 * S(2k)     = 2S(k) + k²
 * S(2k + 1) = 2S(k) + k² + 2k + 1
 *
 * Time complexity: O(log |n|)
 * Space complexity: O(log |n|)
 */
function binarySum(magnitude: number): number {
  if (magnitude === 0) {
    return 0;
  }

  if (magnitude === 1) {
    return 1;
  }

  const half = Math.floor(magnitude / 2);
  const halfResult = binarySum(half);
  const evenResult = 2 * halfResult + half * half;

  return magnitude % 2 === 0
    ? evenResult
    : evenResult + 2 * half + 1;
}

export function sum_to_n_c(n: number): number {
  assertSafeInteger(n);

  return applySign(
    n,
    binarySum(Math.abs(n)),
  );
}
