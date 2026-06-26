import { useState, useEffect } from "react";
import type { Token } from "../types";
import { fetchTokens } from "../lib/prices";

interface PricesState {
  loading: boolean;
  tokens: Token[];
  error: string | null;
}

/**
 * Fetches the token list once on mount and exposes loading / error / data.
 * The fetch is not retried automatically — a page refresh is the expected
 * recovery path for a network error in this context.
 */
export function usePrices(): PricesState {
  const [state, setState] = useState<PricesState>({
    loading: true,
    tokens: [],
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    fetchTokens()
      .then((tokens) => {
        if (!cancelled) setState({ loading: false, tokens, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setState({ loading: false, tokens: [], error: String(err) });
      });

    // If the component unmounts before the fetch resolves, discard the result.
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
