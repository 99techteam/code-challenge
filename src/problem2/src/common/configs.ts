export const SIMULATED_DELAY = 500; // ms

export const MAX_TIMEOUT = 30000; // ms

export const MAX_RETRIES = 2;

export const SECOND_TO_MILLISECONDS = 1000;
export const WALLET_STORE = "wallets";
export const INITIAL_USD_BALANCE = 100000000;

export const TOAST_AUTO_HIDE_DURATION = 3000; // ms

export const queryConfig = {
  staleTime: SECOND_TO_MILLISECONDS * 60 * 5, // 5 minutes
  gcTime: SECOND_TO_MILLISECONDS * 60 * 30, // 30 minutes
  retry: MAX_RETRIES,
  retryDelay: (attemptIndex: number) =>
    Math.min(SECOND_TO_MILLISECONDS * MAX_RETRIES ** attemptIndex, MAX_TIMEOUT),
};

export const DEFAULT_LOCALE = "en-US";

// Decimal precision configuration
export const DECIMAL_PRECISION = 6;
export const DECIMAL_MULTIPLIER = Math.pow(10, DECIMAL_PRECISION); // 10^6 = 1,000,000
