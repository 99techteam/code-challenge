// Decimal big-number arithmetic on plain strings.
//
// Inputs are integer strings, optionally prefixed with '-'.
// All exported operations preserve sign correctly and never lose precision.
// Used by sum_to_n_d to compute n * (n + 1) / 2 without hitting
// Number.MAX_SAFE_INTEGER.

export const stripLeadingZeros = (s: string): string => {
  let i = 0;
  while (i < s.length - 1 && s.charCodeAt(i) === 48) i++;
  return s.slice(i);
};

// Compare magnitudes of two non-negative decimal strings. Returns -1, 0, or 1.
export const cmpAbs = (a: string, b: string): -1 | 0 | 1 => {
  const aa = stripLeadingZeros(a);
  const bb = stripLeadingZeros(b);
  if (aa.length !== bb.length) return aa.length < bb.length ? -1 : 1;
  if (aa < bb) return -1;
  if (aa > bb) return 1;
  return 0;
};

interface Split {
  sign: 1 | -1;
  abs: string;
}

const splitSign = (s: string): Split => {
  if (s.startsWith('-')) return { sign: -1, abs: s.slice(1) };
  return { sign: 1, abs: s };
};

const applySign = (sign: 1 | -1, abs: string): string => {
  const stripped = stripLeadingZeros(abs);
  if (stripped === '0') return '0';
  return sign === -1 ? '-' + stripped : stripped;
};

// Add two non-negative decimal strings, right-to-left, with carry.
const addAbs = (a: string, b: string): string => {
  let i = a.length - 1;
  let j = b.length - 1;
  let carry = 0;
  let result = '';
  while (i >= 0 || j >= 0 || carry > 0) {
    let sum = carry;
    if (i >= 0) sum += a.charCodeAt(i--) - 48;
    if (j >= 0) sum += b.charCodeAt(j--) - 48;
    carry = (sum / 10) | 0;
    result = (sum % 10) + result;
  }
  return result;
};

// Subtract b from a assuming a >= b >= 0 (both non-negative decimal strings).
const subAbs = (a: string, b: string): string => {
  let i = a.length - 1;
  let j = b.length - 1;
  let borrow = 0;
  let result = '';
  while (i >= 0) {
    let diff = (a.charCodeAt(i--) - 48) - borrow;
    if (j >= 0) diff -= (b.charCodeAt(j--) - 48);
    if (diff < 0) {
      diff += 10;
      borrow = 1;
    } else {
      borrow = 0;
    }
    result = diff + result;
  }
  return stripLeadingZeros(result);
};

// Signed addition. Handles all four sign combinations by reducing to
// addAbs / subAbs of magnitudes.
export const addBigNumbers = (a: string, b: string): string => {
  const A = splitSign(a);
  const B = splitSign(b);
  if (A.sign === B.sign) {
    return applySign(A.sign, addAbs(A.abs, B.abs));
  }
  const cmp = cmpAbs(A.abs, B.abs);
  if (cmp === 0) return '0';
  if (cmp > 0) return applySign(A.sign, subAbs(A.abs, B.abs));
  return applySign(B.sign, subAbs(B.abs, A.abs));
};

// Long multiplication, O(d_a * d_b).
const mulAbs = (a: string, b: string): string => {
  const A = stripLeadingZeros(a);
  const B = stripLeadingZeros(b);
  if (A === '0' || B === '0') return '0';
  const out: number[] = new Array(A.length + B.length).fill(0);
  for (let i = A.length - 1; i >= 0; i--) {
    const da = A.charCodeAt(i) - 48;
    for (let j = B.length - 1; j >= 0; j--) {
      const db = B.charCodeAt(j) - 48;
      const pos = i + j + 1;
      const total = out[pos] + da * db;
      out[pos] = total % 10;
      out[pos - 1] += (total / 10) | 0;
    }
  }
  return stripLeadingZeros(out.join(''));
};

export const mulBigNumbers = (a: string, b: string): string => {
  const A = splitSign(a);
  const B = splitSign(b);
  const sign = (A.sign * B.sign) as 1 | -1;
  return applySign(sign, mulAbs(A.abs, B.abs));
};

// Floor division of a decimal string by 2, single-digit long division.
// The only caller (sum_to_n_d) always divides a non-negative even product,
// so the floor matches the true quotient.
export const divBy2 = (s: string): string => {
  const { sign, abs } = splitSign(s);
  let result = '';
  let carry = 0;
  for (let i = 0; i < abs.length; i++) {
    const cur = carry * 10 + (abs.charCodeAt(i) - 48);
    result += ((cur / 2) | 0).toString();
    carry = cur % 2;
  }
  return applySign(sign, result);
};
