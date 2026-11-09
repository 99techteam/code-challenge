import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { getPriority, getUsdValue, sortBalances, type WalletBalance } from './balances';
import { WalletPage } from './WalletPage';

const balance = (id: string, blockchain: string, amount = 1): WalletBalance => ({ id, blockchain, amount, currency: 'ETH' });

test('filters unsupported chains and nonpositive or nonfinite balances', () => {
  expect(sortBalances([
    balance('valid', 'Ethereum'), balance('unknown', 'Bitcoin'), balance('zero', 'Neo', 0),
    balance('negative', 'Neo', -1), balance('nan', 'Neo', NaN), balance('infinite', 'Neo', Infinity),
    balance('prototype', 'toString'),
  ]).map(b => b.id)).toEqual(['valid']);
  expect(getPriority('toString')).toBe(-99);
});

test('orders by descending chain priority, preserves ties and never mutates input', () => {
  const balances = Object.freeze([
    balance('neo', 'Neo'), balance('eth', 'Ethereum'), balance('osmo', 'Osmosis'),
    balance('arb', 'Arbitrum'), balance('zil', 'Zilliqa'),
  ].map(b => Object.freeze(b)));
  expect(sortBalances(balances).map(b => b.id)).toEqual(['osmo', 'eth', 'arb', 'neo', 'zil']);
  expect(balances.map(b => b.id)).toEqual(['neo', 'eth', 'osmo', 'arb', 'zil']);
});

test('distinguishes missing prices from a genuine zero price', () => {
  const b = balance('eth', 'Ethereum', 2);
  expect(getUsdValue(b, { ETH: 1600 })).toBe(3200);
  expect(getUsdValue(b, { ETH: 0 })).toBe(0);
  for (const prices of [{}, { ETH: NaN }, { ETH: -1 }, { ETH: Infinity }, { ETH: Number.MAX_VALUE }]) {
    expect(getUsdValue(b, prices)).toBeNull();
  }
});

test('renders formatted amounts, price changes, attributes and children', () => {
  const balances = [balance('eth', 'Ethereum', 1.25)];
  const html = renderToStaticMarkup(<WalletPage balances={balances} prices={{ ETH: 10 }} data-testid="wallet"><p>Footer</p></WalletPage>);
  expect(html).toContain('1.25');
  expect(html).toContain('$12.50');
  expect(html).toContain('data-testid="wallet"');
  expect(html).toContain('Footer');
  expect(renderToStaticMarkup(<WalletPage balances={balances} prices={{ ETH: 20 }} />)).toContain('$25.00');
  expect(renderToStaticMarkup(<WalletPage balances={balances} prices={{}} />)).toContain('Price unavailable');
  expect(renderToStaticMarkup(<WalletPage balances={[]} prices={{}} />)).toContain('No supported balances.');
});
