import type { PriceSnapshot, PriceSource } from '../app/ports.ts';
import type { PriceTable } from '../domain/types.ts';

// Serves a fixed price table; never fails.
export class StaticPriceSource implements PriceSource {
  readonly #prices: PriceTable;

  constructor(prices: Readonly<Record<string, number>>) {
    this.#prices = new Map(Object.entries(prices));
  }

  load(): Promise<PriceSnapshot> {
    return Promise.resolve({ prices: this.#prices, origin: 'cached' });
  }
}
