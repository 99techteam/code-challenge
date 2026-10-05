import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  selectBalances,
  getUsdValue,
  formatAmount,
  type WalletBalance,
} from './balances';
import { WalletPage } from './WalletPage';

const balance = (
  id: string,
  blockchain: string,
  amount = 1,
): WalletBalance => ({
  id,
  blockchain,
  currency: 'TOKEN',
  amount,
});

describe('balance selection', () => {
  it('filters unsupported chains and nonpositive/nonfinite amounts', () => {
    const input = [
      balance('valid', 'Ethereum'),
      balance('unknown', 'Unknown'),
      balance('zero', 'Ethereum', 0),
      balance('negative', 'Osmosis', -1),
      balance('nan', 'Neo', NaN),
      balance('infinite', 'Neo', Infinity),
    ];
    expect(selectBalances(input).map((row) => row.id)).toEqual(['valid']);
  });

  it('sorts descending, preserves tied input order and does not mutate input', () => {
    const input = Object.freeze([
      Object.freeze(balance('neo', 'Neo')),
      Object.freeze(balance('eth', 'Ethereum')),
      Object.freeze(balance('zil', 'Zilliqa')),
      Object.freeze(balance('osmo', 'Osmosis')),
      Object.freeze(balance('arb', 'Arbitrum')),
    ]);
    expect(selectBalances(input).map((row) => row.id)).toEqual([
      'osmo',
      'eth',
      'arb',
      'neo',
      'zil',
    ]);
    expect(input.map((row) => row.id)).toEqual([
      'neo',
      'eth',
      'zil',
      'osmo',
      'arb',
    ]);
    expect(selectBalances([])).toEqual([]);
  });
});

describe('display values', () => {
  it('preserves fractional and small nonzero amounts in display', () => {
    expect(formatAmount(0.49)).toBe('0.49');
    expect(formatAmount(0.00000000123)).toBe('0.00000000123');
  });

  it('distinguishes missing or invalid prices from a legitimate zero price', () => {
    expect(getUsdValue(2, 10)).toBe(20);
    expect(getUsdValue(2, 0)).toBe(0);
    for (const price of [undefined, NaN, Infinity, -1]) {
      expect(getUsdValue(2, price)).toBeNull();
    }
    expect(getUsdValue(Number.MAX_VALUE, 2)).toBeNull();
  });
});

describe('WalletPage rendering', () => {
  it('renders fractional amounts, missing prices, children and div attributes', () => {
    const html = renderToStaticMarkup(
      <WalletPage
        balances={[balance('eth', 'Ethereum', 0.49)]}
        prices={{}}
        id="wallet"
      >
        <p>Wallet details</p>
      </WalletPage>,
    );
    expect(html).toContain('id="wallet"');
    expect(html).toContain('0.49');
    expect(html).toContain('Price unavailable');
    expect(html).toContain('Wallet details');
  });

  it('renders a USD valuation and an empty state', () => {
    expect(
      renderToStaticMarkup(
        <WalletPage
          balances={[balance('eth', 'Ethereum', 2)]}
          prices={{ TOKEN: 10 }}
        />,
      ),
    ).toContain('$20.00');
    expect(
      renderToStaticMarkup(<WalletPage balances={[]} prices={{}} />),
    ).toContain('No supported positive balances.');
  });
});
