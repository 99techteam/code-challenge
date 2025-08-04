import { Token, PriceData } from '../types';

export const fetchPrices = async (): Promise<PriceData> => {
  try {
    const response = await fetch('https://interview.switcheo.com/prices.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: Token[] = await response.json();
    
    // Convert array to object with latest prices for each currency
    const priceMap: PriceData = {};
    const dateMap: { [key: string]: string } = {};
    
    data.forEach(token => {
      const currency = token.currency.toUpperCase();
      if (!priceMap[currency] || new Date(token.date) > new Date(dateMap[currency] || '1970-01-01')) {
        priceMap[currency] = token.price;
        dateMap[currency] = token.date;
      }
    });
    
    // Filter out tokens with zero or invalid prices
    const validPrices: PriceData = {};
    Object.entries(priceMap).forEach(([currency, price]) => {
      if (price > 0 && !isNaN(price)) {
        validPrices[currency] = price;
      }
    });
    
    return validPrices;
  } catch (error) {
    console.error('Failed to fetch prices from Switcheo API:', error);
    
    // Return fallback prices with common tokens
    return {
      ETH: 2000,
      USDC: 1,
      SWTH: 0.05,
      BTC: 45000,
      BNB: 300,
      WETH: 2000,
      DAI: 1,
      USDT: 1,
      LINK: 15,
      UNI: 7
    };
  }
};

export const calculateSwapAmount = (
  fromAmount: number,
  fromPrice: number,
  toPrice: number
): number => {
  if (!fromAmount || !fromPrice || !toPrice) return 0;
  return (fromAmount * fromPrice) / toPrice;
};

export const formatNumber = (num: number, decimals: number = 6): string => {
  if (num === 0) return '0';
  if (num < 0.000001) return num.toExponential(2);
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
};

export const simulateSwap = async (
  _fromToken: string,
  _toToken: string,
  _amount: number
): Promise<{ success: boolean; txHash?: string; error?: string }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate random success/failure (90% success rate)
  const success = Math.random() > 0.1;
  
  if (success) {
    return {
      success: true,
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`
    };
  } else {
    return {
      success: false,
      error: 'Transaction failed: Insufficient liquidity'
    };
  }
};
