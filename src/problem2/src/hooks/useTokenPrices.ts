import { useState, useEffect, useCallback } from 'react';

export interface TokenPrice {
  currency: string;
  price: number;
}

export function useTokenPrices() {
  const [tokens, setTokens] = useState<TokenPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('https://interview.switcheo.com/prices.json')
      .then(res => res.json())
      .then(data => {
        const tokenMap = new Map<string, number>();
        data.forEach((item: any) => {
          if (item.price && !tokenMap.has(item.currency)) {
            tokenMap.set(item.currency, item.price);
          }
        });
        const parsedTokens = Array.from(tokenMap.entries())
          .map(([currency, price]) => ({ currency, price }))
          .sort((a, b) => a.currency.localeCompare(b.currency));
        
        setTokens(parsedTokens);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch prices", err);
        setIsLoading(false);
        setError("Failed to load live exchange rates. Please try again later.");
      });
  }, []);

  const getPrice = useCallback((currency: string) => {
    return tokens.find(t => t.currency === currency)?.price || 0;
  }, [tokens]);

  return { tokens, isLoading, error, getPrice };
}
