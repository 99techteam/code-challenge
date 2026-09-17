import { test } from 'node:test';
import assert from 'node:assert';
import {
  parseAmount,
  formatAmount,
  formatUsd,
  exchangeRate,
  dedupePrices,
} from './logic.js';

test('parseAmount accepts valid decimals', () => {
  assert.strictEqual(parseAmount('5'), 5);
  assert.strictEqual(parseAmount('5.5'), 5.5);
  assert.strictEqual(parseAmount('.5'), 0.5);
  assert.strictEqual(parseAmount('0'), 0);
  assert.strictEqual(parseAmount('1234.5678'), 1234.5678);
});

test('parseAmount rejects invalid input', () => {
  assert.strictEqual(parseAmount(''), null);
  assert.strictEqual(parseAmount('   '), null);
  assert.strictEqual(parseAmount('abc'), null);
  assert.strictEqual(parseAmount('1.2.3'), null);
  assert.strictEqual(parseAmount('1,000'), null);
  assert.strictEqual(parseAmount('NaN'), null);
  assert.strictEqual(parseAmount(undefined), null);
  assert.strictEqual(parseAmount(null), null);
});

test('formatAmount trims trailing zeros and caps at 8 decimals', () => {
  assert.strictEqual(formatAmount(0), '0');
  assert.strictEqual(formatAmount(15), '15');
  assert.strictEqual(formatAmount(1.5), '1.5');
  assert.strictEqual(formatAmount(1.00000000), '1');
  assert.strictEqual(formatAmount(1 / 3), '0.33333333');
  assert.strictEqual(formatAmount(null), '0');
  assert.strictEqual(formatAmount(NaN), '0');
});

test('formatUsd renders dollars and cents', () => {
  assert.strictEqual(formatUsd(0), '$0.00');
  assert.strictEqual(formatUsd(1000), '$1,000.00');
  assert.strictEqual(formatUsd(1645.937), '$1,645.94');
  assert.strictEqual(formatUsd(0.4), '$0.4');
  assert.strictEqual(formatUsd(null), '—');
});

test('exchangeRate divides prices and guards against zero', () => {
  assert.ok(Math.abs(exchangeRate(1645.93, 0.989832) - 1662.84) < 0.01);
  assert.strictEqual(exchangeRate(100, 100), 1);
  assert.strictEqual(exchangeRate(null, 1), null);
  assert.strictEqual(exchangeRate(1, null), null);
  assert.strictEqual(exchangeRate(1, 0), null);
});

test('dedupePrices keeps the newest price per currency', () => {
  const rows = [
    { currency: 'BTC', date: '2023-01-01T00:00:00Z', price: 100 },
    { currency: 'BTC', date: '2023-01-02T00:00:00Z', price: 200 },
    { currency: 'ETH', date: '2023-01-01T00:00:00Z', price: 10 },
  ];
  const prices = dedupePrices(rows);
  assert.strictEqual(prices.size, 2);
  assert.strictEqual(prices.get('BTC'), 200);
  assert.strictEqual(prices.get('ETH'), 10);
});
