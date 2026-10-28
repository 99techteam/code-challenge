import { test } from 'node:test';
import assert from 'node:assert';
import { FallbackPriceSource } from './FallbackPriceSource.ts';
import { StaticPriceSource } from './StaticPriceSource.ts';

const failing = { load: () => Promise.reject(new Error('offline')) };

test('StaticPriceSource serves its table as cached prices', async () => {
  const snapshot = await new StaticPriceSource({ USD: 1 }).load();
  assert.strictEqual(snapshot.origin, 'cached');
  assert.strictEqual(snapshot.prices.get('USD'), 1);
});

test('FallbackPriceSource prefers the primary source', async () => {
  const primary = { load: async () => ({ prices: new Map([['ETH', 2000]]), origin: 'live' as const }) };
  const snapshot = await new FallbackPriceSource(primary, new StaticPriceSource({ USD: 1 })).load();
  assert.strictEqual(snapshot.origin, 'live');
  assert.strictEqual(snapshot.prices.get('ETH'), 2000);
});

test('FallbackPriceSource falls back when the primary fails', async () => {
  const snapshot = await new FallbackPriceSource(failing, new StaticPriceSource({ USD: 1 })).load();
  assert.strictEqual(snapshot.origin, 'cached');
  assert.strictEqual(snapshot.prices.get('USD'), 1);
});
