import { useState, useEffect, useCallback } from 'react';
import type { SwapState, TokenPrice } from '../types';

const API_URL = 'https://interview.switcheo.com/prices.json';
const getTokenName = (symbol: string): string => {
  const names: Record<string, string> = {
    'SWTH': 'Switcheo Token',
    'ETH': 'Ethereum',
    'BTC': 'Bitcoin',
    'USDC': 'USD Coin',
    'BUSD': 'Binance USD',
    'WBTC': 'Wrapped Bitcoin',
    'DAI': 'Dai Stablecoin',
  };
  return names[symbol] || symbol;
};

export const useSwap = () => {
  const [state, setState] = useState<SwapState>({
    prices: {},
    tokens: [],
    selectedDirection: 'from',
    loadingPrices: false,
  });

  const fetchPrices = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loadingPrices: true }));
      const response = await fetch(API_URL);
      const data: TokenPrice[] = await response.json();
      
      const prices = data.reduce((acc: Record<string, number>, item) => {
        acc[item.currency] = Number(item.price);
        return acc;
      }, {} as Record<string, number>);

      const tokens = Object.keys(prices).map(symbol => ({
        symbol,
        name: getTokenName(symbol),
        price: prices[symbol],
        icon: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${symbol}.svg`,
      }));

      setState(prev => ({
        ...prev,
        prices,
        tokens,
        loadingPrices: false,
      }));
    } catch (error) {
      console.error('Error fetching prices:', error);
      setState(prev => ({ ...prev, loadingPrices: false }));
    }
  }, []);

  const calculateSwapAmount = useCallback((
    fromAmount: number,
    fromToken: string,
    toToken: string,
  ): number | null => {
    const { prices } = state;
    if (!prices[fromToken] || !prices[toToken]) return null;

    const rate = prices[toToken] / prices[fromToken];
    return fromAmount * rate;
  }, [state.prices]);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const setSelectedDirection = useCallback((direction: "from" | "to") => {
    setState(prev => ({ ...prev, selectedDirection: direction }));
  }, []);

  return {
    state,
    calculateSwapAmount,
    setSelectedDirection,
  };
};

