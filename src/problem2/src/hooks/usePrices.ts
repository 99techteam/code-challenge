import { useCallback, useEffect, useState } from "react";
import type { PriceEntry, Token } from "../types";
import { iconUrlFor } from "../lib/tokens";

const PRICES_URL = "https://interview.switcheo.com/prices.json";

type UsePricesResult = {
  tokens: Token[];
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
};

function dedupe(entries: PriceEntry[]): Token[] {
  const latest = new Map<string, PriceEntry>();
  for (const e of entries) {
    if (!e || !e.currency) continue;
    if (typeof e.price !== "number" || !Number.isFinite(e.price) || e.price <= 0) continue;
    const existing = latest.get(e.currency);
    if (!existing || new Date(e.date).getTime() > new Date(existing.date).getTime()) {
      latest.set(e.currency, e);
    }
  }
  return Array.from(latest.values())
    .sort((a, b) => a.currency.localeCompare(b.currency))
    .map<Token>((e) => ({
      symbol: e.currency,
      price: e.price,
      iconUrl: iconUrlFor(e.currency),
    }));
}

export function usePrices(): UsePricesResult {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(PRICES_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: PriceEntry[]) => {
        if (cancelled) return;
        setTokens(dedupe(data));
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setTokens([]);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { tokens, isLoading, error, retry };
}
