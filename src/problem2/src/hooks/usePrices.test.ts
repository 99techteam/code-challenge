import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePrices } from './usePrices';
import type { PriceRecord } from '../types';

const feed: PriceRecord[] = [
  { currency: 'ETH', price: 1645, date: '2023-08-29T07:10:52.000Z' },
  { currency: 'USDC', price: 1, date: '2023-08-29T07:10:30.000Z' },
];

function mockFetch(impl: () => Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn(impl));
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('usePrices', () => {
  beforeEach(() => vi.clearAllMocks());

  it('starts loading, then exposes the derived token list', async () => {
    mockFetch(async () => new Response(JSON.stringify(feed), { status: 200 }));

    const { result } = renderHook(() => usePrices());
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.tokens.map((t) => t.symbol)).toEqual(['ETH', 'USDC']);
    expect(result.current.priceOf('ETH')).toBe(1645);
    expect(result.current.priceOf('NOPE')).toBeUndefined();
  });

  it('surfaces an error when the request fails', async () => {
    mockFetch(async () => new Response('nope', { status: 500 }));

    const { result } = renderHook(() => usePrices());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toMatch(/500/);
    expect(result.current.tokens).toEqual([]);
  });

  it('surfaces an error when fetch rejects', async () => {
    mockFetch(async () => {
      throw new Error('network down');
    });

    const { result } = renderHook(() => usePrices());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('network down');
  });
});
