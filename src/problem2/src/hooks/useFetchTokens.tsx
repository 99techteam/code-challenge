import { useEffect, useState } from 'react';

type Token = {
  currency: string;
  price: number;
};

export const useTokens = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        const res = await fetch('https://interview.switcheo.com/prices.json');
        if (!res.ok) {
          throw new Error('Failed to fetch token data');
        }
        const data: Token[] = await res.json();
        const deduped = Array.from(new Map(data.map(t => [t.currency, t])).values());
        setTokens(deduped);
      } catch (err: any) {
        setError(err.message || 'Unexpected error');
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  return { tokens, loading, error };
};
