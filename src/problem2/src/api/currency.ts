import { delay } from '@/lib/utils';
import apiCaller from './api-caller';

type PriceRow = {
  currency: string;
  date: string;
  price: number;
};

function parsePriceResponse(response: Array<PriceRow>) {
  const latestRows: Record<string, PriceRow> = {};

  for (const row of response) {
    // filter out invalid rows
    if (
      !row.currency ||
      !Number.isFinite(row.price) ||
      row.price <= 0 ||
      !row.date
    ) {
      continue;
    }

    // keep only the latest price for each currency
    const current = latestRows[row.currency];
    if (
      !current ||
      new Date(row.date).getTime() > new Date(current.date).getTime()
    ) {
      latestRows[row.currency] = row;
    }
  }

  const prices = Object.fromEntries(
    Object.entries(latestRows).map(([currency, row]) => [currency, row.price]),
  );
  const currencies = Object.keys(prices).sort((a, b) => a.localeCompare(b));

  return { currencies, prices };
}

function parseIconResponse(response: Response) {
  return response.text();
}

const currencyApi = {
  async fetchPrices(abort?: AbortController) {
    await delay(500);
    return apiCaller('https://interview.switcheo.com/prices.json', { signal: abort?.signal }).then(
      parsePriceResponse,
    );
  },

  async fetchIcons(currency: string) {
    return apiCaller(
      `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${encodeURIComponent(currency)}.svg`,
      { noParse: true },
    ).then(parseIconResponse);
  },
};

export { currencyApi };
