import { t } from '../../lib/i18n'
import type { TokenInfo, TokenPrice } from './types'

const TOKEN_IMAGE_BASE =
  'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens'

export const buildTokenImageUrl = (symbol: string): string => {
  return `${TOKEN_IMAGE_BASE}/${symbol}.svg`
}

export const normalizeTokenPrices = (raw: TokenPrice[]): TokenInfo[] => {
  const map = new Map<string, TokenPrice>()

  for (const entry of raw) {
    if (!entry.price || entry.price <= 0) {
      continue
    }
    const existing = map.get(entry.currency)
    if (!existing || new Date(entry.date) > new Date(existing.date)) {
      map.set(entry.currency, entry)
    }
  }

  const result: TokenInfo[] = []
  for (const entry of map.values()) {
    result.push({
      symbol: entry.currency,
      price: entry.price,
      imageUrl: buildTokenImageUrl(entry.currency),
    })
  }

  result.sort((a, b) => a.symbol.localeCompare(b.symbol))

  return result
}

export const computeRate = (
  from: TokenInfo | undefined,
  to: TokenInfo | undefined,
): number | null => {
  if (!from || !to) {
    return null
  }
  if (from.price <= 0 || to.price <= 0) {
    return null
  }
  return from.price / to.price
}

// ── Banker's rounding (round half to even) ────────────────────────────────
// Standard in financial systems: avoids systematic bias from always rounding 0.5 up.
// e.g. 2.5 → 2, 3.5 → 4, 2.45 at 1dp → 2.4, 2.55 at 1dp → 2.6
export const bankersRound = (value: number, decimals: number): number => {
  const factor = 10 ** decimals
  const shifted = value * factor
  const floor = Math.floor(shifted)
  const remainder = shifted - floor

  // Floating point noise guard: treat values within epsilon of 0.5 as exactly halfway
  if (Math.abs(remainder - 0.5) < 1e-9) {
    return (floor % 2 === 0 ? floor : floor + 1) / factor
  }
  return Math.round(shifted) / factor
}

// Choose decimal places by order of magnitude — more precision for smaller values
const decimalsByMagnitude = (abs: number): number => {
  if (abs >= 100_000) {
    return 2
  }
  if (abs >= 1_000) {
    return 4
  }
  if (abs >= 1) {
    return 6
  }
  if (abs >= 0.0001) {
    return 8
  }
  // Very small: derive from position of first significant digit + 5 guard digits
  return Math.max(8, -Math.floor(Math.log10(abs)) + 5)
}

export const formatAmount = (value: number): string => {
  if (value === 0) {
    return '0'
  }
  const abs = Math.abs(value)
  const decimals = decimalsByMagnitude(abs)
  const rounded = bankersRound(value, decimals)
  return rounded.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })
}

export const computeToAmount = (
  fromAmount: string,
  rate: number | null,
): string => {
  if (!fromAmount || rate === null) {
    return ''
  }
  const parsed = Number(fromAmount)
  if (isNaN(parsed) || parsed <= 0) {
    return ''
  }
  return formatAmount(parsed * rate)
}

export const fetchTokenPrices = async (): Promise<TokenPrice[]> => {
  let res: Response
  try {
    res = await fetch('https://interview.switcheo.com/prices.json')
  } catch {
    throw new Error(t('swap.error_network'))
  }
  if (!res.ok) {
    throw new Error(t('swap.error_http', { status: res.status }))
  }
  return res.json() as Promise<TokenPrice[]>
}

export const simulateSwap = (delayMs = 1500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, delayMs))
}
