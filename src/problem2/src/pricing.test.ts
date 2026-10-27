import { describe, expect, it } from 'vitest';
import { normalizePrices, parseAmount, quote } from './pricing';
describe('pricing', () => {
  it('uses the newest valid price and discards unusable rows', () => {
    expect(normalizePrices([
      { currency: 'A', price: 2, date: '2023-01-01' },
      { currency: 'A', price: 4, date: '2023-01-02' },
      { currency: 'B', price: 1, date: '2023-01-01' },
      { currency: 'C', price: 0, date: '2023-01-01' }
    ])).toEqual([{ currency: 'A', price: 4, date: '2023-01-02' }, { currency: 'B', price: 1, date: '2023-01-01' }]);
  });
  it('calculates in the correct direction', () => {
    const a = { currency: 'A', price: 2000, date: '2023-01-01' };
    const b = { currency: 'B', price: 2, date: '2023-01-01' };
    expect(quote(3, a, b)).toBe(3000);
    expect(quote(3, b, a)).toBe(0.003);
  });
  it('rejects non-positive and malformed amounts', () => {
    for (const input of ['', '0', '-1', '1e9', '1,000', 'abc']) expect(parseAmount(input)).toBeNull();
    expect(parseAmount('.25')).toBe(0.25);
  });
});
