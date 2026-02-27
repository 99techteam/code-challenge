import { useState, useEffect } from 'react';
import axios from 'axios';
import { TokenPrice } from '../types/token';

export const usePrices = () => {
  const [prices, setPrices] = useState<TokenPrice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPrices = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get<TokenPrice[]>('https://interview.switcheo.com/prices.json');
        
        if (isMounted) {
          // Remove duplicates and tokens with no price or invalid price
          const validPrices = data.filter(item => item.price && item.price > 0);
          
          // Ensure uniqueness by currency symbol, taking the first valid price encountered
          const uniquePricesMap = new Map<string, TokenPrice>();
          for (const item of validPrices) {
            if (!uniquePricesMap.has(item.currency)) {
              uniquePricesMap.set(item.currency, item);
            }
          }
          
          setPrices(Array.from(uniquePricesMap.values()));
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to fetch prices. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPrices();

    return () => {
      isMounted = false;
    };
  }, []);

  return { prices, loading, error };
};
