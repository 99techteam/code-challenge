import { describe, expect, it } from 'vitest';

import { searchTokens } from '@/lib/tokens';
import type { Token } from '@/types';

const token = (code: string, name: string): Token => ({
  code,
  name,
  price: 1,
  decimals: 2,
  iconUrl: '',
});

const TOKENS = [
  token('BUSD', 'Binance USD'),
  token('ETH', 'Ethereum'),
  token('stATOM', 'Stride Staked ATOM'),
  token('USC', 'Carbon USD'),
  token('WBTC', 'Wrapped Bitcoin'),
];

const codesFor = (query: string) => searchTokens(TOKENS, query).map((match) => match.code);

describe('searchTokens', () => {
  it('returns everything for an empty search', () => {
    expect(searchTokens(TOKENS, '')).toEqual(TOKENS);
    expect(searchTokens(TOKENS, '   ')).toEqual(TOKENS);
  });

  it('matches a ticker whatever the casing', () => {
    expect(codesFor('statom')).toEqual(['stATOM']);
    expect(codesFor('WbTc')).toEqual(['WBTC']);
  });

  it('matches the long name too, so an asset is findable without its ticker', () => {
    expect(codesFor('bitcoin')).toEqual(['WBTC']);
    expect(codesFor('stride')).toEqual(['stATOM']);
  });

  it('matches anywhere in the string, not just the start', () => {
    // BUSD matches on both ticker and name, USC only on "Carbon USD".
    expect(codesFor('usd')).toEqual(['BUSD', 'USC']);
  });

  it('ignores surrounding whitespace', () => {
    expect(codesFor('  eth ')).toEqual(['ETH']);
  });

  it('returns nothing when no asset matches', () => {
    expect(codesFor('dogecoin')).toEqual([]);
  });
});
