export const PRICE_URL = "https://interview.switcheo.com/prices.json";
export const MAX_INPUT_VALUE = 1_000_000_000_000;
export const MAX_DECIMALS = 6;
export const MAX_INPUT_LENGTH = 24;

export const buildTokenIconUrl = (currency: string) =>
  `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${currency}.svg`;
