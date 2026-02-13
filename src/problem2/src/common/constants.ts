// Base URL for token icons from GitHub
export const TOKEN_ICON_BASE_URL =
  "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";

export const TOKEN_ICON_FALLBACK = "/not-found-icon-10.jpg";

export const PRICE_API_URL = "https://interview.switcheo.com/";

export const API_ENDPOINTS = {
  PRICES: "prices.json",
};

export const ERROR_MESSAGES = {
  FETCH_PRICES: "Failed to fetch token prices.",
  FETCH_WALLETS: "Failed to fetch wallet data.",
  FAILED_TO_LOAD: "Failed to load data",
  UNKNOWN_ERROR: "Unknown error",
  SAVE_WALLET: "Failed to save wallet data.",
  VALIDATE: {
    MISSING_TOKEN: "Please select a token",
    AMOUNT_MUST_BE_NUMBER: "Amount must be a number",
    AMOUNT_MUST_BE_POSITIVE: "Amount must be greater than 0",
    CANNOT_SWAP_SAME_TOKEN: "Cannot swap the same token",
    INSUFFICIENT_BALANCE: "Insufficient balance",
  },
  SWAP: {
    SUCCESS: "Swap successful!",
    FAILED: "Swap failed!",
  },
  CONTEXT: {
    TOAST_PROVIDER_REQUIRED: "useToast must be used within ToastProvider",
    EXCHANGE_MODAL_PROVIDER_REQUIRED: "useExchangeModal must be used within ExchangeModalProvider",
  },
};
