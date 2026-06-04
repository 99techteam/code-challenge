import { useState, useEffect, useCallback } from 'react';
import type { Token } from '../types';

const SWITCHEO_PRICE_API = 'https://switcheo.org/price.json';

const TOKEN_ICONS_BASE = 'https://raw.githubusercontent.com/switcheo/token-icons/main/tokens';

const DEFAULT_BALANCES: Record<string, number> = {
  'ETH': 10.5,
  'BTC': 2.3,
  'USDT': 50000,
  'USDC': 50000,
  'BNB': 150,
  'SOL': 250,
  'XRP': 10000,
  'ADA': 50000,
  'DOGE': 100000,
  'DOT': 5000,
  'AVAX': 500,
  'MATIC': 25000,
  'LINK': 2000,
  'UNI': 5000,
  'AAVE': 500,
  'MKR': 50,
  'CRV': 50000,
  'SUSHI': 25000,
  'YFI': 10,
  'SNX': 5000,
};

export function useTokens() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        const response = await fetch(SWITCHEO_PRICE_API);
        if (!response.ok) {
          throw new Error('Failed to fetch token prices');
        }
        const data = await response.json();

        const tokenList: Token[] = Object.entries(data)
          .filter(([_, tokenData]: [string, any]) => {
            return tokenData?.prices?.usd?.price && tokenData.prices.usd.price > 0;
          })
          .map(([symbol, tokenData]: [string, any]) => ({
            symbol: symbol.toUpperCase(),
            name: tokenData.name || symbol,
            decimals: tokenData.decimals || 18,
            price: tokenData.prices.usd.price,
            icon: `${TOKEN_ICONS_BASE}/${symbol.toUpperCase()}.svg`,
          }))
          .filter((token) => {
            return DEFAULT_BALANCES[token.symbol] !== undefined;
          })
          .sort((a, b) => (b.price || 0) * DEFAULT_BALANCES[b.symbol] - (a.price || 0) * DEFAULT_BALANCES[a.symbol]);

        setTokens(tokenList);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tokens');
        setTokens(getFallbackTokens());
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  const getFallbackTokens = useCallback((): Token[] => {
    const fallbackData = [
      { symbol: 'ETH', name: 'Ethereum', price: 3500 },
      { symbol: 'BTC', name: 'Bitcoin', price: 65000 },
      { symbol: 'USDT', name: 'Tether', price: 1 },
      { symbol: 'USDC', name: 'USD Coin', price: 1 },
      { symbol: 'BNB', name: 'BNB', price: 600 },
      { symbol: 'SOL', name: 'Solana', price: 150 },
      { symbol: 'XRP', name: 'Ripple', price: 0.5 },
      { symbol: 'ADA', name: 'Cardano', price: 0.45 },
      { symbol: 'DOGE', name: 'Dogecoin', price: 0.12 },
      { symbol: 'DOT', name: 'Polkadot', price: 7 },
    ];

    return fallbackData.map((t) => ({
      symbol: t.symbol,
      name: t.name,
      decimals: 18,
      price: t.price,
      icon: `${TOKEN_ICONS_BASE}/${t.symbol}.svg`,
    }));
  }, []);

  return { tokens, loading, error };
}

export function useBalances() {
  const [balances, setBalances] = useState<Record<string, number>>(DEFAULT_BALANCES);

  const getBalance = useCallback(
    (symbol: string): number => {
      return balances[symbol] || 0;
    },
    [balances]
  );

  const updateBalance = useCallback((symbol: string, amount: number) => {
    setBalances((prev) => ({
      ...prev,
      [symbol]: prev[symbol] ? prev[symbol] + amount : amount,
    }));
  }, []);

  return { balances, getBalance, updateBalance };
}
