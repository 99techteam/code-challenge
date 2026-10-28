// Abstractions the application layer depends on. Concrete implementations live
// in services/ and ui/ and are wired together in main.ts.
import type { PriceTable, Side, SwapOrder } from '../domain/types.ts';

export type PriceOrigin = 'live' | 'cached';
export type PriceStatus = 'loading' | PriceOrigin;

export interface PriceSnapshot {
  readonly prices: PriceTable;
  readonly origin: PriceOrigin;
}

export interface PriceSource {
  load(): Promise<PriceSnapshot>;
}

export interface SwapExecutor {
  execute(order: SwapOrder): Promise<void>;
}

export type NoticeTone = 'success' | 'error';

export interface Notifier {
  notify(message: string, tone: NoticeTone): void;
  /** Shows an ongoing-activity message until the returned dismiss function is called. */
  progress(message: string): () => void;
}

export interface TokenOption {
  readonly symbol: string;
  readonly price: string;
}

export interface TokenPickRequest {
  readonly title: string;
  readonly selected: string;
  readonly options: readonly TokenOption[];
}

export interface TokenPicker {
  /** Resolves with the chosen symbol, or null when the picker is dismissed. */
  pick(request: TokenPickRequest): Promise<string | null>;
}

export interface SwapViewModel {
  readonly from: string;
  readonly to: string;
  readonly amountIn: string;
  readonly amountOut: string;
  readonly usdIn: string;
  readonly usdOut: string;
  readonly rate: { readonly text: string; readonly usd: string } | null;
  readonly error: string;
  readonly canSubmit: boolean;
  readonly submitting: boolean;
  readonly badge: { readonly label: string; readonly state: PriceStatus };
}

export interface SwapFormHandlers {
  onAmountInput(raw: string): void;
  onPickToken(side: Side): void;
  onFlip(): void;
  onSubmit(): void;
}

export interface SwapFormView {
  bind(handlers: SwapFormHandlers): void;
  render(model: SwapViewModel): void;
}
