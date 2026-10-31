import { getBalance } from '../../shared/balance.service.ts';
import { fetchTokenPrices } from './price.service.ts';
import { executeDemoSwap } from './swap.service.ts';
import { getUserFacingMessage, showToast } from '../../errors/app-error.ts';
import { getElement, getElements } from '../../shared/dom.ts';
import { formatAmount, formatUsd } from '../../shared/format.ts';
import { setTokenIcon } from '../../shared/token-icon.ts';
import type { SwapSide, SwapState } from '../../types/index.ts';
import { validateSwap } from './validation.ts';
import { createTokenPicker } from './token-picker.controller.ts';

const REFRESH_MS = 5 * 60 * 1000;

export function initializeSwapController(): void {
  const state: SwapState = {
    tokens: [],
    selected: { pay: 'USDC', receive: 'ETH' },
    loading: false,
  };
  const payInput = getElement<HTMLInputElement>('#pay-amount');
  const receiveInput = getElement<HTMLInputElement>('#receive-amount');
  const submitButton = getElement<HTMLButtonElement>('#submit-button');
  const errorBox = getElement<HTMLElement>('#form-error');

  const tokenPicker = createTokenPicker({
    getTokens: () => state.tokens,
    getSelected: () => state.selected,
    onSelect: (side, symbol) => {
      state.selected[side] = symbol;
      render();
    },
  });

  function renderSelectedTokens(): void {
    for (const side of ['pay', 'receive'] as const) {
      const symbol = state.selected[side];
      const image = getElement<HTMLImageElement>(`#${side}-icon`);
      setTokenIcon(image, symbol);
      getElement<HTMLElement>(`#${side}-symbol`).textContent = symbol;
      getElement<HTMLElement>(`#${side}-balance`).textContent = `${formatAmount(getBalance(symbol), 4)} ${symbol}`;
    }
  }

  function render(): void {
    renderSelectedTokens();
    errorBox.textContent = '';

    const payToken = state.tokens.find((token) => token.currency === state.selected.pay);
    const receiveToken = state.tokens.find((token) => token.currency === state.selected.receive);
    const rate = payToken && receiveToken ? payToken.price / receiveToken.price : Number.NaN;
    getElement<HTMLElement>('#exchange-rate').textContent = Number.isFinite(rate)
      ? `1 ${state.selected.pay} = ${formatAmount(rate, 8)} ${state.selected.receive}`
      : 'Rate unavailable';

    const validation = validateSwap(payInput.value, state.selected, state.tokens, getBalance(state.selected.pay));
    errorBox.textContent = validation.valid ? '' : validation.message;
    if (validation.valid) {
      receiveInput.value = formatAmount(validation.quote.receiveAmount, 8);
      $('#pay-usd').textContent = `≈ ${formatUsd(validation.quote.payAmount * (payToken?.price ?? 0))}`;
      $('#receive-usd').textContent = `≈ ${formatUsd(validation.quote.receiveAmount * (receiveToken?.price ?? 0))}`;
    } else {
      receiveInput.value = '';
      if (validation.reason === 'empty' || validation.reason === 'invalid') {
        $('#pay-usd').textContent = '≈ $0.00';
        $('#receive-usd').textContent = '≈ $0.00';
      }
    }

    submitButton.disabled = state.loading || !validation.valid;
    submitButton.classList.toggle('is-loading', state.loading);
    submitButton.querySelector('.button-label')!.textContent = state.loading
      ? 'Preparing your swap…'
      : validation.valid ? 'Review swap' : buttonMessage(validation.reason);
  }

  function buttonMessage(reason: 'empty' | 'invalid' | 'unavailable' | 'same-token' | 'balance'): string {
    switch (reason) {
      case 'invalid': return 'Enter a valid amount';
      case 'unavailable': return 'Price unavailable for this pair';
      case 'same-token': return 'Choose two different tokens';
      case 'balance': return 'Insufficient demo balance';
      default: return 'Enter an amount';
    }
  }

  async function refreshPrices(): Promise<void> {
    const status = getElement<HTMLElement>('#feed-status');
    if (!state.tokens.length) status.textContent = 'Connecting to market data';
    try {
      const snapshot = await fetchTokenPrices();
      state.tokens = snapshot.tokens;
      status.textContent = `Price data snapshot · ${snapshot.snapshotDate}`;
      getElement<HTMLElement>('#rate-source').textContent = 'Switcheo price feed';
      if (!state.tokens.some((token) => token.currency === state.selected.pay)) {
        state.selected.pay = state.tokens[0].currency;
      }
      if (!state.tokens.some((token) => token.currency === state.selected.receive) || state.selected.receive === state.selected.pay) {
        state.selected.receive = state.tokens.find((token) => token.currency !== state.selected.pay)?.currency ?? state.selected.pay;
      }
      render();
    } catch (error) {
      status.textContent = 'Market data unavailable';
      getElement<HTMLElement>('#exchange-rate').textContent = 'Unable to load rates';
      showToast(getUserFacingMessage(error, 'Could not load token prices.'));
    } finally {
      window.setTimeout(() => void refreshPrices(), REFRESH_MS);
    }
  }

  async function submitSwap(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    render();
    const validation = validateSwap(payInput.value, state.selected, state.tokens, getBalance(state.selected.pay));
    if (!validation.valid) return;

    state.loading = true;
    render();
    try {
      await executeDemoSwap(validation.quote);
      getElement<HTMLElement>('#result-copy').textContent =
        `You swapped ${formatAmount(validation.quote.payAmount)} ${validation.quote.paySymbol} for ${formatAmount(validation.quote.receiveAmount)} ${validation.quote.receiveSymbol}. This was a demo only; no assets moved.`;
      getElement<HTMLDialogElement>('#result-dialog').showModal();
      payInput.value = '';
    } catch (error) {
      showToast(getUserFacingMessage(error, 'The simulated swap could not be saved. Please try again.'));
    } finally {
      state.loading = false;
      render();
    }
  }

  payInput.addEventListener('input', render);
  getElements<HTMLButtonElement>('.token-select').forEach((button) => {
    button.addEventListener('click', () => tokenPicker.open(button.dataset.side as SwapSide));
  });
  getElement<HTMLButtonElement>('#flip-button').addEventListener('click', () => {
    [state.selected.pay, state.selected.receive] = [state.selected.receive, state.selected.pay];
    render();
  });
  getElement<HTMLButtonElement>('#max-button').addEventListener('click', () => {
    payInput.value = String(getBalance(state.selected.pay));
    render();
    payInput.focus();
  });
  getElement<HTMLButtonElement>('#wallet-button').addEventListener('click', () => showToast('Wallet connection is simulated in this demo.'));
  getElement<HTMLButtonElement>('#settings-button').addEventListener('click', () => showToast('Indicative quotes use the latest available price in the supplied feed.'));
  getElement<HTMLFormElement>('#swap-form').addEventListener('submit', (event) => void submitSwap(event));
  getElement<HTMLButtonElement>('#result-close').addEventListener('click', () => getElement<HTMLDialogElement>('#result-dialog').close());
  getElement<HTMLDialogElement>('#result-dialog').addEventListener('click', (event) => {
    if (event.target === getElement<HTMLDialogElement>('#result-dialog')) {
      getElement<HTMLDialogElement>('#result-dialog').close();
    }
  });

  render();
  void refreshPrices();
}

function $(selector: string): HTMLElement {
  return getElement<HTMLElement>(selector);
}
