/**
 * Formats a number for display in the swap form.
 *
 * Uses up to 8 significant digits so very small token prices (e.g. 0.0040877)
 * remain readable while large values stay compact.
 */
export function formatAmount(value: number, maxDecimals = 8): string {
  if (!Number.isFinite(value)) return "0"
  if (value === 0) return "0"

  const abs = Math.abs(value)
  const decimals = abs >= 1 ? Math.min(6, maxDecimals) : maxDecimals

  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })
}

/**
 * Parses a user-entered amount string into a number, returning NaN if invalid.
 *
 * Strips grouping separators but only accepts a single decimal point.
 */
export function parseAmount(raw: string): number {
  const trimmed = raw.trim().replace(/,/g, "")
  if (!trimmed) return NaN
  if (!/^\d*(\.\d*)?$/.test(trimmed)) return NaN
  return Number(trimmed)
}
