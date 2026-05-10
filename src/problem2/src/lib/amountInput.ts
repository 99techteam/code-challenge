export type ParsedAmount =
  | { kind: "empty" }
  | { kind: "invalid"; message: string }
  | { kind: "ok"; value: number };

export const parseAmountInput = (
  raw: string,
  maxDecimals = 12,
): ParsedAmount => {
  const s = raw.trim().replace(/,/g, "");
  if (s === "") {
    return { kind: "empty" };
  }
  if (s.startsWith("-")) {
    return { kind: "invalid", message: "Amount must be positive" };
  }
  if (!/^\d*\.?\d+$/.test(s)) {
    return { kind: "invalid", message: "Enter a valid number" };
  }
  const parts = s.split(".");
  if (parts.length > 2) {
    return { kind: "invalid", message: "Use at most one decimal point" };
  }
  const frac = parts[1];
  if (frac !== undefined && frac.length > maxDecimals) {
    return {
      kind: "invalid",
      message: `At most ${maxDecimals} decimal places`,
    };
  }
  const value = Number.parseFloat(s);
  if (!Number.isFinite(value)) {
    return { kind: "invalid", message: "Enter a valid number" };
  }
  if (value < 0) {
    return { kind: "invalid", message: "Amount must be positive" };
  }
  return { kind: "ok", value };
};

export const amountToInputString = (n: number) => {
  if (!Number.isFinite(n) || n <= 0) {
    return "";
  }
  return n
    .toFixed(12)
    .replace(/\.?0+$/, "")
    .replace(/^0+(?=\d)/, "");
};
