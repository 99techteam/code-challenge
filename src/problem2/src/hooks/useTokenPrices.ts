import { useEffect, useState } from "react";
import { fetchTokenPrices } from "../lib/prices";

export function useTokenPrices() {
  const [tokenPrices, setTokenPrices] = useState<Map<string, number>>(
    new Map(),
  );
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const initialize = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const map = await fetchTokenPrices();
        if (cancelled) {
          return;
        }
        setTokenPrices(map);
        setLoadError("");
      } catch (error) {
        if (cancelled) {
          return;
        }
        const message =
          error instanceof Error ? error.message : "Unknown error.";
        setLoadError(`Failed to load market data. ${message}`);
      } finally {
        setIsLoading(false);
      }
    };

    void initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  return { tokenPrices, loadError, isLoading };
}
