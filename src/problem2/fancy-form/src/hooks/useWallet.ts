import { useState, useEffect, useCallback } from 'react';

const WALLET_KEY = 'n99_dex_wallet_mock';

// Initial mock data
const INITIAL_BALANCES: Record<string, number> = {
  'ETH': 1.524,
  'USDC': 2500.00,
  'WBTC': 0.045,
  'DAI': 120.50,
  'BUSD': 50.00
};

export function useWallet() {
  const [balances, setBalances] = useState<Record<string, number>>(() => {
    /* 
      --- BACKEND INTEGRATION TIP ---
      Instead of reading from localStorage, you would fetch this data from your API:
      const res = await fetch('/api/user/balances');
      const data = await res.json();
      setBalances(data);
    */
    const saved = localStorage.getItem(WALLET_KEY);
    return saved ? JSON.parse(saved) : INITIAL_BALANCES;
  });

  useEffect(() => {
    localStorage.setItem(WALLET_KEY, JSON.stringify(balances));
  }, [balances]);

  const updateBalance = useCallback((symbol: string, amount: number) => {
    setBalances(prev => {
      /*
        --- BACKEND INTEGRATION TIP ---
        For a production app, you wouldn't just update locally. 
        You'd send the transaction to the backend:
        await fetch('/api/swap', { method: 'POST', body: JSON.stringify({ symbol, amount }) });
        Then re-fetch the fresh balances from the server.
      */
      const current = prev[symbol] || 0;
      return {
        ...prev,
        [symbol]: current + amount
      };
    });
  }, []);

  return { balances, updateBalance };
}
