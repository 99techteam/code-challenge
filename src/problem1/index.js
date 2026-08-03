"use strict";

/**
 * 99Tech Code Challenge — Problem 1
 *
 * Three mathematically distinct implementations:
 *   A. Combinatorics
 *   B. Linear algebra
 *   C. Probability symmetry
 *
 * Normal calls use the required signature:
 *   sum_to_n_a(n)
 *
 * A second optional callback is used only by audit.js:
 *   sum_to_n_a(n, event => ...)
 */

const MAX_SAFE_SUM_N = 134_217_727;

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

function emit(audit, algorithm, action, data = {}) {
  if (typeof audit === "function") {
    audit({ algorithm, action, data });
  }
}

function restoreSign(n, positiveValue, audit, algorithm) {
  const result = n < 0 ? -positiveValue : positiveValue;

  emit(audit, algorithm, "SIGN_RESTORED", {
    originalInput: n,
    positiveValue,
    result,
  });

  return result;
}

/**
 * A — Combinatorics
 *
 * S(n) = C(n + 1, 2)
 *
 * Time:  O(1)
 * Space: O(1)
 */
function sum_to_n_a(n, audit) {
  const algorithm = "A_COMBINATORICS";

  emit(audit, algorithm, "INPUT_RECEIVED", { n });

  validateInput(n);
  emit(audit, algorithm, "INPUT_VALIDATED", {
    n,
    isSafeInteger: true,
    isWithinSafeResultRange: true,
  });

  const magnitude = Math.abs(n);
  emit(audit, algorithm, "MAGNITUDE_CALCULATED", {
    expression: "|n|",
    magnitude,
  });

  let leftFactor = magnitude;
  let rightFactor = magnitude + 1;

  emit(audit, algorithm, "COMBINATION_IDENTITY_APPLIED", {
    identity: "C(n + 1, 2) = n(n + 1) / 2",
    leftFactor,
    rightFactor,
    divisor: 2,
  });

  if (leftFactor % 2 === 0) {
    const before = leftFactor;
    leftFactor /= 2;

    emit(audit, algorithm, "EVEN_FACTOR_DIVIDED", {
      factor: "leftFactor",
      before,
      divisor: 2,
      after: leftFactor,
    });
  } else {
    const before = rightFactor;
    rightFactor /= 2;

    emit(audit, algorithm, "EVEN_FACTOR_DIVIDED", {
      factor: "rightFactor",
      before,
      divisor: 2,
      after: rightFactor,
    });
  }

  const positiveSum = leftFactor * rightFactor;

  emit(audit, algorithm, "FACTORS_MULTIPLIED", {
    leftFactor,
    rightFactor,
    positiveSum,
  });

  const result = restoreSign(n, positiveSum, audit, algorithm);

  emit(audit, algorithm, "COMPLETED", {
    result,
    complexity: {
      time: "O(1)",
      space: "O(1)",
    },
  });

  return result;
}

function identityMatrix(size) {
  return Array.from(
    { length: size },
    (_, row) =>
      Array.from(
        { length: size },
        (_, column) => (row === column ? 1 : 0),
      ),
  );
}

function multiplyMatrices(left, right, audit, context) {
  const algorithm = "B_LINEAR_ALGEBRA";
  const size = left.length;
  const result = Array.from(
    { length: size },
    () => Array(size).fill(0),
  );

  emit(audit, algorithm, "MATRIX_MULTIPLICATION_STARTED", {
    ...context,
    left,
    right,
  });

  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      const terms = [];

      for (let k = 0; k < size; k += 1) {
        const product = left[row][k] * right[k][column];

        terms.push({
          leftValue: left[row][k],
          rightValue: right[k][column],
          product,
        });

        result[row][column] += product;
      }

      emit(audit, algorithm, "MATRIX_CELL_CALCULATED", {
        ...context,
        row,
        column,
        terms,
        cellValue: result[row][column],
      });
    }
  }

  emit(audit, algorithm, "MATRIX_MULTIPLICATION_COMPLETED", {
    ...context,
    result,
  });

  return result;
}

/**
 * B — Linear algebra using fast matrix exponentiation.
 *
 * State:
 *   [sum_k, k, 1]^T
 *
 * Transition:
 *   [1 1 1]
 *   [0 1 1]
 *   [0 0 1]
 *
 * Time:  O(log |n|)
 * Space: O(1), fixed 3 × 3 matrices
 */
function sum_to_n_b(n, audit) {
  const algorithm = "B_LINEAR_ALGEBRA";

  emit(audit, algorithm, "INPUT_RECEIVED", { n });

  validateInput(n);
  emit(audit, algorithm, "INPUT_VALIDATED", {
    n,
    isSafeInteger: true,
    isWithinSafeResultRange: true,
  });

  const magnitude = Math.abs(n);
  emit(audit, algorithm, "MAGNITUDE_CALCULATED", {
    expression: "|n|",
    magnitude,
  });

  const transitionMatrix = [
    [1, 1, 1],
    [0, 1, 1],
    [0, 0, 1],
  ];

  emit(audit, algorithm, "STATE_MODEL_DEFINED", {
    stateVector: ["sum_k", "k", "1"],
    initialVector: [0, 0, 1],
    transitionMatrix,
  });

  let resultMatrix = identityMatrix(3);
  let baseMatrix = transitionMatrix;
  let exponent = magnitude;
  let round = 0;

  emit(audit, algorithm, "MATRIX_POWER_INITIALIZED", {
    targetPower: magnitude,
    exponent,
    resultMatrix,
    baseMatrix,
  });

  while (exponent > 0) {
    round += 1;

    emit(audit, algorithm, "POWER_ROUND_STARTED", {
      round,
      exponent,
      isOdd: exponent % 2 === 1,
    });

    if (exponent % 2 === 1) {
      emit(audit, algorithm, "ODD_EXPONENT_BRANCH", {
        round,
        operation: "resultMatrix = resultMatrix × baseMatrix",
      });

      resultMatrix = multiplyMatrices(
        resultMatrix,
        baseMatrix,
        audit,
        {
          round,
          purpose: "ACCUMULATE_RESULT",
        },
      );

      emit(audit, algorithm, "RESULT_MATRIX_UPDATED", {
        round,
        resultMatrix,
      });
    } else {
      emit(audit, algorithm, "EVEN_EXPONENT_BRANCH", {
        round,
        operation: "result multiplication skipped",
      });
    }

    baseMatrix = multiplyMatrices(
      baseMatrix,
      baseMatrix,
      audit,
      {
        round,
        purpose: "SQUARE_BASE",
      },
    );

    emit(audit, algorithm, "BASE_MATRIX_SQUARED", {
      round,
      baseMatrix,
    });

    const previousExponent = exponent;
    exponent = Math.floor(exponent / 2);

    emit(audit, algorithm, "EXPONENT_HALVED", {
      round,
      before: previousExponent,
      after: exponent,
    });
  }

  emit(audit, algorithm, "MATRIX_POWER_COMPLETED", {
    power: magnitude,
    poweredMatrix: resultMatrix,
  });

  const positiveSum = resultMatrix[0][2];

  emit(audit, algorithm, "INITIAL_VECTOR_APPLIED", {
    poweredMatrix: resultMatrix,
    initialVector: [0, 0, 1],
    resultingVector: [
      resultMatrix[0][2],
      resultMatrix[1][2],
      resultMatrix[2][2],
    ],
    positiveSum,
  });

  const result = restoreSign(n, positiveSum, audit, algorithm);

  emit(audit, algorithm, "COMPLETED", {
    result,
    complexity: {
      time: "O(log |n|)",
      space: "O(1)",
    },
  });

  return result;
}

/**
 * C — Probability symmetry / antithetic pairing.
 *
 * Pair x with n + 1 - x. Every pair totals n + 1.
 *
 * Time:  O(|n|)
 * Space: O(1)
 */
function sum_to_n_c(n, audit) {
  const algorithm = "C_PROBABILITY_SYMMETRY";

  emit(audit, algorithm, "INPUT_RECEIVED", { n });

  validateInput(n);
  emit(audit, algorithm, "INPUT_VALIDATED", {
    n,
    isSafeInteger: true,
    isWithinSafeResultRange: true,
  });

  const magnitude = Math.abs(n);
  emit(audit, algorithm, "MAGNITUDE_CALCULATED", {
    expression: "|n|",
    magnitude,
  });

  const pairCount = Math.floor(magnitude / 2);
  const constantPairSum = magnitude + 1;

  emit(audit, algorithm, "ANTITHETIC_MODEL_DEFINED", {
    sampleSpace: `{1, 2, ..., ${magnitude}}`,
    mapping: "x ↔ n + 1 - x",
    pairCount,
    constantPairSum,
  });

  let positiveSum = 0;

  for (let pairIndex = 1; pairIndex <= pairCount; pairIndex += 1) {
    const left = pairIndex;
    const right = magnitude + 1 - pairIndex;
    const pairSum = left + right;
    const totalBefore = positiveSum;

    positiveSum += pairSum;

    emit(audit, algorithm, "PAIR_ACCUMULATED", {
      pairIndex,
      left,
      right,
      pairSum,
      totalBefore,
      totalAfter: positiveSum,
    });
  }

  if (magnitude % 2 === 1) {
    const middleValue = (magnitude + 1) / 2;
    const totalBefore = positiveSum;

    positiveSum += middleValue;

    emit(audit, algorithm, "MIDDLE_VALUE_ACCUMULATED", {
      middleValue,
      totalBefore,
      totalAfter: positiveSum,
    });
  } else {
    emit(audit, algorithm, "MIDDLE_VALUE_NOT_REQUIRED", {
      reason: "The number of values is even",
    });
  }

  const result = restoreSign(n, positiveSum, audit, algorithm);

  emit(audit, algorithm, "COMPLETED", {
    result,
    complexity: {
      time: "O(|n|)",
      space: "O(1)",
    },
  });

  return result;
}

module.exports = {
  MAX_SAFE_SUM_N,
  sum_to_n_a,
  sum_to_n_b,
  sum_to_n_c,
};
