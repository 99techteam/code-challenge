import { useState, useEffect } from "react";
import type { Token } from "../types";
import { getTokensWithPrices } from "../services";

export const usePrices = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        const tokenList = await getTokensWithPrices();
        setTokens(tokenList);
        setError(null);
      } catch (err) {
        setError("Failed to load token prices");
        console.error("Error fetching prices:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  return { tokens, loading, error };
};
