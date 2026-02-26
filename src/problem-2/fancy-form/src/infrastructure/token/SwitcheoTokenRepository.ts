// ── Infrastructure (Adapter) ──────────────────────────────────────────────────
// Implements the domain port using the Switcheo public API.

import type { Token } from "../../domain/token/entities/Token";
import type { ITokenRepository } from "../../domain/token/repositories/ITokenRepository";

interface RawTokenPrice {
  currency: string;
  date: string;
  price: number;
}

export class SwitcheoTokenRepository implements ITokenRepository {
  private static readonly API_URL = "https://interview.switcheo.com/prices.json";

  async fetchAll(): Promise<Token[]> {
    const res = await fetch(SwitcheoTokenRepository.API_URL);
    if (!res.ok) throw new Error("Failed to load token prices");

    const data: RawTokenPrice[] = await res.json();

    // Keep only the latest price per currency
    const priceMap: Record<string, number> = {};
    data.forEach((d) => {
      if (!priceMap[d.currency] || new Date(d.date) > new Date()) {
        priceMap[d.currency] = d.price;
      }
    });

    return Object.entries(priceMap)
      .map(([symbol, price]): Token => ({ symbol, name: symbol, price }))
      .sort((a, b) => a.symbol.localeCompare(b.symbol));
  }
}

// Singleton
export const tokenRepository = new SwitcheoTokenRepository();