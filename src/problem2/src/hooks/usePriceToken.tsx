import { useEffect, useState } from "react";
import type { Token, TokenWithIcon } from "types/token";
import { getTokenIcon } from "utils/common";

export const usePriceToken = () => {
  const [tokens, setTokens] = useState<TokenWithIcon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('https://interview.switcheo.com/prices.json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: Token[] = await response.json();
        const listTokenPriced = data.filter(token => token.price > 0).sort((a, b) => a.currency.localeCompare(b.currency));
        // Remove duplicates by keeping only the latest record for each currency
        const uniqueTokens = listTokenPriced.reduce((acc: Token[], current) => {
          const existingToken = acc.find(token => token.currency === current.currency);
          if (!existingToken || new Date(current.date) > new Date(existingToken.date)) {
            // If no existing token or current token is newer, replace it
            return [...acc.filter(token => token.currency !== current.currency), current];
          }
          return acc;
        }, []);
        const tokensWithIcons: TokenWithIcon[] = uniqueTokens.map(token => ({
          ...token,
          iconUrl: getTokenIcon(token.currency)
        }));

        setTokens(tokensWithIcons);
      }
      catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchPrices();
  }, []);

  return { tokens, loading, error };
}