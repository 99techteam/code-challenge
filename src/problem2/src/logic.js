// Parse a decimal amount string, or return null if it is not a valid number.
export function parseAmount(str) {
  if (!str) return null;
  if (!/^\d*\.?\d*$/.test(str)) return null;
  const n = Number(str);
  if (!Number.isFinite(n)) return null;
  return n;
}

// Format a token amount with up to 8 decimals, trimming trailing zeros.
export function formatAmount(v) {
  if (v == null || !Number.isFinite(v)) return "0";
  if (v === 0) return "0";
  return v.toFixed(8).replace(/\.?0+$/, "");
}

// Format a USD value, e.g. 1645.937 -> "$1,645.94".
export function formatUsd(v) {
  if (v == null || !Number.isFinite(v)) return "—";
  if (v === 0) return "$0.00";
  if (Math.abs(v) >= 1) {
    return (
      "$" +
      v.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }
  return "$" + v.toLocaleString("en-US", { maximumSignificantDigits: 4 });
}

// Exchange rate from two USD prices (priceFrom per priceTo), or null when
// either price is missing or the denominator is zero.
export function exchangeRate(priceFrom, priceTo) {
  if (priceFrom == null || priceTo == null || priceTo === 0) return null;
  return priceFrom / priceTo;
}

// Collapse price rows down to one entry per currency, keeping the newest date.
// Returns a Map of currency -> price.
export function dedupePrices(rows) {
  const latest = new Map(); // currency -> { price, date }
  for (const row of rows) {
    const prev = latest.get(row.currency);
    if (!prev || new Date(row.date) > new Date(prev.date)) {
      latest.set(row.currency, { price: row.price, date: row.date });
    }
  }
  const prices = new Map();
  for (const [currency, entry] of latest) prices.set(currency, entry.price);
  return prices;
}
