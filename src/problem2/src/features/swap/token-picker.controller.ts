import { formatUsd } from '../../shared/format.ts';
import { getElement } from '../../shared/dom.ts';
import { setTokenIcon } from '../../shared/token-icon.ts';
import type { SwapSelection, SwapSide, TokenPrice } from '../../types/index.ts';

interface TokenPickerOptions {
  getTokens: () => TokenPrice[];
  getSelected: () => SwapSelection;
  onSelect: (side: SwapSide, symbol: string) => void;
}

export function createTokenPicker(options: TokenPickerOptions): { open: (side: SwapSide) => void } {
  const dialog = getElement<HTMLDialogElement>('#token-dialog');
  const searchInput = getElement<HTMLInputElement>('#token-search');
  const tokenList = getElement<HTMLDivElement>('#token-list');
  let activeSide: SwapSide = 'pay';

  function render(filter = ''): void {
    const query = filter.trim().toLowerCase();
    const tokens = options.getTokens().filter((token) => token.currency.toLowerCase().includes(query));
    tokenList.replaceChildren();

    if (!tokens.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-tokens';
      empty.textContent = 'No tokens match that search.';
      tokenList.append(empty);
      return;
    }

    for (const token of tokens) {
      const button = document.createElement('button');
      button.className = 'token-option';
      button.type = 'button';
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', String(token.currency === options.getSelected()[activeSide]));

      const image = document.createElement('img');
      image.alt = '';
      setTokenIcon(image, token.currency);

      const copy = document.createElement('span');
      copy.className = 'token-option-copy';
      const symbol = document.createElement('strong');
      symbol.textContent = token.currency;
      const availability = document.createElement('span');
      availability.textContent = 'Available to swap';
      copy.append(symbol, availability);

      const price = document.createElement('span');
      price.className = 'token-option-price';
      price.textContent = formatUsd(token.price);
      button.append(image, copy, price);
      button.addEventListener('click', () => {
        options.onSelect(activeSide, token.currency);
        dialog.close();
        searchInput.value = '';
      });
      tokenList.append(button);
    }
  }

  function open(side: SwapSide): void {
    activeSide = side;
    getElement<HTMLElement>('#dialog-title').textContent = side === 'pay' ? 'Choose token to pay' : 'Choose token to receive';
    searchInput.value = '';
    render();
    dialog.showModal();
    searchInput.focus();
  }

  searchInput.addEventListener('input', () => render(searchInput.value));
  getElement<HTMLButtonElement>('.close-dialog').addEventListener('click', () => dialog.close());
  return { open };
}
