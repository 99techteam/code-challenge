import { useState, useEffect, useCallback } from "react";
import { fetchTokensWithPrices } from "../services/priceService";
import { preloadTokenImages } from "../utils/imagePreload";
import type { Token } from "../types";

export function useTokensWithPrices(): {
  tokens: Token[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTokensWithPrices();
      setTokens(data);
      preloadTokenImages(data.map((t) => t.imageUrl));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { tokens, loading, error, refetch };
}
