import { describe, expect, it } from 'vitest'
import {
  bankersRound,
  formatAmount,
  computeRate,
  computeToAmount,
  normalizeTokenPrices,
} from './logic'
import type { TokenInfo, TokenPrice } from './types'

// ── bankersRound ──────────────────────────────────────────────────────────────
describe('bankersRound', () => {
  it('rounds a typical value to the specified decimal places', () => {
    expect(bankersRound(1.2345, 2)).toBe(1.23)
  })

  it('rounds an exactly halfway value down when the floor digit is even', () => {
    // floor digit is 2 (even) → round down: 2.5 → 2
    expect(bankersRound(2.5, 0)).toBe(2)
  })

  it('rounds an exactly halfway value up when the floor digit is odd', () => {
    // floor digit is 3 (odd) → round up: 3.5 → 4
    expect(bankersRound(3.5, 0)).toBe(4)
  })

  it('rounds a halfway value at decimal precision with even floor digit down', () => {
    // 2.45 at 1dp: floor digit at that position is 4 (even) → 2.4
    expect(bankersRound(2.45, 1)).toBe(2.4)
  })

  it('rounds a halfway value at decimal precision with odd floor digit up', () => {
    // 2.35 at 1dp: floor digit at that position is 3 (odd) → 2.4
    expect(bankersRound(2.35, 1)).toBe(2.4)
  })

  it('returns zero unchanged', () => {
    expect(bankersRound(0, 4)).toBe(0)
  })

  it('handles zero decimal places', () => {
    expect(bankersRound(7.3, 0)).toBe(7)
    expect(bankersRound(7.7, 0)).toBe(8)
  })

  it('handles a large number with high decimal precision', () => {
    expect(bankersRound(123456.123456, 2)).toBe(123456.12)
  })

  it('handles a very small number near zero', () => {
    expect(bankersRound(0.000001234, 8)).toBe(0.00000123)
  })
})

// ── formatAmount ──────────────────────────────────────────────────────────────
describe('formatAmount', () => {
  it('formats a typical medium-range value with 6 decimal places', () => {
    expect(formatAmount(12.3456789)).toBe('12.345679')
  })

  it('returns 0 for a zero value', () => {
    expect(formatAmount(0)).toBe('0')
  })

  it('formats a large value (above 100 000) with 2 decimal places', () => {
    expect(formatAmount(150000.5678)).toBe('150,000.57')
  })

  it('formats a value in the thousands range with 4 decimal places', () => {
    expect(formatAmount(1234.56789)).toBe('1,234.5679')
  })

  it('formats a small value below 1 with 8 decimal places', () => {
    expect(formatAmount(0.123456789)).toBe('0.12345679')
  })

  it('formats a very small value below 0.0001 with extended precision', () => {
    const result = formatAmount(0.00000123)
    // should preserve at least 5 significant digits past the leading zeros
    expect(result).toBe('0.00000123')
  })

  it('adds a thousands separator for large values', () => {
    expect(formatAmount(1000000)).toBe('1,000,000')
  })

  it('applies banker\'s rounding, not plain round-half-up', () => {
    // 2.5 rounds to 2 (even), not 3
    expect(bankersRound(2.5, 0)).toBe(2)
    // 3.5 rounds to 4 (even), not 3
    expect(bankersRound(3.5, 0)).toBe(4)
  })
})

// ── computeRate ───────────────────────────────────────────────────────────────
const makeToken = (symbol: string, price: number): TokenInfo => ({
  symbol,
  price,
  imageUrl: `https://example.com/${symbol}.svg`,
})

describe('computeRate', () => {
  it('returns the correct rate between two tokens', () => {
    const eth = makeToken('ETH', 2000)
    const usdt = makeToken('USDT', 1)
    // 1 ETH = 2000 USDT
    expect(computeRate(eth, usdt)).toBe(2000)
  })

  it('returns the inverse rate when token order is reversed', () => {
    const eth = makeToken('ETH', 2000)
    const usdt = makeToken('USDT', 1)
    // 1 USDT = 0.0005 ETH
    expect(computeRate(usdt, eth)).toBe(0.0005)
  })

  it('returns 1 when both tokens have the same price', () => {
    const a = makeToken('A', 500)
    const b = makeToken('B', 500)
    expect(computeRate(a, b)).toBe(1)
  })

  it('returns null when the from token is undefined', () => {
    const usdt = makeToken('USDT', 1)
    expect(computeRate(undefined, usdt)).toBeNull()
  })

  it('returns null when the to token is undefined', () => {
    const eth = makeToken('ETH', 2000)
    expect(computeRate(eth, undefined)).toBeNull()
  })

  it('returns null when both tokens are undefined', () => {
    expect(computeRate(undefined, undefined)).toBeNull()
  })

  it('returns null when the from token has a zero price', () => {
    const broken = makeToken('BROKEN', 0)
    const usdt = makeToken('USDT', 1)
    expect(computeRate(broken, usdt)).toBeNull()
  })

  it('returns null when the to token has a zero price', () => {
    const eth = makeToken('ETH', 2000)
    const broken = makeToken('BROKEN', 0)
    expect(computeRate(eth, broken)).toBeNull()
  })
})

// ── computeToAmount ───────────────────────────────────────────────────────────
describe('computeToAmount', () => {
  it('returns the correctly formatted output for a typical conversion', () => {
    // 10 ETH at rate 2000 = 20 000 USDT → large value, 4 dp
    const result = computeToAmount('10', 2000)
    expect(result).toBe('20,000')
  })

  it('returns an empty string when fromAmount is empty', () => {
    expect(computeToAmount('', 2000)).toBe('')
  })

  it('returns an empty string when rate is null', () => {
    expect(computeToAmount('10', null)).toBe('')
  })

  it('returns an empty string when fromAmount is zero', () => {
    expect(computeToAmount('0', 2000)).toBe('')
  })

  it('returns an empty string when fromAmount is negative', () => {
    expect(computeToAmount('-5', 2000)).toBe('')
  })

  it('returns an empty string when fromAmount is not a number', () => {
    expect(computeToAmount('abc', 2000)).toBe('')
  })

  it('handles a fractional fromAmount', () => {
    // 0.5 ETH at rate 2000 = 1000 USDT
    expect(computeToAmount('0.5', 2000)).toBe('1,000')
  })

  it('handles a rate that produces a very small result', () => {
    // 1 USDT at rate 0.0005 = 0.0005 ETH → small value, 8 dp
    const result = computeToAmount('1', 0.0005)
    expect(result).toBe('0.0005')
  })

  it('handles a minimum fromAmount of 0.000001', () => {
    const result = computeToAmount('0.000001', 1)
    expect(result).not.toBe('')
  })
})

// ── normalizeTokenPrices ──────────────────────────────────────────────────────
describe('normalizeTokenPrices', () => {
  const makeRaw = (
    currency: string,
    price: number,
    date = '2024-01-01T00:00:00Z',
  ): TokenPrice => ({ currency, price, date })

  it('returns a token list sorted alphabetically by symbol', () => {
    const raw = [makeRaw('USDT', 1), makeRaw('ETH', 2000), makeRaw('BTC', 50000)]
    const result = normalizeTokenPrices(raw)
    const symbols = result.map((t) => t.symbol)
    expect(symbols).toEqual(['BTC', 'ETH', 'USDT'])
  })

  it('filters out entries with a zero price', () => {
    const raw = [makeRaw('ETH', 2000), makeRaw('BROKEN', 0)]
    const result = normalizeTokenPrices(raw)
    expect(result.map((t) => t.symbol)).toEqual(['ETH'])
  })

  it('filters out entries with a negative price', () => {
    const raw = [makeRaw('ETH', 2000), makeRaw('NEG', -1)]
    const result = normalizeTokenPrices(raw)
    expect(result.map((t) => t.symbol)).toEqual(['ETH'])
  })

  it('deduplicates by keeping the entry with the most recent date', () => {
    const raw = [
      makeRaw('ETH', 1800, '2024-01-01T00:00:00Z'),
      makeRaw('ETH', 2000, '2024-06-01T00:00:00Z'),
      makeRaw('ETH', 1900, '2024-03-01T00:00:00Z'),
    ]
    const result = normalizeTokenPrices(raw)
    expect(result).toHaveLength(1)
    expect(result[0].price).toBe(2000)
  })

  it('returns an empty array when input is empty', () => {
    expect(normalizeTokenPrices([])).toEqual([])
  })

  it('returns an empty array when all entries have invalid prices', () => {
    const raw = [makeRaw('A', 0), makeRaw('B', -5)]
    expect(normalizeTokenPrices(raw)).toEqual([])
  })

  it('builds the correct image URL for each token', () => {
    const raw = [makeRaw('ETH', 2000)]
    const result = normalizeTokenPrices(raw)
    expect(result[0].imageUrl).toBe(
      'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/ETH.svg',
    )
  })

  it('handles a single valid entry without error', () => {
    const raw = [makeRaw('BTC', 50000)]
    const result = normalizeTokenPrices(raw)
    expect(result).toHaveLength(1)
    expect(result[0].symbol).toBe('BTC')
    expect(result[0].price).toBe(50000)
  })
})
