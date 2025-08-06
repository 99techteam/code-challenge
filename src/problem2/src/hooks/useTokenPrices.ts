import { useState, useEffect } from 'react';
import type { Token, EnrichedToken } from '@/types/swap';
import { DEFAULT_DECIMALS } from '@/lib/precision';

const PRICES_API_URL = 'https://interview.switcheo.com/prices.json';
const TOKEN_ICONS_BASE_URL = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

const SPECIAL_CASES: Record<string, string> = {
  'RATOM': 'rATOM',
  'STATOM': 'stATOM',
  'STEVMOS': 'stEVMOS',
  'STLUNA': 'stLUNA',
  'STOSMO': 'stOSMO',
}

export const useTokenPrices = () => {
  const [tokens, setTokens] = useState<EnrichedToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        const response = await fetch(PRICES_API_URL);

        if (!response.ok) {
          throw new Error('Failed to fetch token prices');
        }

        const data: Token[] = await response.json();

        // Group by currency and get latest price for each
        const tokenMap = new Map<string, Token>();

        data.forEach(token => {
          const existingToken = tokenMap.get(token.currency);
          if (!existingToken || new Date(token.date) > new Date(existingToken.date)) {
            tokenMap.set(token.currency, token);
          }
        });

        // Enrich tokens with icon URL and decimals
        const enrichedTokens: EnrichedToken[] = Array.from(tokenMap.values()).map(token => ({
          ...token,
          iconUrl: `${TOKEN_ICONS_BASE_URL}/${SPECIAL_CASES[token.currency] || token.currency}.svg`,
          decimals: DEFAULT_DECIMALS
        }));

        // Sort by currency 
        enrichedTokens.sort((a, b) => a.currency.localeCompare(b.currency));

        setTokens(enrichedTokens);
        setError(null);
      } catch (err) {
        console.error('Error fetching tokens:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  return { tokens, loading, error };
};
