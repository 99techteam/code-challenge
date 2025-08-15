// --- Icon base + helper ---
export const ICON_BASE =
  "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";

export const iconUrl = (symbol) =>
  `${ICON_BASE}/${String(symbol)}.svg`;

// --- Price feed ---
export const PRICE_URL = "https://interview.switcheo.com/prices.json";

export const FEE_BPS = 30;       // 0.30%
export const SLIPPAGE_BPS = 50;  // 0.50%
export const NETWORK_FEE_USD = 0.9;
