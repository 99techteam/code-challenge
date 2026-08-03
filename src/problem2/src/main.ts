import "./style.css";
import {
  buildRouteQuotes,
  chooseDefaultPair,
  chooseRecommendedRoute,
  formatPrice,
  formatTokenAmount,
  formatUsd,
  loadTokens,
  popularTokens,
  projectRouteOutput,
  validateAmount,
  type RouteId,
  type RouteQuote,
  type SwapIntent,
  type Token,
} from "./domain";

type SwapSide = "from" | "to";

const INTENT_DESCRIPTIONS: Record<SwapIntent, string> = {
  maximize: "Prioritizes the largest expected token output, even when the route uses more venues.",
  balanced: "Balances expected output, execution confidence, and simulated settlement speed.",
  protect: "Prioritizes confidence and low variance over the absolute maximum output.",
};

const ALLOCATION_COLORS = ["violet", "mint", "amber"];

function requiredElement<T extends Element>(
  selector: string,
  parent: ParentNode = document,
): T {
  const element = parent.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Required element not found: ${selector}`);
  }
  return element;
}

const elements = {
  html: document.documentElement,
  form: requiredElement<HTMLFormElement>("#swap-form"),
  amountInput: requiredElement<HTMLInputElement>("#from-amount"),
  outputInput: requiredElement<HTMLInputElement>("#to-amount"),
  amountError: requiredElement<HTMLParagraphElement>("#amount-error"),
  fromField: requiredElement<HTMLElement>("#from-field"),
  fromBalance: requiredElement<HTMLElement>("#from-balance"),
  fromUsd: requiredElement<HTMLElement>("#from-usd-value"),
  toUsd: requiredElement<HTMLElement>("#to-usd-value"),
  fromTrigger: requiredElement<HTMLButtonElement>("#from-token-trigger"),
  toTrigger: requiredElement<HTMLButtonElement>("#to-token-trigger"),
  fromAvatar: requiredElement<HTMLElement>("#from-token-avatar"),
  toAvatar: requiredElement<HTMLElement>("#to-token-avatar"),
  fromSymbol: requiredElement<HTMLElement>("#from-token-symbol"),
  toSymbol: requiredElement<HTMLElement>("#to-token-symbol"),
  fromName: requiredElement<HTMLElement>("#from-token-name"),
  toName: requiredElement<HTMLElement>("#to-token-name"),
  maxButton: requiredElement<HTMLButtonElement>("#max-button"),
  reverseButton: requiredElement<HTMLButtonElement>("#reverse-button"),
  submitButton: requiredElement<HTMLButtonElement>("#submit-button"),
  submitLabel: requiredElement<HTMLElement>(".submit-label"),
  exchangeRate: requiredElement<HTMLElement>("#exchange-rate"),
  feeValue: requiredElement<HTMLElement>("#fee-value"),
  minimumValue: requiredElement<HTMLElement>("#minimum-value"),
  impactValue: requiredElement<HTMLElement>("#impact-value"),
  quotePanel: requiredElement<HTMLElement>("#quote-panel"),
  routeValue: requiredElement<HTMLElement>("#route-value"),
  intelligencePanel: requiredElement<HTMLElement>("#intelligence-panel"),
  intentOptions: [...document.querySelectorAll<HTMLButtonElement>("[data-intent]")],
  intentDescription: requiredElement<HTMLElement>("#intent-description"),
  quoteModeLabel: requiredElement<HTMLElement>("#quote-mode-label"),
  routeComparison: requiredElement<HTMLElement>("#route-comparison"),
  confidenceRing: requiredElement<HTMLElement>("#confidence-ring"),
  confidenceValue: requiredElement<HTMLElement>("#confidence-value"),
  routeReasonTitle: requiredElement<HTMLElement>("#route-reason-title"),
  routeReason: requiredElement<HTMLElement>("#route-reason"),
  allocationTrack: requiredElement<HTMLElement>("#allocation-track"),
  allocationLegend: requiredElement<HTMLElement>("#allocation-legend"),
  allocationLabel: requiredElement<HTMLElement>("#allocation-label"),
  scenarioSlider: requiredElement<HTMLInputElement>("#scenario-slider"),
  scenarioMove: requiredElement<HTMLOutputElement>("#scenario-move"),
  scenarioOutput: requiredElement<HTMLElement>("#scenario-output"),
  scenarioDelta: requiredElement<HTMLElement>("#scenario-delta"),
  quoteCountdown: requiredElement<HTMLElement>("#quote-countdown"),
  rateToggle: requiredElement<HTMLButtonElement>("#rate-toggle"),
  refreshButton: requiredElement<HTMLButtonElement>("#refresh-prices"),
  priceState: requiredElement<HTMLElement>("#price-state"),
  priceStateText: requiredElement<HTMLElement>("#price-state-text"),
  priceUpdatedAt: requiredElement<HTMLTimeElement>("#price-updated-at"),
  assetCount: requiredElement<HTMLElement>("#asset-count"),
  dataSourceLabel: requiredElement<HTMLElement>("#data-source-label"),
  themeToggle: requiredElement<HTMLButtonElement>("#theme-toggle"),
  tokenDialog: requiredElement<HTMLDialogElement>("#token-dialog"),
  tokenSearch: requiredElement<HTMLInputElement>("#token-search"),
  tokenList: requiredElement<HTMLElement>("#token-list"),
  popularTokens: requiredElement<HTMLElement>("#popular-tokens"),
  emptyTokenState: requiredElement<HTMLElement>("#empty-token-state"),
  closeTokenDialog: requiredElement<HTMLButtonElement>("#close-token-dialog"),
  successDialog: requiredElement<HTMLDialogElement>("#success-dialog"),
  successSummary: requiredElement<HTMLElement>("#success-summary"),
  receiptPaid: requiredElement<HTMLElement>("#receipt-paid"),
  receiptReceived: requiredElement<HTMLElement>("#receipt-received"),
  receiptReference: requiredElement<HTMLElement>("#receipt-reference"),
  closeSuccessDialog: requiredElement<HTMLButtonElement>("#close-success-dialog"),
  toastRegion: requiredElement<HTMLElement>("#toast-region"),
};

let tokens: Token[] = [];
let fromToken: Token | null = null;
let toToken: Token | null = null;
let quote: RouteQuote | null = null;
let routeQuotes: RouteQuote[] = [];
let swapIntent: SwapIntent = "balanced";
let manuallySelectedRouteId: RouteId | null = null;
let scenarioMovePercent = 0;
let quoteExpiresAt = 0;
let quoteTimer: number | null = null;
let activePickerSide: SwapSide = "from";
let slippagePercent = 0.5;
let invertedRate = false;
let isLoadingPrices = false;
let isSubmitting = false;
let refreshController: AbortController | null = null;

function tokenAvatarMarkup(token: Token, compact = false): string {
  const fallback = token.symbol.slice(0, 2).toUpperCase();
  return `
    <span class="token-image-shell ${compact ? "compact" : ""}">
      <img
        src="${token.iconUrl}"
        alt=""
        loading="lazy"
        decoding="async"
        data-token-image
      />
      <span class="token-fallback" aria-hidden="true">${fallback}</span>
    </span>
  `;
}

function wireImageFallbacks(parent: ParentNode = document): void {
  parent.querySelectorAll<HTMLImageElement>("[data-token-image]").forEach((image) => {
    const revealFallback = () => {
      image.hidden = true;
      image.parentElement?.classList.add("image-failed");
    };

    image.addEventListener("error", revealFallback, { once: true });

    if (image.complete && image.naturalWidth === 0) {
      revealFallback();
    }
  });
}

function renderSelectedToken(side: SwapSide, token: Token): void {
  const isFrom = side === "from";
  const avatar = isFrom ? elements.fromAvatar : elements.toAvatar;
  const symbol = isFrom ? elements.fromSymbol : elements.toSymbol;
  const name = isFrom ? elements.fromName : elements.toName;

  avatar.innerHTML = tokenAvatarMarkup(token);
  symbol.textContent = token.symbol;
  name.textContent = token.name;
  wireImageFallbacks(avatar);
}

function setPriceState(
  state: "loading" | "live" | "fallback" | "error",
  message: string,
  loadedAt?: Date,
): void {
  elements.priceState.dataset.state = state;
  elements.priceStateText.textContent = message;

  if (loadedAt) {
    elements.priceUpdatedAt.dateTime = loadedAt.toISOString();
    elements.priceUpdatedAt.textContent = loadedAt.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    elements.priceUpdatedAt.removeAttribute("datetime");
    elements.priceUpdatedAt.textContent = "";
  }
}

function setLoadingPrices(loading: boolean): void {
  isLoadingPrices = loading;
  elements.refreshButton.classList.toggle("is-spinning", loading);
  elements.refreshButton.disabled = loading;
}

async function refreshPrices({ preserveSelection = true } = {}): Promise<void> {
  refreshController?.abort();
  refreshController = new AbortController();

  setLoadingPrices(true);
  setPriceState("loading", "Loading market prices…");

  const previousFrom = fromToken?.symbol.toUpperCase();
  const previousTo = toToken?.symbol.toUpperCase();

  try {
    const result = await loadTokens(refreshController.signal);
    tokens = result.tokens;

    const pair = chooseDefaultPair(tokens);
    fromToken =
      (preserveSelection &&
        tokens.find((token) => token.symbol.toUpperCase() === previousFrom)) ||
      pair[0];
    toToken =
      (preserveSelection &&
        tokens.find((token) => token.symbol.toUpperCase() === previousTo)) ||
      pair[1];

    if (fromToken.symbol.toUpperCase() === toToken.symbol.toUpperCase()) {
      toToken = tokens.find(
        (token) =>
          token.symbol.toUpperCase() !== fromToken?.symbol.toUpperCase(),
      ) ?? pair[1];
    }

    renderSelectedToken("from", fromToken);
    renderSelectedToken("to", toToken);

    elements.assetCount.textContent = String(tokens.length);
    elements.dataSourceLabel.textContent =
      result.source === "live" ? "Switcheo live" : "Resilient fallback";

    setPriceState(
      result.source,
      result.source === "live"
        ? "Live prices connected"
        : "Fallback prices active",
      result.loadedAt,
    );

    if (result.warning) {
      showToast(result.warning, "warning");
    }

    updateForm();
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return;
    }

    setPriceState("error", "Could not load prices");
    showToast("Price refresh failed. Please try again.", "error");
  } finally {
    setLoadingPrices(false);
  }
}

function currentAmount(): number {
  return Number(elements.amountInput.value);
}

function amountError(): string | null {
  if (!fromToken) return "Select a source token.";
  return validateAmount(elements.amountInput.value, fromToken.balance);
}

function updateBalance(): void {
  elements.fromBalance.textContent = fromToken
    ? `${formatTokenAmount(fromToken.balance, 5)} ${fromToken.symbol}`
    : "—";
}

function updateSubmitState(error: string | null): void {
  const hasAmount = elements.amountInput.value.trim().length > 0;
  const valid = !error && Boolean(fromToken && toToken && quote);

  elements.submitButton.disabled =
    !valid || isLoadingPrices || isSubmitting;

  if (isSubmitting) {
    elements.submitLabel.textContent = "Routing swap…";
    return;
  }

  if (isLoadingPrices) {
    elements.submitLabel.textContent = "Loading prices…";
    return;
  }

  if (!hasAmount) {
    elements.submitLabel.textContent = "Enter an amount";
    return;
  }

  if (error) {
    elements.submitLabel.textContent = "Review amount";
    return;
  }

  elements.submitLabel.textContent =
    `Review ${quote?.shortLabel ?? ""} route`;
}

function stopQuoteTimer(): void {
  if (quoteTimer !== null) {
    window.clearInterval(quoteTimer);
    quoteTimer = null;
  }
}

function startQuoteTimer(): void {
  stopQuoteTimer();
  quoteExpiresAt = Date.now() + 15_000;

  const tick = () => {
    const remaining = Math.max(0, Math.ceil((quoteExpiresAt - Date.now()) / 1000));
    elements.quoteCountdown.textContent = `${remaining}s`;

    if (remaining === 0) {
      quoteExpiresAt = Date.now() + 15_000;
      elements.quoteCountdown.textContent = "15s";
      elements.intelligencePanel.classList.remove("quote-flash");
      requestAnimationFrame(() =>
        elements.intelligencePanel.classList.add("quote-flash"),
      );
    }
  };

  tick();
  quoteTimer = window.setInterval(tick, 1000);
}

function routeById(routeId: RouteId | null): RouteQuote | null {
  return routeQuotes.find((candidate) => candidate.id === routeId) ?? null;
}

function selectedRouteForIntent(): RouteQuote | null {
  if (routeQuotes.length === 0) return null;
  return (
    routeById(manuallySelectedRouteId) ??
    chooseRecommendedRoute(routeQuotes, swapIntent)
  );
}

function renderRouteComparison(): void {
  if (!quote) {
    elements.routeComparison.replaceChildren();
    return;
  }

  const recommended = chooseRecommendedRoute(routeQuotes, swapIntent);

  elements.routeComparison.innerHTML = routeQuotes
    .map((route) => {
      const selected = route.id === quote?.id;
      const delta =
        quote && route.id !== quote.id
          ? route.netOutput - quote.netOutput
          : 0;

      return `
        <button
          class="route-option ${selected ? "selected" : ""}"
          type="button"
          role="radio"
          aria-checked="${selected}"
          data-route-id="${route.id}"
        >
          <span class="route-option-top">
            <span>
              <strong>${route.shortLabel}</strong>
              ${
                route.id === recommended.id
                  ? '<small class="recommended-tag">RECOMMENDED</small>'
                  : ""
              }
            </span>
            <span class="route-confidence">${route.confidencePercent.toFixed(0)}%</span>
          </span>
          <span class="route-output">
            ${formatTokenAmount(route.netOutput, 8)}
            <small>${toToken?.symbol ?? ""}</small>
          </span>
          <span class="route-meta">
            ${route.latencySeconds.toFixed(1)}s · ${route.riskLabel} risk
            ${
              delta === 0
                ? ""
                : ` · ${delta > 0 ? "+" : ""}${formatTokenAmount(delta, 5)}`
            }
          </span>
        </button>
      `;
    })
    .join("");
}

function renderAllocation(): void {
  if (!quote) {
    elements.allocationTrack.replaceChildren();
    elements.allocationLegend.replaceChildren();
    elements.allocationLabel.textContent = "—";
    return;
  }

  elements.allocationLabel.textContent =
    quote.allocation.length === 1
      ? "Single venue"
      : `${quote.allocation.length} venues`;

  elements.allocationTrack.innerHTML = quote.allocation
    .map(
      (item, index) => `
        <span
          class="allocation-segment ${ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]}"
          style="width: ${item.percentage}%"
          title="${item.venue}: ${item.percentage}%"
        ></span>
      `,
    )
    .join("");

  elements.allocationLegend.innerHTML = quote.allocation
    .map(
      (item, index) => `
        <span>
          <i class="${ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]}"></i>
          ${item.venue} ${item.percentage}%
        </span>
      `,
    )
    .join("");
}

function renderScenario(): void {
  const signedMove =
    scenarioMovePercent > 0
      ? `+${scenarioMovePercent.toFixed(1)}%`
      : `${scenarioMovePercent.toFixed(1)}%`;
  elements.scenarioMove.textContent = signedMove;

  if (!quote || !toToken) {
    elements.scenarioOutput.textContent = "—";
    elements.scenarioDelta.textContent = "No active quote";
    return;
  }

  const projected = projectRouteOutput(quote, scenarioMovePercent);
  const delta = projected - quote.netOutput;
  elements.scenarioOutput.textContent =
    `${formatTokenAmount(projected, 8)} ${toToken.symbol}`;

  if (Math.abs(delta) < 1e-12) {
    elements.scenarioDelta.textContent = "No simulated movement";
    elements.scenarioDelta.dataset.tone = "neutral";
  } else {
    elements.scenarioDelta.textContent =
      `${delta > 0 ? "+" : ""}${formatTokenAmount(delta, 8)} ${toToken.symbol} vs current quote`;
    elements.scenarioDelta.dataset.tone = delta > 0 ? "positive" : "negative";
  }
}

function renderRouteIntelligence(): void {
  if (!quote) {
    elements.intelligencePanel.classList.remove("has-intelligence");
    renderRouteComparison();
    renderAllocation();
    renderScenario();
    stopQuoteTimer();
    return;
  }

  const recommended = chooseRecommendedRoute(routeQuotes, swapIntent);
  const manuallyOverridden = quote.id !== recommended.id;

  elements.confidenceRing.style.setProperty(
    "--confidence",
    quote.confidencePercent.toFixed(0),
  );
  elements.confidenceValue.textContent =
    `${quote.confidencePercent.toFixed(0)}%`;
  elements.routeReasonTitle.textContent = manuallyOverridden
    ? `${quote.label} manually selected`
    : `${quote.label} matches your intent`;
  elements.routeReason.textContent = manuallyOverridden
    ? `${quote.description} The intent engine would otherwise recommend ${recommended.label}.`
    : quote.description;

  renderRouteComparison();
  renderAllocation();
  renderScenario();
  elements.intelligencePanel.classList.add("has-intelligence");
  startQuoteTimer();
}

function renderEmptyQuote(): void {
  quote = null;
  routeQuotes = [];
  elements.outputInput.value = "";
  elements.fromUsd.textContent = "≈ $0.00";
  elements.toUsd.textContent = "≈ $0.00";
  elements.exchangeRate.textContent = "—";
  elements.routeValue.textContent = "Intent engine";
  elements.feeValue.textContent = "—";
  elements.minimumValue.textContent = "—";
  elements.impactValue.textContent = "—";
  elements.quotePanel.classList.remove("has-quote");
  renderRouteIntelligence();
}

function updateQuote(): void {
  if (!fromToken || !toToken) {
    renderEmptyQuote();
    return;
  }

  const error = amountError();
  const amount = currentAmount();

  if (error || !Number.isFinite(amount)) {
    renderEmptyQuote();
    return;
  }

  routeQuotes = buildRouteQuotes(
    amount,
    fromToken,
    toToken,
    slippagePercent,
  );
  quote = selectedRouteForIntent();

  if (!quote) {
    renderEmptyQuote();
    return;
  }

  elements.outputInput.value = formatTokenAmount(quote.netOutput, 8);
  elements.fromUsd.textContent = `≈ ${formatUsd(quote.usdValue)}`;
  elements.toUsd.textContent = `≈ ${formatUsd(
    quote.netOutput * toToken.price,
  )}`;

  const displayedRate = invertedRate ? 1 / quote.rate : quote.rate;
  const base = invertedRate ? toToken : fromToken;
  const counter = invertedRate ? fromToken : toToken;

  elements.exchangeRate.textContent =
    `1 ${base.symbol} = ${formatTokenAmount(displayedRate, 8)} ${counter.symbol}`;
  elements.routeValue.textContent =
    `${quote.label} · ${quote.latencySeconds.toFixed(1)}s`;
  elements.feeValue.textContent =
    `${formatTokenAmount(quote.serviceFee, 8)} ${toToken.symbol}`;
  elements.minimumValue.textContent =
    `${formatTokenAmount(quote.minimumReceived, 8)} ${toToken.symbol}`;
  elements.impactValue.textContent =
    `${quote.priceImpactPercent.toFixed(2)}%`;
  elements.impactValue.classList.toggle(
    "warning",
    quote.priceImpactPercent >= 0.5,
  );

  elements.quotePanel.classList.add("has-quote");
  renderRouteIntelligence();
}

function updateForm(): void {
  updateBalance();

  const error = amountError();
  const shouldShowError =
    elements.amountInput.dataset.touched === "true" &&
    Boolean(elements.amountInput.value.trim());

  elements.amountError.textContent = shouldShowError ? error ?? "" : "";
  elements.fromField.classList.toggle(
    "has-error",
    shouldShowError && Boolean(error),
  );

  updateQuote();
  updateSubmitState(error);
}

function sanitizeAmountInput(value: string): string {
  let output = value.replace(/,/g, ".").replace(/[^\d.]/g, "");
  const decimalIndex = output.indexOf(".");

  if (decimalIndex !== -1) {
    output =
      output.slice(0, decimalIndex + 1) +
      output.slice(decimalIndex + 1).replace(/\./g, "");
  }

  if (output.startsWith("00") && !output.startsWith("0.")) {
    output = output.replace(/^0+/, "0");
  }

  return output;
}

function setAmount(value: string, markTouched = true): void {
  elements.amountInput.value = value;
  if (markTouched) {
    elements.amountInput.dataset.touched = "true";
  }
  updateForm();
}

function reversePair(): void {
  if (!fromToken || !toToken) return;
  manuallySelectedRouteId = null;

  const previousAmount = currentAmount();
  const previousQuote = quote;

  [fromToken, toToken] = [toToken, fromToken];

  renderSelectedToken("from", fromToken);
  renderSelectedToken("to", toToken);

  if (
    Number.isFinite(previousAmount) &&
    previousAmount > 0 &&
    previousQuote
  ) {
    const newAmount = Math.min(
      previousQuote.netOutput,
      fromToken.balance,
    );
    elements.amountInput.value = formatTokenAmount(newAmount, 8).replace(
      /,/g,
      "",
    );
  }

  elements.reverseButton.classList.remove("rotate-once");
  requestAnimationFrame(() =>
    elements.reverseButton.classList.add("rotate-once"),
  );

  updateForm();
}

function filteredTokens(query: string): Token[] {
  const normalized = query.trim().toLowerCase();
  const excluded =
    activePickerSide === "from"
      ? toToken?.symbol.toUpperCase()
      : fromToken?.symbol.toUpperCase();

  return tokens.filter((token) => {
    if (token.symbol.toUpperCase() === excluded) {
      return false;
    }

    if (!normalized) return true;

    return (
      token.symbol.toLowerCase().includes(normalized) ||
      token.name.toLowerCase().includes(normalized)
    );
  });
}

function renderPopularTokens(): void {
  elements.popularTokens.innerHTML = popularTokens(tokens)
    .filter((token) => {
      const excluded =
        activePickerSide === "from"
          ? toToken?.symbol.toUpperCase()
          : fromToken?.symbol.toUpperCase();
      return token.symbol.toUpperCase() !== excluded;
    })
    .slice(0, 4)
    .map(
      (token) => `
        <button
          class="popular-token"
          type="button"
          data-token-symbol="${token.symbol}"
        >
          ${tokenAvatarMarkup(token, true)}
          <span>${token.symbol}</span>
        </button>
      `,
    )
    .join("");

  wireImageFallbacks(elements.popularTokens);
}

function renderTokenList(query = ""): void {
  const visibleTokens = filteredTokens(query);
  elements.emptyTokenState.hidden = visibleTokens.length > 0;

  elements.tokenList.innerHTML = visibleTokens
    .map(
      (token) => `
        <button
          class="token-option"
          type="button"
          data-token-symbol="${token.symbol}"
        >
          ${tokenAvatarMarkup(token)}
          <span class="token-option-copy">
            <strong>${token.symbol}</strong>
            <small>${token.name}</small>
          </span>
          <span class="token-price-copy">
            <strong>${formatPrice(token.price)}</strong>
            <small>${formatTokenAmount(token.balance, 4)} available</small>
          </span>
        </button>
      `,
    )
    .join("");

  wireImageFallbacks(elements.tokenList);
}

function openTokenPicker(side: SwapSide): void {
  activePickerSide = side;
  elements.tokenSearch.value = "";
  renderPopularTokens();
  renderTokenList();

  if (!elements.tokenDialog.open) {
    elements.tokenDialog.showModal();
  }

  requestAnimationFrame(() => elements.tokenSearch.focus());
}

function selectToken(symbol: string): void {
  const token = tokens.find((candidate) => candidate.symbol === symbol);
  if (!token) return;

  manuallySelectedRouteId = null;

  if (activePickerSide === "from") {
    fromToken = token;
    renderSelectedToken("from", token);
  } else {
    toToken = token;
    renderSelectedToken("to", token);
  }

  elements.tokenDialog.close();
  updateForm();
}

function showToast(
  message: string,
  tone: "success" | "warning" | "error" = "success",
): void {
  const toast = document.createElement("div");
  toast.className = `toast ${tone}`;
  toast.innerHTML = `
    <span class="toast-icon" aria-hidden="true"></span>
    <span>${message}</span>
  `;

  elements.toastRegion.append(toast);

  requestAnimationFrame(() => toast.classList.add("visible"));

  window.setTimeout(() => {
    toast.classList.remove("visible");
    window.setTimeout(() => toast.remove(), 220);
  }, 3800);
}

function simulateSwap(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 1250);
  });
}

async function submitSwap(): Promise<void> {
  if (!fromToken || !toToken || !quote) return;

  const error = amountError();
  if (error) {
    elements.amountInput.dataset.touched = "true";
    updateForm();
    elements.amountInput.focus();
    return;
  }

  isSubmitting = true;
  elements.submitButton.classList.add("is-loading");
  updateSubmitState(null);

  const amount = currentAmount();
  const submittedFrom = fromToken;
  const submittedTo = toToken;
  const submittedQuote = quote;

  try {
    await simulateSwap();

    const reference = `ORB-${Date.now().toString(36).toUpperCase().slice(-7)}`;

    elements.successSummary.textContent =
      `Your ${submittedFrom.symbol} was routed into ${submittedTo.symbol} through ${submittedQuote.label}, selected for the ${swapIntent} intent.`;
    elements.receiptPaid.textContent =
      `${formatTokenAmount(amount, 8)} ${submittedFrom.symbol}`;
    elements.receiptReceived.textContent =
      `${formatTokenAmount(submittedQuote.netOutput, 8)} ${submittedTo.symbol}`;
    elements.receiptReference.textContent = reference;

    elements.successDialog.showModal();
    showToast("Simulated swap completed successfully.", "success");

    submittedFrom.balance = Math.max(0, submittedFrom.balance - amount);
    submittedTo.balance += submittedQuote.netOutput;

    elements.amountInput.value = "";
    elements.amountInput.dataset.touched = "false";
    updateForm();
  } catch {
    showToast("The simulated route failed. No balance changed.", "error");
  } finally {
    isSubmitting = false;
    elements.submitButton.classList.remove("is-loading");
    updateForm();
  }
}

function applyTheme(theme: "light" | "dark"): void {
  elements.html.dataset.theme = theme;
  localStorage.setItem("orbit-theme", theme);
  elements.themeToggle.setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
  );
}

function initializeTheme(): void {
  const stored = localStorage.getItem("orbit-theme");

  if (stored === "light" || stored === "dark") {
    applyTheme(stored);
    return;
  }

  applyTheme(
    window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark",
  );
}

function closeDialogOnBackdrop(
  dialog: HTMLDialogElement,
  event: MouseEvent,
): void {
  const rect = dialog.getBoundingClientRect();
  const outside =
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;

  if (outside) dialog.close();
}

elements.amountInput.addEventListener("input", () => {
  const sanitized = sanitizeAmountInput(elements.amountInput.value);
  if (sanitized !== elements.amountInput.value) {
    elements.amountInput.value = sanitized;
  }
  updateForm();
});

elements.amountInput.addEventListener("blur", () => {
  elements.amountInput.dataset.touched = "true";
  updateForm();
});

elements.maxButton.addEventListener("click", () => {
  if (!fromToken) return;
  setAmount(
    formatTokenAmount(fromToken.balance, 8).replace(/,/g, ""),
  );
  elements.amountInput.focus();
});

elements.reverseButton.addEventListener("click", reversePair);
elements.fromTrigger.addEventListener("click", () =>
  openTokenPicker("from"),
);
elements.toTrigger.addEventListener("click", () =>
  openTokenPicker("to"),
);

elements.tokenSearch.addEventListener("input", () => {
  renderTokenList(elements.tokenSearch.value);
});

elements.tokenList.addEventListener("click", (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>(
    "[data-token-symbol]",
  );
  if (button?.dataset.tokenSymbol) {
    selectToken(button.dataset.tokenSymbol);
  }
});

elements.popularTokens.addEventListener("click", (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>(
    "[data-token-symbol]",
  );
  if (button?.dataset.tokenSymbol) {
    selectToken(button.dataset.tokenSymbol);
  }
});

elements.closeTokenDialog.addEventListener("click", () =>
  elements.tokenDialog.close(),
);
elements.closeSuccessDialog.addEventListener("click", () =>
  elements.successDialog.close(),
);

elements.tokenDialog.addEventListener("click", (event) =>
  closeDialogOnBackdrop(elements.tokenDialog, event),
);
elements.successDialog.addEventListener("click", (event) =>
  closeDialogOnBackdrop(elements.successDialog, event),
);

elements.refreshButton.addEventListener("click", () => {
  void refreshPrices();
});

elements.rateToggle.addEventListener("click", () => {
  invertedRate = !invertedRate;
  updateQuote();
});


elements.intentOptions.forEach((button) => {
  button.addEventListener("click", () => {
    const intent = button.dataset.intent as SwapIntent | undefined;
    if (!intent) return;

    swapIntent = intent;
    manuallySelectedRouteId = null;
    elements.intentDescription.textContent = INTENT_DESCRIPTIONS[intent];
    elements.quoteModeLabel.textContent = button.querySelector("strong")?.textContent ?? intent;

    elements.intentOptions.forEach((option) => {
      const selected = option === button;
      option.classList.toggle("active", selected);
      option.setAttribute("aria-checked", String(selected));
    });

    updateQuote();
  });
});

elements.routeComparison.addEventListener("click", (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>("[data-route-id]");
  const routeId = button?.dataset.routeId as RouteId | undefined;
  if (!routeId) return;

  manuallySelectedRouteId = routeId;
  quote = routeById(routeId);
  if (quote) {
    updateQuote();
    showToast(`${quote.label} selected manually.`, "success");
  }
});

elements.scenarioSlider.addEventListener("input", () => {
  scenarioMovePercent = Number(elements.scenarioSlider.value);
  renderScenario();
});

document
  .querySelectorAll<HTMLInputElement>('input[name="slippage"]')
  .forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.checked) {
        slippagePercent = Number(radio.value);
        updateQuote();
      }
    });
  });

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  void submitSwap();
});

elements.themeToggle.addEventListener("click", () => {
  applyTheme(
    elements.html.dataset.theme === "dark" ? "light" : "dark",
  );
});

document.addEventListener("keydown", (event) => {
  const typing =
    document.activeElement instanceof HTMLInputElement ||
    document.activeElement instanceof HTMLTextAreaElement;

  if (!typing && event.key.toLowerCase() === "r") {
    event.preventDefault();
    reversePair();
    return;
  }

  if (!typing && event.key.toLowerCase() === "m" && fromToken) {
    event.preventDefault();
    setAmount(formatTokenAmount(fromToken.balance, 8).replace(/,/g, ""));
    return;
  }

  if (
    event.key === "/" &&
    !elements.tokenDialog.open &&
    document.activeElement?.tagName !== "INPUT"
  ) {
    event.preventDefault();
    openTokenPicker("from");
  }
});

initializeTheme();
elements.amountInput.dataset.touched = "false";
renderEmptyQuote();
void refreshPrices({ preserveSelection: false });
