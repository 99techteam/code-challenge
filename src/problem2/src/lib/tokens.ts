export interface Token {
  id: string;
  symbol: string;
  name: string;
  icon: string;
  price: number; // USD price
  decimals: number;
}

export const TOKENS: Token[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    icon: '/tokens/btc.svg',
    price: 43250.50,
    decimals: 8,
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    icon: '/tokens/eth.svg',
    price: 2650.75,
    decimals: 18,
  },
  {
    id: 'tether',
    symbol: 'USDT',
    name: 'Tether USD',
    icon: '/tokens/usdt.svg',
    price: 1.00,
    decimals: 6,
  },
  {
    id: 'binancecoin',
    symbol: 'BNB',
    name: 'BNB',
    icon: '/tokens/bnb.svg',
    price: 315.20,
    decimals: 18,
  },
  {
    id: 'usd-coin',
    symbol: 'USDC',
    name: 'USD Coin',
    icon: '/tokens/usdc.svg',
    price: 1.00,
    decimals: 6,
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    icon: '/tokens/sol.svg',
    price: 185.45,
    decimals: 9,
  },
  {
    id: 'cardano',
    symbol: 'ADA',
    name: 'Cardano',
    icon: '/tokens/ada.svg',
    price: 0.485,
    decimals: 6,
  },
  {
    id: 'avalanche-2',
    symbol: 'AVAX',
    name: 'Avalanche',
    icon: '/tokens/avax.svg',
    price: 42.15,
    decimals: 18,
  },
];

// Mock API functions
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchTokenPrice = async (tokenId: string): Promise<number> => {
  // Simulate API delay
  await delay(500);
  
  const token = TOKENS.find(t => t.id === tokenId);
  if (!token) throw new Error('Token not found');
  
  // Add some random price variation to simulate real market
  const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
  return token.price * (1 + variation);
};

export const calculateExchangeRate = async (
  fromTokenId: string,
  toTokenId: string,
  amount: number
): Promise<{ rate: number; outputAmount: number; fee: number }> => {
  await delay(300);
  
  const fromToken = TOKENS.find(t => t.id === fromTokenId);
  const toToken = TOKENS.find(t => t.id === toTokenId);
  
  if (!fromToken || !toToken) {
    throw new Error('Invalid token pair');
  }
  
  // Calculate exchange rate based on USD prices
  const rate = fromToken.price / toToken.price;
  
  // Simulate 0.3% trading fee
  const fee = amount * 0.003;
  const amountAfterFee = amount - fee;
  const outputAmount = amountAfterFee * rate;
  
  return {
    rate,
    outputAmount,
    fee,
  };
};

export const mockSwapTransaction = async (
  fromTokenId: string,
  toTokenId: string,
  amount: number
): Promise<{ success: boolean; txHash?: string; error?: string }> => {
  // Simulate transaction processing time
  await delay(2000);
  
  // 95% success rate for demo
  const success = Math.random() > 0.05;
  
  if (success) {
    return {
      success: true,
      txHash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
    };
  } else {
    return {
      success: false,
      error: 'Transaction failed due to network congestion. Please try again.',
    };
  }
};