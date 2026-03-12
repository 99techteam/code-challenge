import React, { useCallback } from "react";
import cryptoPricesData from "../constant/prices.json";
import type { PriceData, Token } from "../types/prices";

const useGetData = () => {
  const TOKEN_NAMES: Record<string, string> = {
    BLUR: "Blur",
    bNEO: "Binance NEO",
    BUSD: "Binance USD",
    USD: "US Dollar",
    ETH: "Ethereum",
    GMX: "GMX",
    STEVMOS: "Staked EVMOS",
    LUNA: "Terra Luna",
    RATOM: "Reward ATOM",
    STRD: "Stride",
    EVMOS: "Evmos",
    IBCX: "IBC Index",
    IRIS: "IRISnet",
    ampLUNA: "Amplified Luna",
    KUJI: "Kujira",
    STOSMO: "Staked Osmo",
    USDC: "USD Coin",
    axlUSDC: "Axelar USDC",
    ATOM: "Cosmos",
    STATOM: "Staked ATOM",
    OSMO: "Osmosis",
    rSWTH: "Reward SWTH",
    STLUNA: "Staked Luna",
    LSI: "Liquid Staking Index",
    OKB: "OKB",
    OKT: "OKC Token",
    SWTH: "Switcheo",
    USC: "USC",
    WBTC: "Wrapped Bitcoin",
    wstETH: "Wrapped Staked ETH",
    YieldUSD: "Yield USD",
    ZIL: "Zilliqa",
  };

  const processTokenData = (data: PriceData[]): Token[] => {
    const tokenMap = new Map<string, { price: number; date: string }>();

    data.forEach((item) => {
      const existing = tokenMap.get(item.currency);
      if (!existing || new Date(item.date) > new Date(existing.date)) {
        tokenMap.set(item.currency, { price: item.price, date: item.date });
      }
    });

    // Convert to Token array with mock balances
    return Array.from(tokenMap.entries())
      .map(([symbol, { price }]) => ({
        symbol,
        name: TOKEN_NAMES[symbol] || symbol,
        balance: Math.random() * 10000,
        price,
      }))
      .filter((token) => token.price > 0)
      .sort((a, b) => b.price * b.balance - a.price * a.balance);
  };

  const AVAILABLE_TOKENS: Token[] = processTokenData(
    cryptoPricesData as PriceData[],
  );
  return { AVAILABLE_TOKENS };
};

export default useGetData;
