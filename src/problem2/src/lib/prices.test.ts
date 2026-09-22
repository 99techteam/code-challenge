import { describe, expect, it } from 'vitest';

import { exchangeRate, toTokens } from '@/lib/prices';

const FEED = [
  { currency: 'USDC', date: '2023-08-29T07:10:30.000Z', price: 1 },
  { currency: 'USDC', date: '2023-08-29T07:10:40.000Z', price: 0.9998 },
  { currency: 'ETH', date: '2023-08-29T07:10:52.000Z', price: 1645.93 },
  { currency: 'STATOM', date: '2023-08-29T07:10:45.000Z', price: 8.51 },
];

describe('toTokens', () => {
  it('keeps the newest quote when the feed repeats a currency', () => {
    const usdc = toTokens(FEED).find((token) => token.code === 'USDC');

    // The fixture's two USDC rows differ only by date; 0.9998 is the later one.
    expect(usdc?.price).toBe(0.9998);
  });

  it('drops rows that are missing or malformed rather than failing the load', () => {
    const codes = toTokens([
      ...FEED,
      { currency: 'BROKEN', date: '2023-08-29T07:10:40.000Z' },
      { currency: 'ZERO', date: '2023-08-29T07:10:40.000Z', price: 0 },
      { currency: '', date: '2023-08-29T07:10:40.000Z', price: 5 },
      'not an object',
    ]).map((token) => token.code);

    expect(codes).toEqual(['ETH', 'STATOM', 'USDC']);
  });

  it('returns nothing when the payload is not a list', () => {
    expect(toTokens({ currency: 'ETH' })).toEqual([]);
    expect(toTokens(null)).toEqual([]);
  });

  it('sorts by ticker so the asset menu has a stable order', () => {
    expect(toTokens(FEED).map((token) => token.code)).toEqual(['ETH', 'STATOM', 'USDC']);
  });

  it('carries the display name and precision for each asset', () => {
    const eth = toTokens(FEED).find((token) => token.code === 'ETH');

    expect(eth?.name).toBe('Ethereum');
    expect(eth?.decimals).toBe(5);
  });

  it('asks the icon repository for the casing it actually uses', () => {
    const tokens = toTokens(FEED);

    expect(tokens.find((token) => token.code === 'STATOM')?.iconUrl).toContain('/stATOM.svg');
    expect(tokens.find((token) => token.code === 'ETH')?.iconUrl).toContain('/ETH.svg');
  });
});

describe('exchangeRate', () => {
  it('quotes one asset in units of the other through their USD prices', () => {
    const tokens = toTokens(FEED);
    const eth = tokens.find((token) => token.code === 'ETH');
    const usdc = tokens.find((token) => token.code === 'USDC');
    if (!eth || !usdc) throw new Error('fixture is missing an asset');

    expect(exchangeRate(eth, usdc)).toBeCloseTo(1645.93 / 0.9998, 6);
    expect(exchangeRate(usdc, eth) * exchangeRate(eth, usdc)).toBeCloseTo(1, 12);
  });
});
