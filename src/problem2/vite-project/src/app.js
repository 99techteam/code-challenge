import { appState } from "./store/swapStore.js";
import { swapCalculator } from "./services/calculator.js";
import { validators } from "./utils/validation.js";
import { formatters } from "./utils/formatters.js";

export class App {
  constructor() {
    this.fromAmount = "";
    this.init();
  }

  init() {
    // Subscribe to state changes
    appState.subscribe(() => this.handleStateChange());

    // Load tokens
    appState.loadTokens();

    // Setup event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // From amount input
    const fromAmountInput = document.getElementById("fromAmount");
    if (fromAmountInput) {
      fromAmountInput.addEventListener("input", (e) => {
        const sanitized = validators.sanitizeNumericInput(e.target.value);
        e.target.value = sanitized;
        this.fromAmount = sanitized;
        this.calculateOutput();
        this.validateAndUpdateUI();
      });
    }

    // Token selectors - use event delegation on parent
    const fromSelector = document.querySelector("#fromCard .token-selector");
    const toSelector = document.querySelector("#toCard .token-selector");

    if (fromSelector) {
      fromSelector.addEventListener("click", () => {
        appState.openTokenModal("from");
      });
    }

    if (toSelector) {
      toSelector.addEventListener("click", () => {
        appState.openTokenModal("to");
      });
    }

    // Swap button
    const swapButton = document.querySelector(".swap-button");
    if (swapButton) {
      swapButton.addEventListener("click", () => {
        appState.swapTokens();
        this.calculateOutput();
      });
    }

    // Max button
    const balanceSpan = document.querySelector("#fromCard .balance span");
    if (balanceSpan) {
      balanceSpan.addEventListener("click", () => {
        this.fromAmount = "100";
        document.getElementById("fromAmount").value = "100";
        this.calculateOutput();
      });
    }

    // Form submit
    const form = document.getElementById("swapForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleConfirm();
      });
    }

    // Token search
    const tokenSearch = document.getElementById("tokenSearch");
    if (tokenSearch) {
      tokenSearch.addEventListener("input", (e) => {
        this.renderTokenList(e.target.value);
      });
    }

    // Modal close
    const modal = document.getElementById("tokenModal");
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target.id === "tokenModal") {
          appState.closeTokenModal();
        }
      });
    }

    const closeButton = document.querySelector(".close-button");
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        appState.closeTokenModal();
      });
    }
  }

  handleStateChange() {
    const state = appState.getState();

    // Update UI with new token selection
    this.updateTokenDisplay("from", state.fromToken);
    this.updateTokenDisplay("to", state.toToken);

    // Handle modal
    if (state.selectingFor) {
      document.getElementById("tokenModal").classList.add("active");
      document.getElementById("tokenSearch").value = "";
      this.renderTokenList();
    } else {
      document.getElementById("tokenModal").classList.remove("active");
    }

    this.calculateOutput();
  }

  updateTokenDisplay(type, token) {
    const iconEl = document.getElementById(`${type}Icon`);
    const symbolEl = document.getElementById(`${type}Symbol`);

    if (iconEl && token) {
      // Create image element properly
      iconEl.innerHTML = "";
      const img = document.createElement("img");
      img.src = `/tokens/${token.symbol}.svg`;
      img.alt = token.symbol;
      img.width = 20;
      img.height = 20;

      // Handle error by showing first letter
      img.onerror = () => {
        iconEl.innerHTML = token.symbol.charAt(0);
      };

      iconEl.appendChild(img);
    }

    if (symbolEl && token) {
      symbolEl.textContent = token.symbol;
    }
  }

  renderTokenList(searchTerm = "") {
    const state = appState.getState();
    const listEl = document.getElementById("tokenList");

    if (!listEl) return;

    const filtered = state.tokens.filter(
      (token) =>
        token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filtered.length === 0) {
      listEl.innerHTML = '<div class="loading">No tokens found</div>';
      return;
    }

    // Clear the list
    listEl.innerHTML = "";

    // Create token items
    filtered.forEach((token) => {
      const tokenItem = document.createElement("div");
      tokenItem.className = "token-item";
      tokenItem.dataset.symbol = token.symbol;

      // Token icon
      const tokenIcon = document.createElement("div");
      tokenIcon.className = "token-icon";

      const img = document.createElement("img");
      img.src = `/tokens/${token.symbol}.svg`;
      img.alt = token.symbol;
      img.width = 20;
      img.height = 20;

      // Handle image error
      img.onerror = () => {
        tokenIcon.innerHTML = token.symbol.charAt(0);
      };

      tokenIcon.appendChild(img);

      // Token info
      const tokenInfo = document.createElement("div");
      tokenInfo.className = "token-info";
      tokenInfo.innerHTML = `
        <div class="token-name">${token.name}</div>
        <div class="token-symbol-small">${token.symbol}</div>
      `;

      // Token price
      const tokenPrice = document.createElement("div");
      tokenPrice.className = "token-price";
      tokenPrice.textContent = token.price.toFixed(6);

      // Assemble token item
      tokenItem.appendChild(tokenIcon);
      tokenItem.appendChild(tokenInfo);
      tokenItem.appendChild(tokenPrice);

      // Add click listener
      tokenItem.addEventListener("click", () => {
        this.selectToken(token);
      });

      listEl.appendChild(tokenItem);
    });
  }

  selectToken(token) {
    const state = appState.getState();
    if (state.selectingFor === "from") {
      appState.setFromToken(token);
    } else {
      appState.setToToken(token);
    }
    appState.closeTokenModal();
  }

  calculateOutput() {
    const amount = parseFloat(this.fromAmount);
    const state = appState.getState();

    if (!amount || amount <= 0) {
      document.getElementById("toAmount").value = "";
      document.getElementById("exchangeInfo").classList.remove("active");
      this.updateButtonState();
      return;
    }

    const validation = validators.isValidAmount(this.fromAmount);
    if (!validation.valid) {
      document.getElementById("toAmount").value = "";
      document.getElementById("exchangeInfo").classList.remove("active");
      this.updateButtonState();
      return;
    }

    const fromPrice = state.prices[state.fromToken.symbol];
    const toPrice = state.prices[state.toToken.symbol];

    if (!fromPrice || !toPrice) {
      document.getElementById("toAmount").value = "0.00";
      return;
    }

    // Calculate output
    const outputAmount = swapCalculator.calculateOutput(
      amount,
      fromPrice,
      toPrice
    );
    document.getElementById("toAmount").value =
      formatters.formatPrice(outputAmount);

    // Calculate exchange rate
    const rate = swapCalculator.calculateExchangeRate(fromPrice, toPrice);
    document.getElementById("exchangeRate").textContent = `1 ${
      state.fromToken.symbol
    } = ${formatters.formatPrice(rate)} ${state.toToken.symbol}`;

    // Calculate price impact
    const priceImpact = swapCalculator.calculatePriceImpact(amount, fromPrice);
    const priceImpactColor = swapCalculator.getPriceImpactColor(priceImpact);
    const priceImpactText = formatters.formatPriceImpact(priceImpact);

    const priceImpactEl = document.getElementById("priceImpact");
    if (priceImpactEl) {
      priceImpactEl.textContent = priceImpactText;
      priceImpactEl.style.color = priceImpactColor;
    }

    document.getElementById("exchangeInfo").classList.add("active");
    this.updateButtonState();
  }

  validateAndUpdateUI() {
    const errorEl = document.getElementById("fromError");
    const cardEl = document.getElementById("fromCard");

    if (!this.fromAmount) {
      if (errorEl) errorEl.classList.remove("active");
      if (cardEl) cardEl.classList.remove("error");
      this.updateButtonState();
      return true;
    }

    const validation = validators.isValidAmount(this.fromAmount);

    if (!validation.valid) {
      if (errorEl) {
        errorEl.textContent = validation.error;
        errorEl.classList.add("active");
      }
      if (cardEl) cardEl.classList.add("error");
    } else {
      if (errorEl) errorEl.classList.remove("active");
      if (cardEl) cardEl.classList.remove("error");
    }

    this.updateButtonState();
    return validation.valid;
  }

  updateButtonState() {
    const button = document.getElementById("confirmButton");

    if (!button) return;

    if (!this.fromAmount) {
      button.textContent = "Enter an amount";
      button.disabled = true;
      return;
    }

    const validation = validators.isValidAmount(this.fromAmount);
    if (!validation.valid) {
      button.textContent = "Invalid amount";
      button.disabled = true;
      return;
    }

    button.textContent = "Confirm Swap";
    button.disabled = false;
  }

  handleConfirm() {
    if (this.validateAndUpdateUI()) {
      const state = appState.getState();
      const toAmount = document.getElementById("toAmount").value;
      alert(
        `Swapping ${this.fromAmount} ${state.fromToken.symbol} for ${toAmount} ${state.toToken.symbol}`
      );
    }
  }
}
