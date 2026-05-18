import { useState, useEffect } from 'react';
import type { Coin } from '../types';

export const useCoins = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoins = () => {
    setLoading(true);
    fetch('http://localhost:3001/api/coins')
      .then(res => res.json())
      .then(data => {
        setCoins(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching coins', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCoins();
  }, []);

  return { coins, loading, refetch: fetchCoins };
};
