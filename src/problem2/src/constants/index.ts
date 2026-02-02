export const API_ENDPOINTS = {
  PRICES: "https://interview.switcheo.com/prices.json",
} as const;

export const EXTERNAL_RESOURCES = {
  TOKEN_ICON_BASE_URL:
    "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens",
  FALLBACK_ICON:
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24"%3E%3Crect width="24" height="24" fill="%23ccc"/%3E%3C/svg%3E',
} as const;

export const VALIDATION = {
  MIN_AMOUNT: 0,
  AMOUNT_DECIMALS: 6,
  RATE_DECIMALS: 6,
} as const;

export const UI_CONFIG = {
  INPUT_SIZE: "large",
  BUTTON_HEIGHT: 56,
  CARD_MAX_WIDTH: 480,
} as const;
