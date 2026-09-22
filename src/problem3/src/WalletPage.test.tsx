import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  toVisibleBalances,
  usdValueOf,
  WalletPage,
  type Prices,
  type WalletBalance,
  type WalletRowProps,
} from './WalletPage';

function balance(currency: string, blockchain: string, amount = 1): WalletBalance {
  return { currency, blockchain, amount };
}

function currencies(balances: readonly WalletBalance[]): string[] {
  return balances.map((b) => b.currency);
}

describe('toVisibleBalances', () => {
  it('lists only positive balances on listed chains', () => {
    const visible = toVisibleBalances([
      balance('ETH', 'Ethereum', 2),
      balance('ARB', 'Arbitrum', 0),
      balance('OSMO', 'Osmosis', -1),
      balance('SOL', 'Solana', 10),
    ]);

    expect(currencies(visible)).toEqual(['ETH']);
  });

  it('puts the highest-priority chain first', () => {
    const visible = toVisibleBalances([
      balance('ZIL', 'Zilliqa'),
      balance('ARB', 'Arbitrum'),
      balance('ETH', 'Ethereum'),
      balance('OSMO', 'Osmosis'),
    ]);

    expect(currencies(visible)).toEqual(['OSMO', 'ETH', 'ARB', 'ZIL']);
  });

  it('keeps the incoming order between equally ranked chains', () => {
    const zil = balance('ZIL', 'Zilliqa');
    const neo = balance('NEO', 'Neo');

    expect(currencies(toVisibleBalances([zil, neo]))).toEqual(['ZIL', 'NEO']);
    expect(currencies(toVisibleBalances([neo, zil]))).toEqual(['NEO', 'ZIL']);
  });

  it('keeps fractions and groups thousands', () => {
    const formatted = toVisibleBalances([
      balance('ETH', 'Ethereum', 1234567.891),
      balance('ETH', 'Ethereum', 0.5), // toFixed() showed this as "1"
      balance('ETH', 'Ethereum', 0.1234567),
    ]).map((b) => b.formatted);

    expect(formatted).toEqual(['1,234,567.891', '0.5', '0.123457']);
  });

  it('leaves the list it was given untouched', () => {
    const balances = Object.freeze([balance('ETH', 'Ethereum'), balance('OSMO', 'Osmosis')]);

    expect(currencies(toVisibleBalances(balances))).toEqual(['OSMO', 'ETH']);
    expect(currencies(balances)).toEqual(['ETH', 'OSMO']);
  });
});

describe('usdValueOf', () => {
  it('is the amount times the price', () => {
    expect(usdValueOf(balance('ETH', 'Ethereum', 2), { ETH: 1500 })).toBe(3000);
  });

  it('is undefined, not NaN, when the currency has no price', () => {
    expect(usdValueOf(balance('NEO', 'Neo', 2), { ETH: 1500 })).toBeUndefined();
  });
});

describe('WalletPage', () => {
  // What the declared hooks return. Each test adjusts it before rendering.
  const wallet: { balances: WalletBalance[]; prices: Prices } = { balances: [], prices: {} };

  // Props each row received, in render order — the declared WalletRow is the
  // page's only output, so this is what the page decided.
  let rows: WalletRowProps[] = [];

  function WalletRow(props: WalletRowProps) {
    rows.push(props);
    return <div role="group" aria-label={props.currency} />;
  }

  // The latest props for a currency — a rerender appends a fresh set.
  function rowFor(currency: string) {
    return rows.filter((row) => row.currency === currency).at(-1);
  }

  function rowNames() {
    return screen.getAllByRole('group').map((row) => row.getAttribute('aria-label'));
  }

  const eth = balance('ETH', 'Ethereum', 1.5);
  const osmo = balance('OSMO', 'Osmosis', 200);
  const neo = balance('NEO', 'Neo', 3);
  const emptyArb = balance('ARB', 'Arbitrum', 0);

  // The page reads these from the app around it; stand them in for each test.
  beforeEach(() => {
    wallet.balances = [eth, osmo, neo, emptyArb];
    wallet.prices = { ETH: 2000, OSMO: 0.5 };
    rows = [];
    vi.stubGlobal('useWalletBalances', () => wallet.balances);
    vi.stubGlobal('usePrices', () => wallet.prices);
    vi.stubGlobal('WalletRow', WalletRow);
    vi.stubGlobal('classes', { row: 'wallet-row' });
  });

  it('lists positive balances by chain priority, with amount and USD value', () => {
    render(<WalletPage />);

    expect(rowNames()).toEqual(['OSMO', 'ETH', 'NEO']);
    expect(rowFor('ETH')).toEqual({
      className: 'wallet-row',
      currency: 'ETH',
      amount: 1.5,
      formattedAmount: '1.5',
      usdValue: 3000,
    });
  });

  it('passes no USD value, not NaN, when a currency has no price', () => {
    render(<WalletPage />);

    expect(rowFor('NEO')?.usdValue).toBeUndefined();
  });

  it('does not filter and sort again when only prices change', () => {
    const filterAndSort = vi.spyOn(wallet.balances, 'flatMap');
    const { rerender } = render(<WalletPage />);

    wallet.prices = { ...wallet.prices, ETH: 3000 };
    rerender(<WalletPage />);

    expect(rowFor('ETH')?.usdValue).toBe(4500);
    expect(filterAndSort).toHaveBeenCalledTimes(1);
  });

  it('keeps each row on its balance when the order changes', () => {
    wallet.balances = [eth];
    const { rerender } = render(<WalletPage />);
    const ethRow = screen.getByRole('group', { name: 'ETH' });

    wallet.balances = [eth, osmo]; // OSMO outranks ETH and takes the first slot
    rerender(<WalletPage />);

    expect(rowNames()).toEqual(['OSMO', 'ETH']);
    expect(screen.getByRole('group', { name: 'ETH' })).toBe(ethRow);
  });
});
