import type { SwapExecutor } from '../app/ports.ts';

// Stands in for a backend swap request: resolves after a fixed latency.
export class SimulatedSwapExecutor implements SwapExecutor {
  readonly #latencyMs: number;

  constructor(latencyMs = 1400) {
    this.#latencyMs = latencyMs;
  }

  execute(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.#latencyMs));
  }
}
