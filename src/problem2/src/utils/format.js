export function formatNumber(value, maximumDigits = 6) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: maximumDigits,
    minimumFractionDigits: 0
  }).format(value);
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1 ? 2 : 6
  }).format(value);
}

export function parseFormattedNumber(value) {
  return Number(String(value).replace(/,/g, ""));
}
