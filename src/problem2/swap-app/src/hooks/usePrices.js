import { useEffect, useMemo, useState } from "react";
import { PRICE_URL } from "../lib/constants.js";

function normalizePrices(data) {
  const map = {};

  if (Array.isArray(data)) {
    for (const it of data) {
      const sym = String(it.currency || it.symbol || it.code || "");
      const val = Number(it.price ?? it.usd ?? it.value);
      if (sym && isFinite(val)) map[sym] = val;
    }
    return map;
  }

  if (data && typeof data === "object") {
    for (const [k, v] of Object.entries(data)) {
      const sym = k;
      const val = Number(v?.usd ?? v?.price ?? v);
      if (isFinite(val)) map[sym] = val;
    }
    return map;
  }

  return {};
}

export function usePrices() {
  const [prices, setPrices] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const fetcher = async () => {
      try {
        setLoading(true);
        const r = await fetch(PRICE_URL, { cache: "no-store" });
        if (!r.ok) throw new Error("Fetch failed");
        const json = await r.json();
        const norm = normalizePrices(json);
        if (alive && Object.keys(norm).length) setPrices(norm);
      } catch {
        // FALLBACK
      } finally {
        alive && setLoading(false);
      }
    };

    fetcher();
    const t = setInterval(fetcher, 60_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  // Sort symbols for dropdown
  const symbols = useMemo(() => Object.keys(prices).sort(), [prices]);

  // Helper to read a symbol’s USD price
  const priceUSD = (sym) => prices[sym] ?? NaN;

  return { prices, priceUSD, symbols, loading };
}
