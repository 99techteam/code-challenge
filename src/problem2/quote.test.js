import { describe, expect, test } from 'bun:test';
import { formatAmount, loadPrices, normalizePrices, quote } from './quote.js';

const token = (currency, price, date = '2023-08-29T07:10:40Z') => ({ currency, price, date });
const eth = token('ETH', 1600);
const usd = token('USD', 1);

describe('price feed', () => {
  test('deduplicates by timestamp, not response order; ties use the last record', () => {
    expect(normalizePrices([
      token('USD', 0.9, '2023-08-30T00:00:00Z'), usd,
      token('USD', 0.95, '2023-08-30T00:00:00Z'), eth,
    ])).toEqual([eth, token('USD', 0.95, '2023-08-30T00:00:00Z')]);
  });
  test('ignores malformed and unpriced tokens', () => {
    expect(normalizePrices([null, {}, token('BAD', 0), token('BAD', Infinity), token('../BAD', 1), token('BAD', 1, 'invalid'), usd, eth])).toEqual([eth, usd]);
  });
  test('rejects invalid or insufficient feeds', () => {
    for (const data of [null, {}, [], [usd]]) expect(() => normalizePrices(data)).toThrow();
  });
  test('loads the provided endpoint and handles network, HTTP and JSON failures', async () => {
    expect(await loadPrices(async () => Response.json([usd, eth]))).toEqual([eth, usd]);
    await expect(loadPrices(async () => new Response('', { status: 503 }))).rejects.toThrow();
    await expect(loadPrices(async () => new Response('not json'))).rejects.toThrow();
    await expect(loadPrices(async () => { throw new Error('offline'); })).rejects.toThrow('offline');
  });
});

describe('quotes', () => {
  test('converts in both directions and accepts decimal notation', () => {
    expect(quote('2.5', eth, usd)).toBe(4000);
    expect(quote('4000', usd, eth)).toBe(2.5);
    expect(quote(' .5 ', eth, usd)).toBe(800);
  });
  test('rejects invalid amounts, equal tokens, missing prices and overflow', () => {
    for (const amount of ['', ' ', '0', '-1', '1e3', '1,000', '0x10', 'NaN', 'Infinity', '1.2.3']) {
      expect(() => quote(amount, eth, usd)).toThrow();
    }
    expect(() => quote('1', eth, eth)).toThrow('different tokens');
    expect(() => quote('1', eth, undefined)).toThrow();
    expect(() => quote('1', eth, token('USD', 0))).toThrow();
    expect(() => quote('9'.repeat(309), eth, usd)).toThrow();
    expect(() => quote('1', token('A', Number.MAX_VALUE), token('B', Number.MIN_VALUE))).toThrow();
  });
  test('keeps tiny nonzero amounts visible', () => {
    expect(formatAmount(0.000000000001)).not.toBe('0');
  });
});
