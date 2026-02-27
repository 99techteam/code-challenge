import { ref, onMounted, onUnmounted } from "vue";
import type { PriceItem, Prices } from "../type/tokenSelect.type";

export function usePrices(refreshInterval = 10000) {
  const prices = ref<Prices>({});
  const tokens = ref<string[]>([]);
  const loading = ref(false);

  let intervalId: number | null = null;

  async function fetchPrices() {
    try {
      loading.value = true;

      const res = await fetch("https://interview.switcheo.com/prices.json");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data: PriceItem[] = await res.json();

      /*
        latestMap purpose:
        ------------------
        Store ONLY the most recent price record for each token.

        Because the API returns historical price records,
        we must compare dates and keep the newest one.
      */
      const latestMap: Record<string, PriceItem> = {};

      data.forEach((item) => {
        const prev = latestMap[item.currency];

        // If no record yet OR current item is newer
        if (!prev || new Date(item.date) > new Date(prev.date)) {
          latestMap[item.currency] = item;
        }
      });

      /*
        Convert latestMap into simple:
        { ETH: 3500, BNB: 600 }
      */
      const newPrices: Prices = {};

      Object.keys(latestMap).forEach((token) => {
        newPrices[token] = latestMap[token].price;
      });

      /*
        Only update state if prices actually changed.
        Prevents unnecessary UI re-render.
      */
      if (JSON.stringify(newPrices) !== JSON.stringify(prices.value)) {
        prices.value = newPrices;
        tokens.value = Object.keys(newPrices);
        console.log("Prices updated");
      }
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    fetchPrices();

    intervalId = window.setInterval(() => {
      fetchPrices();
    }, refreshInterval);
  });

  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });

  return { prices, tokens, loading };
}
