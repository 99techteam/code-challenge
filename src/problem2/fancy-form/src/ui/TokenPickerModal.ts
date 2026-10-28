import type { TokenOption, TokenPicker, TokenPickRequest } from '../app/ports.ts';
import { byId, el } from './dom.ts';
import { createTokenAvatar } from './tokenAvatar.ts';

function createTokenItem(option: TokenOption, selected: boolean): HTMLLIElement {
  const button = el('button', 'token-item');
  button.type = 'button';
  button.dataset.symbol = option.symbol;
  if (selected) button.setAttribute('aria-current', 'true');

  const meta = el('span', 'token-meta');
  meta.append(el('span', 'token-name', option.symbol), el('span', 'token-price', option.price));
  button.append(createTokenAvatar(option.symbol), meta);

  const item = el('li', 'token-row');
  item.append(button);
  return item;
}

// Modal token chooser. Each pick() resolves once: with a symbol, or null when dismissed.
export class TokenPickerModal implements TokenPicker {
  readonly #backdrop = byId('token-modal', HTMLElement);
  readonly #title = byId('modal-title', HTMLElement);
  readonly #search = byId('token-search', HTMLInputElement);
  readonly #list = byId('token-list', HTMLElement);
  #request: TokenPickRequest | null = null;
  #resolve: ((symbol: string | null) => void) | null = null;
  #returnFocus: HTMLElement | null = null;

  constructor() {
    byId('modal-close', HTMLButtonElement).addEventListener('click', () => this.#settle(null));
    this.#backdrop.addEventListener('click', (event) => {
      if (event.target === this.#backdrop) this.#settle(null);
    });
    this.#search.addEventListener('input', () => this.#renderList());
    this.#search.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      const first = this.#matches()[0];
      if (first) this.#settle(first.symbol);
    });
    this.#list.addEventListener('click', (event) => {
      if (!(event.target instanceof Element)) return;
      const symbol = event.target.closest<HTMLElement>('[data-symbol]')?.dataset.symbol;
      if (symbol) this.#settle(symbol);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.#resolve) this.#settle(null);
    });
  }

  pick(request: TokenPickRequest): Promise<string | null> {
    this.#settle(null);
    this.#request = request;
    this.#returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.#title.textContent = request.title;
    this.#search.value = '';
    this.#renderList();
    this.#backdrop.hidden = false;
    this.#list.querySelector('[aria-current]')?.scrollIntoView({ block: 'nearest' });
    requestAnimationFrame(() => this.#search.focus());
    return new Promise((resolve) => {
      this.#resolve = resolve;
    });
  }

  #settle(symbol: string | null): void {
    const resolve = this.#resolve;
    if (!resolve) return;
    this.#resolve = null;
    this.#request = null;
    this.#backdrop.hidden = true;
    this.#returnFocus?.focus();
    resolve(symbol);
  }

  #matches(): readonly TokenOption[] {
    const query = this.#search.value.trim().toLowerCase();
    return (this.#request?.options ?? []).filter((option) => option.symbol.toLowerCase().includes(query));
  }

  #renderList(): void {
    const matches = this.#matches();
    if (matches.length === 0) {
      this.#list.replaceChildren(el('li', 'token-empty', 'No tokens found'));
      return;
    }
    const selected = this.#request?.selected;
    this.#list.replaceChildren(...matches.map((option) => createTokenItem(option, option.symbol === selected)));
  }
}
