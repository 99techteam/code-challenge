import type { Currency } from "@/types";
import ky from "ky";

export async function getCurrency() {
  let prices: Currency[] = await ky("https://interview.switcheo.com/prices.json").json();
  // filter out the price
  prices =  prices.filter((currency) => currency.price);
  // remove duplicate currency
  return [...new Map(prices.map(item => [item.currency, item])).values()]
}
