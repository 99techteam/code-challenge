import { useCallback, useEffect, useState } from "react";

export interface Token {
  symbol: string;
  price: number;
}

interface PriceRow {
  currency: string;
  date: string;
  price: number;
}

const PRICES_URL = "https://interview.switcheo.com/prices.json";

// Keeps the newest quote per currency and drops tokens without a usable price.
async function fetchTokens(signal: AbortSignal): Promise<Token[]> {
  const res = await fetch(PRICES_URL, { signal });
  if (!res.ok) throw new Error(`Price request failed with status ${res.status}`);
  const rows: PriceRow[] = await res.json();

  const latest = new Map<string, { price: number; time: number }>();
  for (const { currency, date, price } of rows) {
    if (!(price > 0)) continue;
    const time = Date.parse(date);
    const seen = latest.get(currency);
    if (!seen || time >= seen.time) latest.set(currency, { price, time });
  }

  const tokens: Token[] = [];
  for (const [symbol, { price }] of latest) tokens.push({ symbol, price });
  return tokens.sort((a, b) => a.symbol.localeCompare(b.symbol));
}

export type TokensState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; tokens: Token[]; bySymbol: Map<string, Token> };

export function useTokens(): [TokensState, () => void] {
  const [state, setState] = useState<TokensState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    setState({ status: "loading" });
    fetchTokens(ctrl.signal).then(
      (tokens) =>
        setState({ status: "ready", tokens, bySymbol: new Map(tokens.map((t) => [t.symbol, t])) }),
      (err: unknown) => {
        if (ctrl.signal.aborted) return;
        setState({ status: "error", message: err instanceof Error ? err.message : "Network error" });
      }
    );
    return () => ctrl.abort();
  }, [attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return [state, reload];
}
