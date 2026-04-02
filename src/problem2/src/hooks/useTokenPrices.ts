import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PRICE_URL, buildTokenIconUrl } from "@constants";
import type { PriceItem, TokenOption } from "@types";

export function useTokenPrices() {
  const [tokens, setTokens] = useState<TokenOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);

        const response = await fetch(PRICE_URL);
        const data: PriceItem[] = await response.json();

        const latestByCurrency = new Map<string, PriceItem>();

        for (const item of data) {
          if (
            !item.currency ||
            typeof item.price !== "number" ||
            Number.isNaN(item.price) ||
            item.price <= 0
          ) {
            continue;
          }

          const existing = latestByCurrency.get(item.currency);

          if (!existing) {
            latestByCurrency.set(item.currency, item);
            continue;
          }

          const existingDate = existing.date
            ? new Date(existing.date).getTime()
            : 0;
          const currentDate = item.date ? new Date(item.date).getTime() : 0;

          if (currentDate >= existingDate) {
            latestByCurrency.set(item.currency, item);
          }
        }

        const normalizedTokens: TokenOption[] = Array.from(
          latestByCurrency.values()
        )
          .map((item) => ({
            currency: item.currency,
            price: item.price,
            icon: buildTokenIconUrl(item.currency),
          }))
          .sort((a, b) => a.currency.localeCompare(b.currency));

        setTokens(normalizedTokens);
      } catch {
        toast.error("Failed to load token prices");
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  return { tokens, loading };
}
