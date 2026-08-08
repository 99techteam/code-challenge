export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://interview.switcheo.com',
  PRICES_ENDPOINT: '/prices.json',
  TOKEN_ICONS_BASE_URL: import.meta.env.VITE_TOKEN_ICONS_BASE_URL || 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

export const VALIDATION = {
  MAX_AMOUNT: 1e15,
  MIN_AMOUNT: 0,
  MAX_DECIMAL_PLACES: 8,
} as const;

export const DEFAULT_CURRENCIES = {
  FROM: 'USD',
  TO: 'BUSD',
} as const;
