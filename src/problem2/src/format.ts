const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export const rateFormat = new Intl.NumberFormat("en-US", { maximumSignificantDigits: 6 });

export const AMOUNT_PATTERN = /^\d{0,15}(\.\d{0,18})?$/;

// Plain decimal string without grouping or exponent, safe to put back into an input.
export function toInputValue(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "";
  const digits = n >= 1 ? 6 : Math.min(18, Math.ceil(-Math.log10(n)) + 5);
  const out = n.toFixed(digits).replace(/\.?0+$/, "");
  return out === "" ? "0" : out;
}

export function formatUsd(n: number): string {
  if (n > 0 && n < 0.01) return "<$0.01";
  return usd.format(n);
}
