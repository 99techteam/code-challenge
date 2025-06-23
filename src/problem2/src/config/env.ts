// Environment configuration with validation and defaults
export const env = {
  // API URLs
  pricesUrl: import.meta.env.VITE_PRICES_URL || 'https://interview.switcheo.com/prices.json',
  tokenIconBaseUrl: import.meta.env.VITE_TOKEN_ICON_BASE_URL || 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens',
  
  // Cache Configuration  
  tokenCacheKey: import.meta.env.VITE_TOKEN_CACHE_KEY || 'token_prices_cache',
  cacheDurationMs: Number(import.meta.env.VITE_CACHE_DURATION_MS) || 300000, // 5 minutes
  
  // API Configuration
  apiTimeoutMs: Number(import.meta.env.VITE_API_TIMEOUT_MS) || 10000, // 10 seconds
  
  // App Configuration
  appName: import.meta.env.VITE_APP_NAME || 'Currency Swap',
  maxTransactionHistory: Number(import.meta.env.VITE_MAX_TRANSACTION_HISTORY) || 10,
} as const;

// Validation function to ensure required env vars are present
export const validateEnv = () => {
  const requiredVars = [
    'VITE_PRICES_URL',
    'VITE_TOKEN_ICON_BASE_URL',
  ];
  
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
    console.warn('Using default values. Check your .env file.');
  }
};

// Type definitions for better TypeScript support
export type EnvConfig = typeof env;
