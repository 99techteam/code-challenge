import { TOKEN_ICON_BASE_URL } from "./constants";

export function getTokenIconUrl(symbol: string): string {
  return `${TOKEN_ICON_BASE_URL}/${encodeURIComponent(symbol)}.svg`;
}
