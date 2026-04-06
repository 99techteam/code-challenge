import { useQuery } from "@tanstack/react-query";
import { PRICE_URL } from "@/constant";

export interface TokenPrice {
  currency: string;
  price: number;
  date: string;
}

interface PriceApiResponse {
  currency: string;
  price: number;
  date: string;
}

const usePrices = () => {
  return useQuery({
    queryKey: ["prices"],
    queryFn: async (): Promise<TokenPrice[]> => {
      const response = await fetch(PRICE_URL);
      console.log("🚀 ~ usePrices ~ response:", response);

      if (!response.ok) {
        throw new Error("Failed to fetch prices");
      }

      const data: PriceApiResponse[] = await response.json();
      console.log("📊 ~ Raw API response is array:", Array.isArray(data));
      console.log("📊 ~ Total items in response:", data.length);
      console.log("📊 ~ Sample data:", data.slice(0, 3));

      // Group by currency and keep the latest price (by date)
      const tokenMap = new Map<string, TokenPrice>();

      data.forEach((item) => {
        const existing = tokenMap.get(item.currency);

        // Keep the item with the most recent date, or higher price if same date
        if (!existing || new Date(item.date) > new Date(existing.date)) {
          tokenMap.set(item.currency, {
            currency: item.currency,
            price: item.price,
            date: item.date,
          });
        }
      });

      // Convert to array and sort by currency
      const tokens = Array.from(tokenMap.values())
        .filter((token) => token.price && token.price > 0)
        .sort((a, b) => a.currency.localeCompare(b.currency));

      console.log("✅ ~ Unique currencies after dedup:", tokens.length);
      console.log("✅ ~ Sample tokens:", tokens.slice(0, 5));

      return tokens;
    },
  });
};

export default usePrices;
