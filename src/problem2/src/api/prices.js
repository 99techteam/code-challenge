import axios from 'axios'
import { PRICES_URL, TOKEN_ICON_BASE } from '../constants'

export async function fetchTokenPrices() {
  const { data } = await axios.get(PRICES_URL)

  const byCurrency = {};
  for (const row of data) {
    const key = row.currency;
    if (!byCurrency[key]) {
      byCurrency[key] = { currency: key, price: row.price };
    }
  }

  return Object.values(byCurrency)
    .map(({ currency, price }) => ({
      currency,
      price: Number(price),
      iconUrl: `${TOKEN_ICON_BASE}/${currency}.svg`,
    }))
    .sort((a, b) => a.currency.localeCompare(b.currency));
}

export function getTokenIconUrl(currency) {
  return `${TOKEN_ICON_BASE}/${currency}.svg`;
}
