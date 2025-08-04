import { TokenBalance } from '../types';

// Function to generate mock balances based on available tokens from API
export const getInitialMockBalances = (availableTokens: string[]): TokenBalance => {
  const mockBalances: TokenBalance = {};
  
  // Define some preset balances for common tokens
  const presetBalances: TokenBalance = {
    ETH: 2.5,
    BTC: 0.1,
    USDC: 500,
    SWTH: 10000,
    BNB: 5,
    WETH: 1.8,
    DAI: 300,
    USDT: 750,
    LINK: 25,
    UNI: 15,
    MATIC: 100,
    SOL: 3,
    ADA: 200,
    DOT: 8,
    AVAX: 12
  };

  // Only include tokens that are available in the price API
  availableTokens.forEach(token => {
    if (presetBalances[token]) {
      mockBalances[token] = presetBalances[token];
    } else {
      // Generate random balance for tokens not in our preset list
      mockBalances[token] = Math.random() * 50 + 1; // Random balance between 1-51
    }
  });

  return mockBalances;
};

// Fallback balances when API is not available
export const mockBalances: TokenBalance = {
  ETH: 2.5,
  BTC: 0.1,
  USDC: 500,
  SWTH: 10000,
  BNB: 5,
  WETH: 1.8,
  DAI: 300,
  USDT: 750,
  LINK: 25,
  UNI: 15
};

export const tokenNames: { [key: string]: string } = {
  ETH: "Ethereum",
  BTC: "Bitcoin", 
  USDC: "USD Coin",
  USDT: "Tether",
  SWTH: "Switcheo",
  BNB: "Binance Coin",
  WETH: "Wrapped Ethereum",
  DAI: "Dai Stablecoin",
  LINK: "Chainlink",
  UNI: "Uniswap",
  MATIC: "Polygon",
  SOL: "Solana",
  ADA: "Cardano",
  DOT: "Polkadot",
  AVAX: "Avalanche",
  ATOM: "Cosmos",
  LUNA: "Terra",
  FTT: "FTX Token",
  NEAR: "NEAR Protocol",
  ICP: "Internet Computer"
};

// Generate token icon URLs dynamically
export const getTokenIconUrl = (symbol: string): string => {
  // Handle special cases where token symbols don't match file names
  const symbolMap: { [key: string]: string } = {
    'STEVMOS': 'stEVMOS',
    // Add more mappings here if needed
  };
  
  const actualSymbol = symbolMap[symbol.toUpperCase()] || symbol.toUpperCase();
  return `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${actualSymbol}.svg`;
};

// Get supported tokens based on available prices (will be updated when prices are fetched)
export let supportedTokens: string[] = Object.keys(mockBalances);

export const updateSupportedTokens = (availableTokens: string[]) => {
  supportedTokens = availableTokens;
};
