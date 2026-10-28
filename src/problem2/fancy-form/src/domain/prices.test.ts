import { test } from 'node:test';
import assert from 'node:assert';
import { dedupePrices, exchangeRate, isPriceRow, quoteSwap } from './prices.ts';

test('exchangeRate divides prices and guards against zero', () => {
  assert.ok(Math.abs((exchangeRate(1645.93, 0.989832) ?? 0) - 1662.84) < 0.01);
  assert.strictEqual(exchangeRate(100, 100), 1);
  assert.strictEqual(exchangeRate(null, 1), null);
  assert.strictEqual(exchangeRate(1, undefined), null);
  assert.strictEqual(exchangeRate(1, 0), null);
});

test('dedupePrices keeps the newest price per currency', () => {
  const prices = dedupePrices([
    { currency: 'BTC', date: '2023-01-01T00:00:00Z', price: 100 },
    { currency: 'BTC', date: '2023-01-02T00:00:00Z', price: 200 },
    { currency: 'ETH', date: '2023-01-01T00:00:00Z', price: 10 },
  ]);
  assert.strictEqual(prices.size, 2);
  assert.strictEqual(prices.get('BTC'), 200);
  assert.strictEqual(prices.get('ETH'), 10);
});

test('isPriceRow rejects malformed rows', () => {
  assert.ok(isPriceRow({ currency: 'ETH', date: '2023-01-01', price: 1 }));
  assert.ok(!isPriceRow(null));
  assert.ok(!isPriceRow({ currency: 'ETH', date: '2023-01-01', price: '1' }));
  assert.ok(!isPriceRow({ currency: 'ETH', price: 1 }));
  assert.ok(!isPriceRow({ currency: 'ETH', date: '2023-01-01', price: Infinity }));
});

test('quoteSwap prices both legs in USD', () => {
  const prices = new Map([
    ['ETH', 2000],
    ['USDC', 0.5],
  ]);
  assert.deepStrictEqual(quoteSwap(prices, 'ETH', 'USDC', 2), {
    rate: 4000,
    amountIn: 2,
    amountOut: 8000,
    usdIn: 4000,
    usdOut: 4000,
  });
  assert.strictEqual(quoteSwap(prices, 'ETH', 'BTC', 1), null);
});
