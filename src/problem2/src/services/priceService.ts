export interface Price {
  currency: string;
  price: number;
  date: string;
}

export class PriceService {
  constructor() {}

  static async fetchPrices() {
    const priceAPI = "https://interview.switcheo.com/prices.json";
    const response = await fetch(priceAPI);
    const jsonData = await response.json();

    // Map to store latest price by currency
    const latestMap = new Map<string, Price>();

    for (const item of jsonData) {
      const existing = latestMap.get(item.currency);

      if (!existing || new Date(item.date) > new Date(existing.date)) {
        latestMap.set(item.currency, item);
      }
    }

    // Convert back to array
    return Array.from(latestMap.values());
  }
}
