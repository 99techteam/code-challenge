export function getDefaultTokenPair(symbols: string[]): { from: string; to: string } {
  const from = symbols.includes("ETH") ? "ETH" : symbols[0];
  const to = symbols.includes("USDC")
    ? "USDC"
    : symbols.find((symbol) => symbol !== from) || symbols[0];

  return { from, to };
}
