const ICON_BASE =
  "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";

export function iconUrlFor(symbol: string): string {
  return `${ICON_BASE}/${symbol}.svg`;
}

/**
 * Format a number for display in the amount input. Strips trailing zeros,
 * caps at 8 decimal places, no thousands separators (so the value can be
 * round-tripped through parseFloat).
 */
export function formatAmount(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "0";
  const fixed = n.toFixed(8);
  return fixed.replace(/\.?0+$/, "") || "0";
}

/** Format a USD value: $3,200.00 */
export function formatUsd(n: number): string {
  if (!Number.isFinite(n)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

/** Format a rate / display number with thousands separators, 6 sig figs. */
export function formatDisplayNumber(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return new Intl.NumberFormat("en-US", {
    maximumSignificantDigits: 6,
    useGrouping: true,
  }).format(n);
}

/**
 * Sanitize a raw user-typed amount string:
 * - keep only digits and one decimal point
 * - cap to 8 decimal places
 * - collapse leading zeros ("0005" -> "5", "0.5" preserved)
 * - rewrite a leading "." to "0."
 */
export function sanitizeAmount(raw: string): string {
  let s = raw.replace(/[^0-9.]/g, "");
  const firstDot = s.indexOf(".");
  if (firstDot !== -1) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, "");
  }
  const dot = s.indexOf(".");
  if (dot !== -1 && s.length - dot - 1 > 8) {
    s = s.slice(0, dot + 1 + 8);
  }
  if (s.length > 1 && s[0] === "0" && s[1] !== ".") {
    s = s.replace(/^0+/, "");
    if (s === "" || s.startsWith(".")) s = "0" + s;
  }
  if (s.startsWith(".")) s = "0" + s;
  return s;
}
