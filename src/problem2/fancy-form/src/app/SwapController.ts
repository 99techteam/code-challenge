import { formatAmount, formatUsd, parseAmount } from '../domain/amount.ts';
import { quoteSwap } from '../domain/prices.ts';
import type { Side } from '../domain/types.ts';
import { validateSwap } from '../domain/validation.ts';
import type { Notifier, PriceSource, SwapExecutor, SwapFormView, TokenPicker } from './ports.ts';
import type { SwapState } from './state.ts';
import type { Store } from './store.ts';
import { toViewModel } from './viewModel.ts';

export interface SwapControllerDeps {
  readonly store: Store<SwapState>;
  readonly prices: PriceSource;
  readonly executor: SwapExecutor;
  readonly view: SwapFormView;
  readonly picker: TokenPicker;
  readonly notifier: Notifier;
}

const PICKER_TITLES: Record<Side, string> = {
  from: 'Select token to pay',
  to: 'Select token to receive',
};

// Coordinates the swap use cases. It only knows the ports, so price feeds,
// executors and UIs can be swapped without touching this class.
export class SwapController {
  readonly #deps: SwapControllerDeps;

  constructor(deps: SwapControllerDeps) {
    this.#deps = deps;
  }

  async start(): Promise<void> {
    const { store, view } = this.#deps;
    view.bind({
      onAmountInput: (raw) => this.changeAmount(raw),
      onPickToken: (side) => void this.pickToken(side),
      onFlip: () => this.flip(),
      onSubmit: () => void this.submit(),
    });
    store.subscribe((state) => view.render(toViewModel(state)));
    view.render(toViewModel(store.state));
    await this.loadPrices();
  }

  async loadPrices(): Promise<void> {
    const dismiss = this.#deps.notifier.progress('Loading prices…');
    try {
      const { prices, origin } = await this.#deps.prices.load();
      const symbols = [...prices.keys()].sort((a, b) => a.localeCompare(b));
      this.#deps.store.update({ prices, symbols, priceStatus: origin });
    } finally {
      dismiss();
    }
  }

  changeAmount(raw: string): void {
    this.#deps.store.update({ amountIn: raw.replace(/,/g, '') });
  }

  flip(): void {
    const { from, to } = this.#deps.store.state;
    this.#deps.store.update({ from: to, to: from });
  }

  async pickToken(side: Side): Promise<void> {
    const { store, picker } = this.#deps;
    const { symbols, prices } = store.state;
    const symbol = await picker.pick({
      title: PICKER_TITLES[side],
      selected: store.state[side],
      options: symbols.map((s) => ({ symbol: s, price: formatUsd(prices.get(s)) })),
    });
    if (symbol === null) return;
    store.update(side === 'from' ? { from: symbol } : { to: symbol });
  }

  async submit(): Promise<void> {
    const { store, executor, notifier } = this.#deps;
    const { from, to, amountIn, prices, submitting } = store.state;
    const amount = parseAmount(amountIn);
    const quote = amount === null ? null : quoteSwap(prices, from, to, amount);
    const { valid } = validateSwap({ from, to, amountIn, hasRate: quote !== null });
    if (submitting || !valid || quote === null) return;

    store.update({ submitting: true });
    try {
      await executor.execute({ from, to, amountIn: quote.amountIn, amountOut: quote.amountOut });
      store.update({ submitting: false, amountIn: '' });
      notifier.notify(
        `Swapped ${formatAmount(quote.amountIn)} ${from} for ${formatAmount(quote.amountOut)} ${to}`,
        'success',
      );
    } catch {
      store.update({ submitting: false });
      notifier.notify('Swap failed. Please try again.', 'error');
    }
  }
}
