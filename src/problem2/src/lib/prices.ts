export interface TokenPrice {
  currency: string;
  date: string;
  price: number;
}

const PRICES_URL =
  typeof import.meta.env !== "undefined" && import.meta.env.DEV
    ? "/prices.json"
    : "https://interview.switcheo.com/prices.json";

export const TOKEN_ICON_BASE =
  "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";

export const getTokenIconUrl = (currency: string) =>
  `${TOKEN_ICON_BASE}/${encodeURIComponent(currency)}.svg`;

export const fetchTokenPrices = async (): Promise<TokenPrice[]> => {
  const res = await fetch(PRICES_URL);
  if (!res.ok) {
    throw new Error(`Could not load prices (${res.status})`);
  }
  const data = (await res.json()) as TokenPrice[];
  if (!Array.isArray(data)) {
    throw new Error("Unexpected price response");
  }
  return dedupeLatestByCurrency(data);
};

const dedupeLatestByCurrency = (entries: TokenPrice[]): TokenPrice[] => {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const seen = new Set<string>();
  const out: TokenPrice[] = [];
  for (const row of sorted) {
    if (!seen.has(row.currency)) {
      seen.add(row.currency);
      out.push(row);
    }
  }
  return out.sort((a, b) => a.currency.localeCompare(b.currency));
};

export const convertAmount = (
  amount: number,
  fromPriceUsd: number,
  toPriceUsd: number,
): number => {
  if (toPriceUsd <= 0 || fromPriceUsd < 0 || !Number.isFinite(amount)) {
    return 0;
  }
  return (amount * fromPriceUsd) / toPriceUsd;
};

export const formatTokenAmount = (
  value: number,
  maxFractionDigits = 8,
): string => {
  if (!Number.isFinite(value)) {
    return "—";
  }
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: maxFractionDigits,
    minimumFractionDigits: 0,
  }).format(value);
};
