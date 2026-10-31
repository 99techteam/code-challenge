import { getBalances } from '../../shared/balance.service.ts';
import { fetchTokenPrices } from '../swap/price.service.ts';
import { getUserFacingMessage, showToast } from '../../errors/app-error.ts';
import { getElement } from '../../shared/dom.ts';
import { formatAmount, formatUsd } from '../../shared/format.ts';
import type { TokenPrice } from '../../types/index.ts';

const ICON_ROOT = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/';

export function initializeBalancesController(): void {
  const list = getElement<HTMLDivElement>('#holdings-list');
  const filter = getElement<HTMLInputElement>('#holding-filter');
  const emptyMessage = getElement<HTMLElement>('#empty-holdings');
  let prices = new Map<string, number>();

  function renderHoldings(query = ''): void {
    const normalizedQuery = query.trim().toLowerCase();
    const holdings = Object.entries(getBalances())
      .filter(([symbol, amount]) => amount > 0 && symbol.toLowerCase().includes(normalizedQuery))
      .sort(([symbolA], [symbolB]) => symbolA.localeCompare(symbolB));

    list.replaceChildren();
    emptyMessage.hidden = holdings.length !== 0;

    for (const [symbol, amount] of holdings) {
      const row = document.createElement('article');
      row.className = 'holding-row';

      const identity = document.createElement('div');
      identity.className = 'holding-identity';
      identity.append(createIcon(symbol), createTokenText(symbol));

      const values = document.createElement('div');
      values.className = 'holding-values';
      const quantity = document.createElement('strong');
      quantity.textContent = `${formatAmount(amount)} ${symbol}`;
      const total = document.createElement('span');
      const price = prices.get(symbol);
      total.textContent = price ? formatUsd(amount * price) : '—';
      values.append(quantity, total);
      row.append(identity, values);
      list.append(row);
    }
  }

  function createIcon(symbol: string): HTMLElement {
    const image = document.createElement('img');
    image.className = 'holding-icon';
    image.alt = '';
    image.src = `${ICON_ROOT}${encodeURIComponent(symbol)}.svg`;
    image.onerror = () => {
      image.onerror = null;
      const fallbackIcon = document.createElement('span');
      fallbackIcon.className = 'holding-icon icon-missing';
      fallbackIcon.textContent = symbol.slice(0, 1);
      fallbackIcon.setAttribute('aria-hidden', 'true');
      image.replaceWith(fallbackIcon);
    };
    return image;
  }

  function createTokenText(symbol: string): HTMLElement {
    const text = document.createElement('div');
    text.className = 'holding-token-text';
    const name = document.createElement('strong');
    name.textContent = symbol;
    const priceLabel = document.createElement('span');
    const price = prices.get(symbol);
    priceLabel.textContent = price ? `${formatUsd(price)} per token` : 'Price unavailable';
    text.append(name, priceLabel);
    return text;
  }

  async function refresh(): Promise<void> {
    const status = getElement<HTMLElement>('#balance-status');
    try {
      const snapshot = await fetchTokenPrices();
      prices = new Map<string, number>(snapshot.tokens.map((token: TokenPrice) => [token.currency, token.price]));
      status.textContent = `Price data snapshot · ${snapshot.snapshotDate}`;
    } catch (error) {
      status.textContent = 'Prices unavailable · token amounts are still shown';
      showToast(getUserFacingMessage(error, 'Could not refresh token prices.'));
    }

    renderHoldings(filter.value);
    const totalValue = Object.entries(getBalances()).reduce((sum, [symbol, amount]) => {
      const price = prices.get(symbol);
      return sum + (price ? amount * price : 0);
    }, 0);
    getElement<HTMLElement>('#portfolio-title').textContent = formatUsd(totalValue);
    getElement<HTMLElement>('#portfolio-caption').textContent = prices.size
      ? 'Estimated total across tokens with a listed price'
      : 'Total value unavailable until market data loads';
  }

  filter.addEventListener('input', () => renderHoldings(filter.value));
  window.addEventListener('storage', () => void refresh());
  getElement<HTMLButtonElement>('#wallet-button').addEventListener('click', () => {
    showToast('Wallet connection is simulated in this demo.');
  });

  renderHoldings();
  void refresh();
}
