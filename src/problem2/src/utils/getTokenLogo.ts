import { symbolAlias } from "@/types/symbol";

const tokenLogos = import.meta.glob("/src/assets/tokens/*.svg", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export const getTokenLogo = (symbol: string): string => {
  const normalized = (
    symbolAlias[symbol.toUpperCase()] || symbol
  ).toLowerCase();

  for (const path in tokenLogos) {
    const fileName = path.split("/").pop()?.replace(".svg", "").toLowerCase();
    if (fileName === normalized) {
      return tokenLogos[path];
    }
  }

  const fallback = tokenLogos["/src/assets/tokens/default.svg"];
  console.warn(`⚠️ Token logo not found: ${symbol} → fallback to default.svg`);
  return fallback;
};
