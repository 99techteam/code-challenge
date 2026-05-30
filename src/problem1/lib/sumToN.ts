// Four implementations of sum_to_n.
//
//   sum_to_n_a — iterative loop                    O(n) time, O(1) space
//   sum_to_n_b — Gauss closed-form formula         O(1) time, O(1) space
//   sum_to_n_c — Array.from + reduce               O(n) time, O(n) space
//   sum_to_n_d — big-number Gauss on strings       O(d^2) where d = digits of n
//
// a / b / c assume the result fits in Number.MAX_SAFE_INTEGER, per the
// problem statement. d lifts that restriction by doing every arithmetic
// step on decimal strings; it accepts number | string and returns string.
//
// For negative n, every variant returns the negation of the positive sum:
//   sum_to_n(-5) === -(1 + 2 + 3 + 4 + 5) === -15.

import { addBigNumbers, mulBigNumbers, divBy2 } from './bigNumber';

export const sum_to_n_a = (n: number): number => {
  if (n < 0) return -sum_to_n_a(-n);
  let sum = 0;
  for (let i = 1; i <= n; i++) sum += i;
  return sum;
};

export const sum_to_n_b = (n: number): number => {
  if (n < 0) return -sum_to_n_b(-n);
  return (n * (n + 1)) / 2;
};

export const sum_to_n_c = (n: number): number => {
  if (n < 0) return -sum_to_n_c(-n);
  return Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a + b, 0);
};

// Accepts number | string. Always returns a string, because the result can
// exceed Number.MAX_SAFE_INTEGER.
export const sum_to_n_d = (n: number | string): string => {
  const input = String(n).trim();
  if (!/^-?\d+$/.test(input)) {
    throw new Error(
      `sum_to_n_d: invalid integer input: ${JSON.stringify(input)}`,
    );
  }

  const negative = input.startsWith('-');
  const abs = negative ? input.slice(1) : input;

  // sum = abs * (abs + 1) / 2
  const absPlus1 = addBigNumbers(abs, '1');
  const product = mulBigNumbers(abs, absPlus1);
  const half = divBy2(product);

  if (half === '0') return '0';
  return negative ? '-' + half : half;
};
