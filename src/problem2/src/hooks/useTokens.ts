import { useState, useEffect } from 'react';
import type { Token, PriceData } from '../types';

const API_URL = 'https://interview.switcheo.com/prices.json';
const ICON_BASE_URL = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/';

export function useTokens() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: PriceData[] = await response.json();
        const processedTokens = data
          ?.filter(token => token.price)
          ?.map(token => ({
            currency: token.currency,
            price: token.price,
            iconUrl: `${ICON_BASE_URL}${token.currency}.svg`,
          }));
        
        processedTokens.sort((a, b) => a.currency.localeCompare(b.currency));
        await new Promise(resolve => setTimeout(resolve, 1000)); // delay to show loading spin 
        setTokens(processedTokens);
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, []);

  return { tokens, isLoading, error };
}