import { describe, it, expect } from 'vitest';
import {
  tokensFromPrices,
  formatAmount,
  formatUsd,
  iconUrl,
} from './tokens';
import type { PriceRecord } from '../types';

const rec = (
  currency: string,
  price: number,
  date = '2023-08-29T07:10:00.000Z',
): PriceRecord => ({ currency, price, date });

describe('tokensFromPrices', () => {
  it('maps a clean feed into sorted tokens', () => {
    const tokens = tokensFromPrices([rec('ETH', 1645), rec('ATOM', 7.2)]);
    expect(tokens.map((t) => t.symbol)).toEqual(['ATOM', 'ETH']); // alphabetical
    expect(tokens[1]).toMatchObject({ symbol: 'ETH', price: 1645 });
  });

  it('keeps the most recent record when a currency is duplicated', () => {
    const tokens = tokensFromPrices([
      rec('USD', 0.9, '2023-08-29T07:10:00.000Z'),
      rec('USD', 1.0, '2023-08-29T07:20:00.000Z'), // newer
    ]);
    expect(tokens).toHaveLength(1);
    expect(tokens[0].price).toBe(1.0);
  });

  it('does NOT overwrite on a timestamp tie (first record wins)', () => {
    // Mirrors the real BUSD pair in the feed, which share a timestamp.
    const sameDate = '2023-08-29T07:10:40.000Z';
    const tokens = tokensFromPrices([
      rec('BUSD', 0.999183113, sameDate),
      rec('BUSD', 0.9998782611186441, sameDate),
    ]);
    expect(tokens).toHaveLength(1);
    expect(tokens[0].price).toBe(0.999183113);
  });

  it('drops records priced at or below zero', () => {
    const tokens = tokensFromPrices([rec('A', 0), rec('B', -5), rec('C', 3)]);
    expect(tokens.map((t) => t.symbol)).toEqual(['C']);
  });

  it('ignores malformed records', () => {
    const dirty = [
      null,
      undefined,
      { currency: 'X' }, // no price
      { currency: 'Y', price: 'abc', date: '' },
      rec('OK', 2),
    ] as unknown as PriceRecord[];
    const tokens = tokensFromPrices(dirty);
    expect(tokens.map((t) => t.symbol)).toEqual(['OK']);
  });

  it('attaches an icon URL for each token', () => {
    const [eth] = tokensFromPrices([rec('ETH', 1645)]);
    expect(eth.icon).toBe(iconUrl('ETH'));
    expect(eth.icon).toMatch(/\/ETH\.svg$/);
  });

  it('returns an empty array for an empty feed', () => {
    expect(tokensFromPrices([])).toEqual([]);
  });
});

describe('formatAmount', () => {
  it('returns "0" for zero and non-finite values', () => {
    expect(formatAmount(0)).toBe('0');
    expect(formatAmount(NaN)).toBe('0');
    expect(formatAmount(Infinity)).toBe('0');
  });

  it('formats integers and decimals without noise', () => {
    expect(formatAmount(15)).toBe('15');
    expect(formatAmount(1234.5)).toBe('1,234.5');
  });

  it('keeps extra precision for sub-1 values', () => {
    expect(formatAmount(0.1234567)).toBe('0.1234567');
  });
});

describe('formatUsd', () => {
  it('formats a USD value with two decimals', () => {
    expect(formatUsd(1)).toBe('$1.00');
    expect(formatUsd(1645.9337)).toBe('$1,645.93');
  });

  it('falls back to $0.00 for non-finite values', () => {
    expect(formatUsd(NaN)).toBe('$0.00');
  });
});
