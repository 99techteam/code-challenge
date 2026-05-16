const PRICE_URL = "https://interview.switcheo.com/prices.json";
const ICON_URL = "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";
const NETWORK_FEE = 0.0015;

const FALLBACK_PRICES = [
  { currency: "ETH", price: 1645.9337373737374, date: "2023-08-29T07:10:52.000Z" },
  { currency: "WBTC", price: 26002.82202020202, date: "2023-08-29T07:10:52.000Z" },
  { currency: "USDC", price: 1, date: "2023-08-29T07:10:30.000Z" },
  { currency: "USD", price: 1, date: "2023-08-29T07:10:30.000Z" },
  { currency: "ATOM", price: 7.186657333333334, date: "2023-08-29T07:10:50.000Z" },
  { currency: "OSMO", price: 0.3772974333333333, date: "2023-08-29T07:10:50.000Z" },
  { currency: "SWTH", price: 0.004039850455012084, date: "2023-08-29T07:10:45.000Z" },
  { currency: "GMX", price: 36.345114372881355, date: "2023-08-29T07:10:40.000Z" },
  { currency: "OKB", price: 42.97562059322034, date: "2023-08-29T07:10:40.000Z" },
  { currency: "ZIL", price: 0.01651813559322034, date: "2023-08-29T07:10:50.000Z" }
];

const BALANCES = {
  ETH: 2.4862,
  WBTC: 0.1848,
  USDC: 18640.42,
  USD: 9250,
  ATOM: 824.25,
  OSMO: 4200,
  SWTH: 188000,
  GMX: 34.8,
  OKB: 118.45,
  ZIL: 92000
};

const state = {
  tokens: [],
  from: "ETH",
  to: "USDC",
  amount: "",
  pickerTarget: null,
  isSubmitting: false
};

const els = {
  form: document.querySelector("#swap-form"),
  fromAmount: document.querySelector("#from-amount"),
  toAmount: document.querySelector("#to-amount"),
  fromSymbol: document.querySelector("#from-symbol"),
  toSymbol: document.querySelector("#to-symbol"),
  fromIcon: document.querySelector("#from-icon"),
  toIcon: document.querySelector("#to-icon"),
  fromBalance: document.querySelector("#from-balance"),
  toBalance: document.querySelector("#to-balance"),
  fromValue: document.querySelector("#from-value"),
  toValue: document.querySelector("#to-value"),
  formError: document.querySelector("#form-error"),
  rateLine: document.querySelector("#rate-line"),
  minimumLine: document.querySelector("#minimum-line"),
  routeLine: document.querySelector("#route-line"),
  slippage: document.querySelector("#slippage"),
  submitButton: document.querySelector("#submit-button"),
  switchButton: document.querySelector("#switch-button"),
  maxButton: document.querySelector("#max-button"),
  popover: document.querySelector("#token-popover"),
  tokenList: document.querySelector("#token-list"),
  tokenSearch: document.querySelector("#token-search"),
  closePicker: document.querySelector("#close-picker"),
  toast: document.querySelector("#toast"),
  pairCount: document.querySelector("#pair-count"),
  priceSource: document.querySelector("#price-source"),
  priceStatus: document.querySelector("#price-status"),
  assetStrip: document.querySelector("#asset-strip")
};

init();

async function init() {
  bindEvents();
  setLoadingState(true);

  try {
    const response = await fetch(PRICE_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("Price request failed");
    const prices = await response.json();
    state.tokens = normalizePrices(prices);
    els.priceSource.textContent = "Live";
    els.priceStatus.textContent = "Live prices";
  } catch (error) {
    state.tokens = normalizePrices(FALLBACK_PRICES);
    els.priceSource.textContent = "Fallback";
    els.priceStatus.textContent = "Offline prices";
  } finally {
    setLoadingState(false);
    els.priceStatus.classList.add("ready");
    ensureSelectedTokens();
    renderAll();
  }
}

function bindEvents() {
  els.fromAmount.addEventListener("input", (event) => {
    state.amount = sanitizeAmount(event.target.value);
    event.target.value = state.amount;
    renderQuote();
  });

  els.slippage.addEventListener("change", renderQuote);
  els.switchButton.addEventListener("click", switchTokens);
  els.maxButton.addEventListener("click", useMaxBalance);
  els.closePicker.addEventListener("click", closePicker);
  els.popover.addEventListener("click", (event) => {
    if (event.target === els.popover) closePicker();
  });
  els.tokenSearch.addEventListener("input", renderTokenOptions);

  document.querySelectorAll("[data-picker]").forEach((button) => {
    button.addEventListener("click", () => openPicker(button.dataset.picker));
  });

  els.form.addEventListener("submit", submitSwap);
}

function normalizePrices(prices) {
  const byCurrency = new Map();

  prices.forEach((item) => {
    if (!item.currency || !Number.isFinite(Number(item.price)) || Number(item.price) <= 0) return;

    const current = byCurrency.get(item.currency);
    const nextDate = new Date(item.date || 0).getTime();
    const currentDate = current ? new Date(current.date || 0).getTime() : -1;

    if (!current || nextDate >= currentDate) {
      byCurrency.set(item.currency, {
        symbol: item.currency,
        price: Number(item.price),
        date: item.date || "",
        balance: BALANCES[item.currency] ?? makeBalance(item.currency)
      });
    }
  });

  return [...byCurrency.values()].sort((a, b) => b.price - a.price);
}

function makeBalance(symbol) {
  const seed = [...symbol].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return Number(((seed % 1800) + 25 + (seed % 19) / 100).toFixed(4));
}

function ensureSelectedTokens() {
  if (!findToken(state.from)) state.from = state.tokens[0]?.symbol;
  if (!findToken(state.to) || state.to === state.from) {
    state.to = state.tokens.find((token) => token.symbol !== state.from)?.symbol;
  }
}

function renderAll() {
  const count = state.tokens.length;
  els.pairCount.textContent = count > 1 ? `${count * (count - 1)}` : "--";
  renderFeaturedAssets();
  renderTokenSelectors();
  renderQuote();
}

function renderFeaturedAssets() {
  els.assetStrip.innerHTML = state.tokens
    .slice(0, 8)
    .map((token) => `
      <span class="asset-chip">
        <img src="${iconFor(token.symbol)}" alt="" onerror="this.style.visibility='hidden'" />
        ${token.symbol} - ${formatUsd(token.price)}
      </span>
    `)
    .join("");
}

function renderTokenSelectors() {
  const from = findToken(state.from);
  const to = findToken(state.to);
  if (!from || !to) return;

  els.fromSymbol.textContent = from.symbol;
  els.toSymbol.textContent = to.symbol;
  els.fromIcon.src = iconFor(from.symbol);
  els.toIcon.src = iconFor(to.symbol);
  els.fromIcon.onerror = () => hideBrokenImage(els.fromIcon);
  els.toIcon.onerror = () => hideBrokenImage(els.toIcon);
  els.fromBalance.textContent = `Balance ${formatToken(from.balance, from.symbol)}`;
  els.toBalance.textContent = `Balance ${formatToken(to.balance, to.symbol)}`;
}

function renderQuote() {
  const from = findToken(state.from);
  const to = findToken(state.to);
  const amount = Number(state.amount);
  const validation = validateAmount(amount, from, to);

  if (!from || !to) return;

  const grossReceive = amount > 0 ? amount * from.price / to.price : 0;
  const receive = grossReceive * (1 - NETWORK_FEE);
  const slippage = Number(els.slippage.value) / 100;
  const minimum = receive * (1 - slippage);

  els.toAmount.value = receive ? trimNumber(receive) : "";
  els.fromValue.textContent = formatUsd(amount > 0 ? amount * from.price : 0);
  els.toValue.textContent = formatUsd(receive * to.price);
  els.rateLine.textContent = `1 ${from.symbol} = ${trimNumber(from.price / to.price)} ${to.symbol}`;
  els.minimumLine.textContent = receive ? `${trimNumber(minimum)} ${to.symbol}` : "--";
  els.routeLine.textContent = `${from.symbol} -> USD -> ${to.symbol}`;
  els.formError.textContent = validation.message;
  els.submitButton.disabled = Boolean(validation.message) || state.isSubmitting;
  els.submitButton.textContent = state.isSubmitting ? "Confirming swap..." : "Review swap";
}

function validateAmount(amount, from, to) {
  if (!from || !to) return { message: "Token prices are still loading." };
  if (from.symbol === to.symbol) return { message: "Choose two different currencies." };
  if (!state.amount) return { message: "Enter an amount to preview your swap." };
  if (!Number.isFinite(amount) || amount <= 0) return { message: "Amount must be greater than zero." };
  if (amount > from.balance) return { message: `Insufficient ${from.symbol} balance.` };
  return { message: "" };
}

function openPicker(target) {
  state.pickerTarget = target;
  els.tokenSearch.value = "";
  els.popover.hidden = false;
  document.querySelector(`[data-picker="${target}"]`).setAttribute("aria-expanded", "true");
  renderTokenOptions();
  window.setTimeout(() => els.tokenSearch.focus(), 0);
}

function closePicker() {
  document.querySelectorAll("[data-picker]").forEach((button) => button.setAttribute("aria-expanded", "false"));
  state.pickerTarget = null;
  els.popover.hidden = true;
}

function renderTokenOptions() {
  const query = els.tokenSearch.value.trim().toLowerCase();
  const activeSymbol = state[state.pickerTarget] || "";

  const options = state.tokens
    .filter((token) => token.symbol.toLowerCase().includes(query))
    .map((token) => `
      <button class="token-option" type="button" role="option" aria-selected="${token.symbol === activeSymbol}" data-symbol="${token.symbol}">
        <img src="${iconFor(token.symbol)}" alt="" onerror="this.style.visibility='hidden'" />
        <span><strong>${token.symbol}</strong><span>${formatUsd(token.price)} per token</span></span>
        <em>${formatCompact(token.balance)}</em>
      </button>
    `)
    .join("");

  els.tokenList.innerHTML = options || `<p class="form-error">No matching token found.</p>`;
  els.tokenList.querySelectorAll("[data-symbol]").forEach((button) => {
    button.addEventListener("click", () => selectToken(button.dataset.symbol));
  });
}

function selectToken(symbol) {
  const otherSide = state.pickerTarget === "from" ? "to" : "from";
  if (symbol === state[otherSide]) {
    state[otherSide] = state[state.pickerTarget];
  }
  state[state.pickerTarget] = symbol;
  closePicker();
  renderTokenSelectors();
  renderQuote();
}

function switchTokens() {
  [state.from, state.to] = [state.to, state.from];
  renderTokenSelectors();
  renderQuote();
}

function useMaxBalance() {
  const from = findToken(state.from);
  state.amount = trimNumber(from?.balance || 0);
  els.fromAmount.value = state.amount;
  renderQuote();
}

async function submitSwap(event) {
  event.preventDefault();
  const from = findToken(state.from);
  const to = findToken(state.to);
  const amount = Number(state.amount);
  const validation = validateAmount(amount, from, to);
  if (validation.message) {
    els.formError.textContent = validation.message;
    return;
  }

  state.isSubmitting = true;
  renderQuote();
  await delay(1100);

  const received = Number(els.toAmount.value);
  from.balance = Number((from.balance - amount).toFixed(8));
  to.balance = Number((to.balance + received).toFixed(8));
  state.amount = "";
  els.fromAmount.value = "";
  state.isSubmitting = false;

  renderTokenSelectors();
  renderQuote();
  showToast(`Swap confirmed: ${formatToken(amount, from.symbol)} for ${formatToken(received, to.symbol)}.`);
}

function setLoadingState(isLoading) {
  els.submitButton.disabled = isLoading;
  els.submitButton.textContent = isLoading ? "Loading market..." : "Review swap";
}

function findToken(symbol) {
  return state.tokens.find((token) => token.symbol === symbol);
}

function iconFor(symbol) {
  return `${ICON_URL}/${encodeURIComponent(symbol)}.svg`;
}

function hideBrokenImage(image) {
  image.style.visibility = "hidden";
}

function sanitizeAmount(value) {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const [whole, ...rest] = cleaned.split(".");
  const decimal = rest.join("").slice(0, 8);
  return rest.length ? `${whole || "0"}.${decimal}` : whole;
}

function trimNumber(value) {
  if (!Number.isFinite(Number(value))) return "";
  return Number(value).toLocaleString("en-US", {
    maximumFractionDigits: Number(value) >= 1 ? 6 : 8,
    useGrouping: false
  });
}

function formatToken(value, symbol) {
  return `${trimNumber(value)} ${symbol}`;
}

function formatUsd(value) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1 ? 2 : 6
  });
}

function formatCompact(value) {
  return Number(value || 0).toLocaleString("en-US", {
    notation: "compact",
    maximumFractionDigits: 2
  });
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("visible");
  window.setTimeout(() => els.toast.classList.remove("visible"), 3600);
}
