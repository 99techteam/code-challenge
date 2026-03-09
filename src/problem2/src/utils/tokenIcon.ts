const TOKEN_ICONS_BASE =
  "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";

export function getTokenImageUrl(currency: string): string {
  if (!currency || typeof currency !== "string") return "";
  return `${TOKEN_ICONS_BASE}/${encodeURIComponent(currency)}.svg`;
}
