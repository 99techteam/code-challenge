// Switcheo token icon SVGs are served from the `token-icons` repo at
// raw.githubusercontent.com. Not every symbol in the price feed has an
// icon — `IconImg` in view.tsx swaps to a fallback letter avatar on error.

const ICON_BASE =
  'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

export const iconUrl = (symbol: string): string =>
  `${ICON_BASE}/${symbol}.svg`;
