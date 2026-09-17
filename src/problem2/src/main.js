import './style.css';
import { parseAmount, formatAmount, formatUsd, exchangeRate as computeRate, dedupePrices } from './logic.js';
import { FALLBACK_PRICES } from './prices.js';

const PRICES_URL = 'https://interview.switcheo.com/prices.json';
// Token icons ship locally under public/tokens/ (served next to the page).
const ICON_BASE = 'tokens';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const state = {
  prices: new Map(), // symbol -> USD price (latest entry)
  symbols: [],       // sorted list of symbols that have a price
  from: 'ETH',
  to: 'USDC',
  amountIn: '',
  selecting: null,   // 'from' | 'to' | null
  swapping: false,
};

// ---------------------------------------------------------------------------
// Element refs
// ---------------------------------------------------------------------------
const $ = (id) => document.getElementById(id);
const els = {
  form: $('swap-form'),
  status: $('rate-status'),
  statusText: $('rate-status-text'),
  badge: $('rate-badge'),
  amountIn: $('amount-in'),
  amountOut: $('amount-out'),
  amountInError: $('amount-in-error'),
  usdIn: $('usd-in'),
  usdOut: $('usd-out'),
  fromBtn: $('from-token-btn'),
  toBtn: $('to-token-btn'),
  fromSymbol: $('from-token-symbol'),
  toSymbol: $('to-token-symbol'),
  directionBtn: $('swap-direction-btn'),
  rateLine: $('rate-line'),
  rateText: $('rate-text'),
  rateUsd: $('rate-usd'),
  confirmBtn: $('confirm-btn'),
  btnLabel: $('btn-label'),
  btnSpinner: $('btn-spinner'),
  modal: $('token-modal'),
  modalClose: $('modal-close'),
  modalTitle: $('modal-title'),
  search: $('token-search'),
  list: $('token-list'),
  toast: $('toast'),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const AVATAR_COLORS = ['#7c5cff', '#2fd08c', '#ff9f43', '#54a0ff', '#ff6b81', '#feca57', '#1dd1a1', '#a29bfe'];

function avatarColor(symbol) {
  let h = 0;
  for (let i = 0; i < symbol.length; i++) h = (h * 31 + symbol.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function initials(symbol) {
  return symbol.slice(0, 2).toUpperCase();
}

function avatarMarkup(symbol) {
  return (
    '<span class="token-avatar" style="background:' +
    avatarColor(symbol) +
    '">' +
    '<img class="token-icon" src="' +
    ICON_BASE +
    '/' +
    encodeURIComponent(symbol) +
    '.svg" alt="" />' +
    '<span class="token-fallback">' +
    initials(symbol) +
    '</span>' +
    '</span>'
  );
}

function priceOf(symbol) {
  return state.prices.get(symbol);
}

function exchangeRate() {
  return computeRate(priceOf(state.from), priceOf(state.to));
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
function renderTokenSelection() {
  els.fromSymbol.textContent = state.from;
  els.toSymbol.textContent = state.to;
  els.fromBtn.querySelector('.token-avatar').outerHTML = avatarMarkup(state.from);
  els.toBtn.querySelector('.token-avatar').outerHTML = avatarMarkup(state.to);
}

function renderRate() {
  const rate = exchangeRate();
  if (rate == null) {
    els.rateLine.hidden = true;
    return;
  }
  els.rateLine.hidden = false;
  els.rateText.textContent =
    '1 ' + state.from + ' = ' + formatAmount(rate) + ' ' + state.to;
  els.rateUsd.textContent = '(' + formatUsd(priceOf(state.from)) + ')';
}

function renderOutput() {
  const amount = parseAmount(state.amountIn);
  const rate = exchangeRate();
  if (amount == null || rate == null) {
    els.amountOut.value = '';
    els.usdIn.textContent = '≈ $0.00';
    els.usdOut.textContent = '≈ $0.00';
    return;
  }
  const out = amount * rate;
  els.amountOut.value = formatAmount(out);
  els.usdIn.textContent = '≈ ' + formatUsd(amount * priceOf(state.from));
  els.usdOut.textContent = '≈ ' + formatUsd(out * priceOf(state.to));
}

function renderTokenList() {
  const q = els.search.value.trim().toLowerCase();
  const matches = state.symbols.filter((s) => s.toLowerCase().includes(q));

  els.list.innerHTML = '';

  if (matches.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'token-empty';
    empty.textContent = 'No tokens found';
    els.list.appendChild(empty);
    return;
  }

  for (const symbol of matches) {
    const li = document.createElement('li');
    li.className = 'token-item';
    li.setAttribute('role', 'option');
    li.dataset.symbol = symbol;

    const selected = symbol === (state.selecting === 'from' ? state.from : state.to);
    if (selected) li.setAttribute('aria-selected', 'true');

    li.innerHTML =
      avatarMarkup(symbol) +
      '<span class="token-meta">' +
      '<span class="token-name">' +
      symbol +
      '</span>' +
      '<span class="token-price">' +
      formatUsd(priceOf(symbol)) +
      '</span>' +
      '</span>' +
      (selected ? '<span class="token-check">✓</span>' : '');

    li.addEventListener('click', () => chooseToken(symbol));
    els.list.appendChild(li);
  }
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
function validate() {
  const same = state.from === state.to;
  const amount = parseAmount(state.amountIn);
  let error = '';

  if (same) {
    error = 'Select two different currencies to swap.';
  } else if (state.amountIn !== '' && amount == null) {
    error = 'Enter a valid number.';
  } else if (amount !== null && amount <= 0) {
    error = 'Amount must be greater than zero.';
  }

  els.amountInError.textContent = error;
  const complete = !same && amount !== null && amount > 0;
  els.confirmBtn.disabled = !complete || state.swapping;
  return complete;
}

function refresh() {
  renderTokenSelection();
  renderRate();
  renderOutput();
  validate();
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------
function chooseToken(symbol) {
  if (state.selecting === 'from') state.from = symbol;
  else if (state.selecting === 'to') state.to = symbol;
  state.selecting = null;
  closeModal();
  refresh();
}

function openModal(side) {
  state.selecting = side;
  els.modalTitle.textContent = side === 'from' ? 'Select token to pay' : 'Select token to receive';
  els.search.value = '';
  els.modal.hidden = false;
  renderTokenList();
  requestAnimationFrame(() => els.search.focus());
}

function closeModal() {
  state.selecting = null;
  els.modal.hidden = true;
}

function swapDirection() {
  [state.from, state.to] = [state.to, state.from];
  refresh();
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.hidden = false;
  els.toast.classList.remove('is-visible');
  void els.toast.offsetWidth; // reflow so the enter transition replays
  els.toast.classList.add('is-visible');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    els.toast.classList.remove('is-visible');
    els.toast.hidden = true;
  }, 3200);
}

async function handleSubmit(e) {
  e.preventDefault();
  if (!validate()) return;

  const amount = parseAmount(state.amountIn);
  const out = amount * exchangeRate();

  // Simulate a backend swap request.
  state.swapping = true;
  els.confirmBtn.disabled = true;
  els.btnSpinner.hidden = false;
  els.btnLabel.textContent = 'Swapping…';

  await new Promise((resolve) => setTimeout(resolve, 1400));

  state.swapping = false;
  els.btnSpinner.hidden = true;
  els.btnLabel.textContent = 'Confirm swap';
  els.confirmBtn.disabled = false;

  showToast(
    'Swapped ' +
      formatAmount(amount) +
      ' ' +
      state.from +
      ' for ' +
      formatAmount(out) +
      ' ' +
      state.to,
  );

  state.amountIn = '';
  els.amountIn.value = '';
  refresh();
}

// ---------------------------------------------------------------------------
// Price loading
// ---------------------------------------------------------------------------
async function fetchPrices() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(PRICES_URL, { signal: controller.signal });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function loadPrices() {
  els.status.hidden = false;
  els.statusText.textContent = 'Loading prices…';

  let prices;
  try {
    const rows = await fetchPrices();
    prices = dedupePrices(rows);
    els.badge.textContent = 'Live rates';
  } catch {
    // Offline / blocked / CORS: fall back to the bundled snapshot so the app
    // still loads and stays fully interactive.
    prices = new Map(Object.entries(FALLBACK_PRICES));
    els.badge.textContent = 'Cached rates';
  }

  state.prices = prices;
  state.symbols = [...prices.keys()].sort((a, b) => a.localeCompare(b));
  els.status.hidden = true;
  refresh();
}

// ---------------------------------------------------------------------------
// Wire-up
// ---------------------------------------------------------------------------
els.form.addEventListener('submit', handleSubmit);
els.amountIn.addEventListener('input', () => {
  state.amountIn = els.amountIn.value.replace(/,/g, '');
  els.amountIn.value = state.amountIn;
  renderOutput();
  validate();
});
els.fromBtn.addEventListener('click', () => openModal('from'));
els.toBtn.addEventListener('click', () => openModal('to'));
els.directionBtn.addEventListener('click', swapDirection);
els.modalClose.addEventListener('click', closeModal);
els.modal.addEventListener('click', (e) => {
  if (e.target === els.modal) closeModal();
});
els.search.addEventListener('input', renderTokenList);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !els.modal.hidden) closeModal();
});

// Broken token icons fall back to the initial-letter avatar.
document.addEventListener(
  'error',
  (e) => {
    if (e.target.classList && e.target.classList.contains('token-icon')) {
      const avatar = e.target.closest('.token-avatar');
      if (avatar) avatar.classList.add('is-fallback');
    }
  },
  true,
);

refresh();
loadPrices();
