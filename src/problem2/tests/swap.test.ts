import { describe, it, expect } from 'vitest';
import {
  normalizePrices,
  validateAmount,
  getQuote,
  formatAmount,
  validatePair,
} from '../swap';

describe('price normalization', () => {
  it('selects newest records and uses last record on a timestamp tie', () => {
    const rows = [
      { currency: 'ETH', price: 1600, date: '2023-08-29' },
      { currency: 'USDC', price: 1, date: '2023-08-29' },
      { currency: 'ETH', price: 1500, date: '2023-08-28' },
      { currency: 'USDC', price: 0.99, date: '2023-08-29' },
      { currency: 'BAD', price: 0, date: '2023-08-29' },
      { currency: 'MISSING', date: '2023-08-29' },
      { currency: 'NAN', price: NaN, date: '2023-08-29' },
      { currency: '<script>', price: 1, date: '2023-08-29' },
      { currency: 'NULL', price: 1, date: 'bad' },
    ];
    expect(
      normalizePrices(rows).map(({ currency, price }) => [currency, price]),
    ).toEqual([
      ['ETH', 1600],
      ['USDC', 0.99],
    ]);
  });
  it('rejects unusable payloads', () => {
    expect(() => normalizePrices({})).toThrow();
    expect(() => normalizePrices([])).toThrow();
  });
});

describe('amounts and quotes', () => {
  it.each([
    '-1',
    '0',
    'abc',
    '1e3',
    'Infinity',
    '1,000',
    '1000000000001',
    '0.1234567890123456789',
  ])('rejects %s', (value) => {
    expect(validateAmount(value)).not.toBe('');
    expect(getQuote(value, { price: 1 }, { price: 2 })).toBeNull();
  });
  it.each(['1', '1.', '.5', '0.000000000000000001', '1000000000000'])(
    'accepts %s',
    (value) => expect(validateAmount(value)).toBe(''),
  );
  it('uses decimal arithmetic without binary rounding errors', () => {
    expect(getQuote('0.1', { price: 0.2 }, { price: 0.1 })?.toString()).toBe(
      '0.2',
    );
    expect(getQuote('2', { price: 1600 }, { price: 1 })?.toString()).toBe(
      '3200',
    );
  });
  it('does not display small positive results as zero', () => {
    expect(formatAmount('0.00000000123')).toBe('0.00000000123');
    expect(formatAmount('1.250000')).toBe('1.25');
  });
  it('groups large values and keeps six significant digits below one', () => {
    expect(formatAmount('1234.56')).toBe('1,234.56');
    expect(formatAmount('0.123456789')).toBe('0.123456');
    expect(formatAmount('1.500000')).toBe('1.5');
    expect(formatAmount('1')).toBe('1');
    expect(formatAmount('1e-20')).toBe('< 0.000000000000000001');
  });
  it('rejects identical pairs and zero price denominators', () => {
    const token = {
      currency: 'ETH',
      name: 'Ethereum',
      price: 100,
      date: '2023-08-29',
    };
    expect(validatePair(token, token)).toBe(
      'Choose two different tokens to swap.',
    );
    expect(getQuote('1', { price: 100 }, { price: 0 })).toBeNull();
  });
});
