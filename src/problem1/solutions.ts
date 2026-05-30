// Metadata + display text for the four sum_to_n solutions. Rendered in
// the left-hand panel of the Problem 1 tab when a solution is selected.

export type SolutionId = 'a' | 'b' | 'c' | 'd';

export interface Solution {
  id: SolutionId;
  name: string;
  time: string;
  space: string;
  explanation: string;
  code: string;
}

export const solutions: Record<SolutionId, Solution> = {
  a: {
    id: 'a',
    name: 'sum_to_n_a — Iterative Loop',
    time: 'O(n)',
    space: 'O(1)',
    explanation:
      'Walks from 1 up to n with a counter, accumulating the running total ' +
      'in a single variable. This is the most direct translation of "add ' +
      'every number from 1 to n". It performs n additions, so runtime grows ' +
      'linearly with n; for n in the millions it is still fast (sub-second) ' +
      'but cannot beat the constant-time formula. Negative n is handled by ' +
      'recursing on -n and negating the result, so sum_to_n_a(-5) = ' +
      '-(1 + 2 + 3 + 4 + 5) = -15.',
    code: `var sum_to_n_a = function (n) {
  if (n < 0) return -sum_to_n_a(-n);
  let sum = 0;
  for (let i = 1; i <= n; i++) sum += i;
  return sum;
};`,
  },

  b: {
    id: 'b',
    name: 'sum_to_n_b — Gauss Formula',
    time: 'O(1)',
    space: 'O(1)',
    explanation:
      'Uses the closed-form arithmetic-series formula n * (n + 1) / 2. ' +
      'Pair 1 + n, 2 + (n−1), ... — every pair sums to n + 1 and there are ' +
      'n / 2 pairs, so the total is n · (n + 1) / 2. Constant time and ' +
      'constant space regardless of n, so this is the right choice whenever ' +
      'the result fits in Number.MAX_SAFE_INTEGER.',
    code: `var sum_to_n_b = function (n) {
  if (n < 0) return -sum_to_n_b(-n);
  return (n * (n + 1)) / 2;
};`,
  },

  c: {
    id: 'c',
    name: 'sum_to_n_c — Functional (Array.from + reduce)',
    time: 'O(n)',
    space: 'O(n)',
    explanation:
      'Builds the array [1, 2, ..., n] with Array.from and folds it into a ' +
      'single sum with reduce. Same number of additions as the iterative ' +
      'loop, but it also allocates an array of length n, so it uses O(n) ' +
      'memory. Included as a "functional style" contrast to the imperative ' +
      'loop, not because it is faster. For very large n the allocation ' +
      'fails before the sum does.',
    code: `var sum_to_n_c = function (n) {
  if (n < 0) return -sum_to_n_c(-n);
  return Array.from({ length: n }, (_, i) => i + 1)
              .reduce((a, b) => a + b, 0);
};`,
  },

  d: {
    id: 'd',
    name: 'sum_to_n_d — Big-Number Formula (decimal strings)',
    time: 'O(d²) where d = digits of n',
    space: 'O(d)',
    explanation:
      'Same Gauss identity as sum_to_n_b, but every arithmetic step is ' +
      'performed on decimal strings so the result is not bounded by ' +
      'Number.MAX_SAFE_INTEGER. Pipeline: (1) parse the input string and ' +
      'peel off the sign; (2) addBigNumbers(n, "1") computes n + 1 by ' +
      'schoolbook addition right-to-left with a carry; (3) ' +
      'mulBigNumbers(n, n + 1) does long multiplication, O(d²); (4) ' +
      'divBy2(product) does single-digit long division by 2 — the product ' +
      'is always even because n and n+1 are consecutive, so the result is ' +
      'exact; (5) reattach the sign. Accepts number | string and always ' +
      'returns a string, e.g. sum_to_n_d("123456789012345678901234567890") ' +
      'yields a 58-digit answer.',
    code: `// Accepts number | string. Returns string.
var sum_to_n_d = function (n) {
  const input = String(n).trim();
  if (!/^-?\\d+$/.test(input)) throw new Error('Invalid integer');

  const negative = input.startsWith('-');
  const abs = negative ? input.slice(1) : input;

  const absPlus1 = addBigNumbers(abs, '1');
  const product  = mulBigNumbers(abs, absPlus1);
  const half     = divBy2(product);

  if (half === '0') return '0';
  return negative ? '-' + half : half;
};

// --- string-based helpers (non-negative inputs) ---

function addBigNumbers(a, b) {
  let i = a.length - 1, j = b.length - 1, carry = 0, result = '';
  while (i >= 0 || j >= 0 || carry > 0) {
    let sum = carry;
    if (i >= 0) sum += a.charCodeAt(i--) - 48;
    if (j >= 0) sum += b.charCodeAt(j--) - 48;
    carry = (sum / 10) | 0;
    result = (sum % 10) + result;
  }
  return result;
}

function mulBigNumbers(a, b) {
  if (a === '0' || b === '0') return '0';
  const out = new Array(a.length + b.length).fill(0);
  for (let i = a.length - 1; i >= 0; i--) {
    const da = a.charCodeAt(i) - 48;
    for (let j = b.length - 1; j >= 0; j--) {
      const db = b.charCodeAt(j) - 48;
      const pos = i + j + 1;
      const total = out[pos] + da * db;
      out[pos] = total % 10;
      out[pos - 1] += (total / 10) | 0;
    }
  }
  return out.join('').replace(/^0+/, '') || '0';
}

function divBy2(s) {
  let result = '', carry = 0;
  for (let i = 0; i < s.length; i++) {
    const cur = carry * 10 + (s.charCodeAt(i) - 48);
    result += ((cur / 2) | 0).toString();
    carry = cur % 2;
  }
  return result.replace(/^0+/, '') || '0';
}`,
  },
};
