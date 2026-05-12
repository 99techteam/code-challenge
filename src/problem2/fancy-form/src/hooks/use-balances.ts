import { useCallback, useState } from "react";
import { MOCKUP_BALANCES } from "../constants/balances";

export function useBalances() {
  const [balances, setBalances] =
    useState<Record<string, number>>(MOCKUP_BALANCES);

  const updateBalance = useCallback((symbol: string, amount: number) => {
    setBalances((prev) => {
      const currentSymbolBalance = prev[symbol] || 0;

      return {
        ...prev,
        [symbol]: currentSymbolBalance + amount,
      };
    });
  }, []);

  return {
    balances,
    updateBalance,
  };
}
