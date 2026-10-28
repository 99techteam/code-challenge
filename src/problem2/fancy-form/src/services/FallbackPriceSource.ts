import type { PriceSnapshot, PriceSource } from '../app/ports.ts';

// Tries the primary source and falls back to the secondary one if it fails
// (offline, blocked, CORS…), so the app always has prices to work with.
export class FallbackPriceSource implements PriceSource {
  readonly #primary: PriceSource;
  readonly #fallback: PriceSource;

  constructor(primary: PriceSource, fallback: PriceSource) {
    this.#primary = primary;
    this.#fallback = fallback;
  }

  async load(): Promise<PriceSnapshot> {
    try {
      return await this.#primary.load();
    } catch {
      return this.#fallback.load();
    }
  }
}
