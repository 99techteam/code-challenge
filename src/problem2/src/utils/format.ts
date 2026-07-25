/**
 * Formatting and number helpers for the swap UI.
 */

/** Parse a user-typed amount, tolerating thousands separators and stray spaces. */
export function parseAmount(raw: string): number {
  if (!raw) return NaN
  return Number(raw.replace(/,/g, '').trim())
}

/** Format a token amount with a sensible, magnitude-aware number of decimals. */
export function formatTokenAmount(value: number): string {
  if (!Number.isFinite(value)) return '0'
  if (value === 0) return '0'
  const abs = Math.abs(value)
  let decimals = 4
  if (abs >= 1000) decimals = 2
  else if (abs >= 1) decimals = 4
  else if (abs >= 0.0001) decimals = 6
  else decimals = 8
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })
}

/** Format a USD value as currency. */
export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return '$0.00'
  const abs = Math.abs(value)
  const decimals = abs > 0 && abs < 0.01 ? 6 : 2
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  })
}

/** Compact display of a wallet balance. */
export function formatBalance(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: value >= 1 ? 4 : 6,
  })
}
