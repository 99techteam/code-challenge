"use strict";

/**
 * 99Tech Code Challenge — Problem 1
 *
 * This file contains only the three requested implementations.
 * Audit and logging are intentionally kept in audit.js so these functions
 * remain small, deterministic, and easy to review.
 */

const MAX_SAFE_SUM_N = 134_217_727;

/**
 * Validate the shared contract for all three implementations.
 *
 * Negative input follows this convention:
 *   sum_to_n(-4) = -1 + -2 + -3 + -4 = -10
 */
function validateInput(n) {
  if (!Number.isSafeInteger(n)) {
    throw new TypeError("n must be a safe integer");
  }

  if (Math.abs(n) > MAX_SAFE_SUM_N) {
    throw new RangeError(
      `|n| must be <= ${MAX_SAFE_SUM_N} so the result remains a safe integer`,
    );
  }
}

/**
 * Restore the sign after an implementation calculates the positive magnitude.
 */
function withOriginalSign(n, positiveSum) {
  return n < 0 ? -positiveSum : positiveSum;
}

/**
 * Solution A — Closed-form arithmetic-series formula.
 *
 * The values 1..n form an arithmetic progression, so:
 *   S(n) = n(n + 1) / 2
 *
 * One of n and n + 1 is always even. Dividing that factor first avoids an
 * unnecessarily large intermediate multiplication.
 *
 * Time:  O(1)
 * Space: O(1)
 */
function sum_to_n_a(n) {
  validateInput(n);

  const magnitude = Math.abs(n);
  let firstFactor = magnitude;
  let secondFactor = magnitude + 1;

  if (firstFactor % 2 === 0) {
    firstFactor /= 2;
  } else {
    secondFactor /= 2;
  }

  const positiveSum = firstFactor * secondFactor;
  return withOriginalSign(n, positiveSum);
}

/**
 * Multiply two fixed 3 × 3 matrices.
 */
function multiply3x3(left, right) {
  const result = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      for (let index = 0; index < 3; index += 1) {
        result[row][column] +=
          left[row][index] * right[index][column];
      }
    }
  }

  return result;
}

/**
 * Solution B — Fast matrix exponentiation.
 *
 * State vector:
 *   [sum(k), k, 1]^T
 *
 * Transition matrix:
 *   [1 1 1]
 *   [0 1 1]
 *   [0 0 1]
 *
 * Raising this matrix to |n| gives the triangular sum in entry [0][2].
 * Exponentiation by squaring reduces the number of matrix multiplications.
 *
 * Time:  O(log |n|)
 * Space: O(1), because every matrix is always 3 × 3
 */
function sum_to_n_b(n) {
  validateInput(n);

  let exponent = Math.abs(n);
  let resultMatrix = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
  let baseMatrix = [
    [1, 1, 1],
    [0, 1, 1],
    [0, 0, 1],
  ];

  while (exponent > 0) {
    if (exponent % 2 === 1) {
      resultMatrix = multiply3x3(resultMatrix, baseMatrix);
    }

    exponent = Math.floor(exponent / 2);

    // Skip the final unnecessary square. Besides doing less work, this keeps
    // every intermediate matrix within the safe range implied by the input.
    if (exponent > 0) {
      baseMatrix = multiply3x3(baseMatrix, baseMatrix);
    }
  }

  const positiveSum = resultMatrix[0][2];
  return withOriginalSign(n, positiveSum);
}

/**
 * Solution C — Symmetric pairing.
 *
 * Pair the smallest and largest values:
 *   1 + n
 *   2 + (n - 1)
 *   3 + (n - 2)
 *
 * Every pair has the same value, n + 1. For odd n, add the unpaired middle
 * value once. This implementation deliberately performs the pairing loop so
 * it is computationally different from the O(1) formula in solution A.
 *
 * Time:  O(|n|)
 * Space: O(1)
 */
function sum_to_n_c(n) {
  validateInput(n);

  const magnitude = Math.abs(n);
  const pairCount = Math.floor(magnitude / 2);
  let positiveSum = 0;

  for (let pair = 1; pair <= pairCount; pair += 1) {
    const oppositeValue = magnitude + 1 - pair;
    positiveSum += pair + oppositeValue;
  }

  if (magnitude % 2 === 1) {
    positiveSum += (magnitude + 1) / 2;
  }

  return withOriginalSign(n, positiveSum);
}

module.exports = {
  MAX_SAFE_SUM_N,
  sum_to_n_a,
  sum_to_n_b,
  sum_to_n_c,
};
