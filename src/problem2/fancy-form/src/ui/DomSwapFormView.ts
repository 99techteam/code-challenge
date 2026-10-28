import type { SwapFormHandlers, SwapFormView, SwapViewModel } from '../app/ports.ts';
import type { Side } from '../domain/types.ts';
import { byId } from './dom.ts';
import { createTokenAvatar } from './tokenAvatar.ts';

interface TokenControls {
  readonly button: HTMLButtonElement;
  readonly avatar: HTMLElement;
  readonly symbol: HTMLElement;
}

const TOKEN_ACTION: Record<Side, string> = { from: 'pay', to: 'receive' };

function tokenControls(side: Side): TokenControls {
  return {
    button: byId(`${side}-token-btn`, HTMLButtonElement),
    avatar: byId(`${side}-token-avatar`, HTMLElement),
    symbol: byId(`${side}-token-symbol`, HTMLElement),
  };
}

// Renders the swap form from a view model and forwards user intent to handlers.
export class DomSwapFormView implements SwapFormView {
  readonly #form = byId('swap-form', HTMLFormElement);
  readonly #amountIn = byId('amount-in', HTMLInputElement);
  readonly #amountOut = byId('amount-out', HTMLInputElement);
  readonly #amountInError = byId('amount-in-error', HTMLElement);
  readonly #usdIn = byId('usd-in', HTMLElement);
  readonly #usdOut = byId('usd-out', HTMLElement);
  readonly #flipBtn = byId('swap-direction-btn', HTMLButtonElement);
  readonly #rateLine = byId('rate-line', HTMLElement);
  readonly #rateText = byId('rate-text', HTMLElement);
  readonly #rateUsd = byId('rate-usd', HTMLElement);
  readonly #confirmBtn = byId('confirm-btn', HTMLButtonElement);
  readonly #btnLabel = byId('btn-label', HTMLElement);
  readonly #btnSpinner = byId('btn-spinner', HTMLElement);
  readonly #badge = byId('rate-badge', HTMLElement);
  readonly #tokens: Record<Side, TokenControls> = { from: tokenControls('from'), to: tokenControls('to') };
  // Last symbol drawn per side, so avatars are only rebuilt when they change.
  readonly #renderedSymbol: Record<Side, string> = { from: '', to: '' };

  bind(handlers: SwapFormHandlers): void {
    this.#form.addEventListener('submit', (event) => {
      event.preventDefault();
      handlers.onSubmit();
    });
    this.#amountIn.addEventListener('input', () => handlers.onAmountInput(this.#amountIn.value));
    this.#tokens.from.button.addEventListener('click', () => handlers.onPickToken('from'));
    this.#tokens.to.button.addEventListener('click', () => handlers.onPickToken('to'));
    this.#flipBtn.addEventListener('click', () => handlers.onFlip());
  }

  render(model: SwapViewModel): void {
    this.#renderToken('from', model.from, model.submitting);
    this.#renderToken('to', model.to, model.submitting);

    if (this.#amountIn.value !== model.amountIn) this.#amountIn.value = model.amountIn;
    this.#amountIn.readOnly = model.submitting;
    this.#amountIn.setAttribute('aria-invalid', String(model.error !== ''));
    this.#amountInError.textContent = model.error;
    this.#amountOut.value = model.amountOut;
    this.#usdIn.textContent = model.usdIn;
    this.#usdOut.textContent = model.usdOut;
    this.#flipBtn.disabled = model.submitting;

    // Toggle visibility, not display, so the line keeps its space (no layout shift).
    this.#rateLine.classList.toggle('is-empty', model.rate === null);
    if (model.rate) {
      this.#rateText.textContent = model.rate.text;
      this.#rateUsd.textContent = model.rate.usd;
    }

    this.#confirmBtn.disabled = !model.canSubmit;
    this.#btnSpinner.hidden = !model.submitting;
    this.#btnLabel.textContent = model.submitting ? 'Swapping…' : 'Confirm swap';

    this.#badge.textContent = model.badge.label;
    this.#badge.dataset.state = model.badge.state;
  }

  #renderToken(side: Side, symbol: string, disabled: boolean): void {
    const token = this.#tokens[side];
    token.button.disabled = disabled;
    if (this.#renderedSymbol[side] === symbol) return;

    this.#renderedSymbol[side] = symbol;
    token.symbol.textContent = symbol;
    token.avatar.replaceChildren(createTokenAvatar(symbol));
    token.button.setAttribute('aria-label', `${symbol}, change token to ${TOKEN_ACTION[side]}`);
  }
}
