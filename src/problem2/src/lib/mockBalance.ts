import type { TokenPrice } from "./prices";

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
};

export const getMockBalance = (currency: string): number => {
  const base = 50 + (hash(currency) % 9500) / 100;
  return Math.round(base * 1e6) / 1e6;
};

export const pickDefaultPair = (tokens: TokenPrice[]) => {
  if (tokens.length < 2) {
    return { from: tokens[0]?.currency ?? "", to: "" };
  }
  const eth = tokens.find((t) => t.currency === "ETH");
  const usdc = tokens.find((t) => t.currency === "USDC");
  if (eth && usdc) {
    return { from: eth.currency, to: usdc.currency };
  }
  return { from: tokens[0].currency, to: tokens[1].currency };
};
