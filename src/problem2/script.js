// Token data will be loaded from API
let tokenData = [];

// Token name mappings for better display
const tokenNames = {
  USDC: "USD Coin",
  SWTH: "Switcheo Token",
  ETH: "Ethereum",
  ATOM: "Cosmos",
  OSMO: "Osmosis",
  LUNA: "Terra Luna",
  WBTC: "Wrapped Bitcoin",
  BUSD: "Binance USD",
  BLUR: "Blur",
  GMX: "GMX",
  KUJI: "Kujira",
  OKB: "OKB",
  USD: "US Dollar",
  bNEO: "bNEO",
  STEVMOS: "Staked EVMOS",
  RATOM: "RATOM",
  STRD: "Stride",
  EVMOS: "EVMOS",
  IBCX: "IBCX",
  IRIS: "IRIS",
  ampLUNA: "Amplified LUNA",
  STOSMO: "Staked OSMO",
  axlUSDC: "Axelar USDC",
  STATOM: "Staked ATOM",
  rSWTH: "rSWTH",
  STLUNA: "Staked LUNA",
  LSI: "LSI",
  OKT: "OKT",
  USC: "USC",
  wstETH: "Wrapped Staked ETH",
  YieldUSD: "YieldUSD",
  ZIL: "Zilliqa",
};

// State management
let state = {
  fromToken: null,
  toToken: null,
  fromAmount: "",
  toAmount: "",
  isCalculating: false,
  isSwapping: false,
  isLoading: true,
};

// DOM elements
const elements = {
  // Token selectors
  fromTokenSelector: document.getElementById("fromTokenSelector"),
  toTokenSelector: document.getElementById("toTokenSelector"),
  fromTokenIcon: document.getElementById("fromTokenIcon"),
  fromTokenSymbol: document.getElementById("fromTokenSymbol"),
  toTokenIcon: document.getElementById("toTokenIcon"),
  toTokenSymbol: document.getElementById("toTokenSymbol"),

  // Amount inputs
  fromAmount: document.getElementById("fromAmount"),
  toAmount: document.getElementById("toAmount"),

  // Balance displays
  fromBalance: document.getElementById("fromBalance"),
  toBalance: document.getElementById("toBalance"),

  // Buttons
  maxFromBtn: document.getElementById("maxFromBtn"),
  swapDirectionBtn: document.getElementById("swapDirectionBtn"),
  swapSubmitBtn: document.getElementById("swapSubmitBtn"),
  loadingSpinner: document.getElementById("loadingSpinner"),

  // Exchange rate
  rateValue: document.getElementById("rateValue"),
  priceImpact: document.getElementById("priceImpact"),

  // Error messages
  fromError: document.getElementById("fromError"),
  toError: document.getElementById("toError"),

  // Modal
  tokenModal: document.getElementById("tokenModal"),
  modalTitle: document.getElementById("modalTitle"),
  closeModal: document.getElementById("closeModal"),
  tokenSearch: document.getElementById("tokenSearch"),
  tokenList: document.getElementById("tokenList"),

  // Form
  swapForm: document.getElementById("swapForm"),
};

// Load token data from API
async function loadTokenData() {
  try {
    showLoadingState();

    const response = await fetch("https://interview.switcheo.com/prices.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const priceData = await response.json();

    // Process the API data
    tokenData = priceData.map((item) => ({
      symbol: item.currency,
      name: tokenNames[item.currency] || item.currency,
      price: item.price,
      icon: `${item.currency}.svg`,
      date: item.date,
    }));

    // Set default tokens
    state.fromToken =
      tokenData.find((token) => token.symbol === "USDC") || tokenData[0];
    state.toToken =
      tokenData.find((token) => token.symbol === "SWTH") || tokenData[1];

    // Update UI
    updateTokenDisplay();
    updateBalances();
    updateExchangeRate();
    generateTokenList();
    updateSubmitButton();

    hideLoadingState();
  } catch (error) {
    console.error("Error loading token data:", error);
    showError(
      "fromError",
      "Failed to load token data. Please refresh the page."
    );
    hideLoadingState();
  }
}

// Show loading state
function showLoadingState() {
  state.isLoading = true;
  elements.swapSubmitBtn.disabled = true;
  elements.swapSubmitBtn.querySelector(".btn-text").textContent = "Loading...";

  // Show loading spinner
  const loadingSpinner = document.createElement("div");
  loadingSpinner.id = "globalLoadingSpinner";
  loadingSpinner.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Loading tokens...';
  loadingSpinner.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 20px 30px;
    border-radius: 10px;
    z-index: 1002;
    font-size: 16px;
  `;
  document.body.appendChild(loadingSpinner);
}

// Hide loading state
function hideLoadingState() {
  state.isLoading = false;
  const loadingSpinner = document.getElementById("globalLoadingSpinner");
  if (loadingSpinner) {
    document.body.removeChild(loadingSpinner);
  }
  updateSubmitButton();
}

// Initialize the app
async function init() {
  setupEventListeners();
  await loadTokenData();
}

// Setup all event listeners
function setupEventListeners() {
  // Token selection
  elements.fromTokenSelector.addEventListener("click", () =>
    openTokenModal("from")
  );
  elements.toTokenSelector.addEventListener("click", () =>
    openTokenModal("to")
  );

  // Amount inputs
  elements.fromAmount.addEventListener("input", handleFromAmountChange);
  elements.toAmount.addEventListener("input", handleToAmountChange);

  // Buttons
  elements.maxFromBtn.addEventListener("click", setMaxAmount);
  elements.swapDirectionBtn.addEventListener("click", swapTokens);
  elements.swapSubmitBtn.addEventListener("click", handleSwap);

  // Modal
  elements.closeModal.addEventListener("click", closeTokenModal);
  elements.tokenModal.addEventListener("click", (e) => {
    if (e.target === elements.tokenModal) closeTokenModal();
  });
  elements.tokenSearch.addEventListener("input", filterTokens);

  // Form submission
  elements.swapForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSwap();
  });
}

// Open token selection modal
function openTokenModal(type) {
  state.currentSelectionType = type;
  elements.modalTitle.textContent = `Select ${
    type === "from" ? "From" : "To"
  } Token`;
  elements.tokenModal.classList.add("active");
  elements.tokenSearch.value = "";
  filterTokens();
}

// Close token selection modal
function closeTokenModal() {
  elements.tokenModal.classList.remove("active");
  state.currentSelectionType = null;
}

// Generate token list in modal
function generateTokenList() {
  elements.tokenList.innerHTML = "";

  tokenData.forEach((token) => {
    const tokenItem = document.createElement("div");
    tokenItem.className = "token-item";
    tokenItem.innerHTML = `
      <img src="https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${
        token.icon
      }" 
           alt="${token.symbol}" class="token-icon">
      <div class="token-details">
        <div class="token-name">${token.name}</div>
        <div class="token-price">$${token.price.toFixed(6)}</div>
      </div>
    `;

    tokenItem.addEventListener("click", () => selectToken(token));
    elements.tokenList.appendChild(tokenItem);
  });
}

// Filter tokens based on search
function filterTokens() {
  const searchTerm = elements.tokenSearch.value.toLowerCase();
  const tokenItems = elements.tokenList.querySelectorAll(".token-item");

  tokenItems.forEach((item) => {
    const tokenName = item
      .querySelector(".token-name")
      .textContent.toLowerCase();
    const tokenSymbol = item
      .querySelector(".token-name")
      .textContent.toLowerCase();
    const matches =
      tokenName.includes(searchTerm) || tokenSymbol.includes(searchTerm);
    item.style.display = matches ? "flex" : "none";
  });
}

// Select a token
function selectToken(token) {
  if (state.currentSelectionType === "from") {
    state.fromToken = token;
  } else {
    state.toToken = token;
  }

  updateTokenDisplay();
  updateExchangeRate();
  calculateToAmount();
  closeTokenModal();
}

// Update token display
function updateTokenDisplay() {
  if (!state.fromToken || !state.toToken) return;

  // From token
  elements.fromTokenIcon.src = `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${state.fromToken.icon}`;
  elements.fromTokenSymbol.textContent = state.fromToken.symbol;

  // To token
  elements.toTokenIcon.src = `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${state.toToken.icon}`;
  elements.toTokenSymbol.textContent = state.toToken.symbol;
}

// Update balance displays (mock data)
function updateBalances() {
  const fromBalance = (Math.random() * 10000 + 1000).toFixed(2);
  const toBalance = (Math.random() * 100000 + 10000).toFixed(2);

  elements.fromBalance.textContent = parseFloat(fromBalance).toLocaleString();
  elements.toBalance.textContent = parseFloat(toBalance).toLocaleString();
}

// Update exchange rate display
function updateExchangeRate() {
  if (!state.fromToken || !state.toToken) return;

  const rate = state.fromToken.price / state.toToken.price;
  elements.rateValue.textContent = `1 ${
    state.fromToken.symbol
  } = ${rate.toFixed(6)} ${state.toToken.symbol}`;

  // Calculate price impact (mock)
  const impact = (Math.random() * 0.1).toFixed(2);
  elements.priceImpact.textContent = `${impact}%`;
}

// Handle from amount change
function handleFromAmountChange() {
  const amount = parseFloat(elements.fromAmount.value) || 0;
  state.fromAmount = amount;

  clearErrors();
  calculateToAmount();
  updateSubmitButton();
}

// Handle to amount change
function handleToAmountChange() {
  const amount = parseFloat(elements.toAmount.value) || 0;
  state.toAmount = amount;

  clearErrors();
  calculateFromAmount();
  updateSubmitButton();
}

// Calculate to amount based on from amount
function calculateToAmount() {
  if (
    !state.fromAmount ||
    state.isCalculating ||
    !state.fromToken ||
    !state.toToken
  )
    return;

  state.isCalculating = true;

  // Simulate calculation delay
  setTimeout(() => {
    const rate = state.fromToken.price / state.toToken.price;
    const calculatedAmount = state.fromAmount * rate;
    state.toAmount = calculatedAmount;
    elements.toAmount.value = calculatedAmount.toFixed(6);
    state.isCalculating = false;
  }, 100);
}

// Calculate from amount based on to amount
function calculateFromAmount() {
  if (
    !state.toAmount ||
    state.isCalculating ||
    !state.fromToken ||
    !state.toToken
  )
    return;

  state.isCalculating = true;

  // Simulate calculation delay
  setTimeout(() => {
    const rate = state.toToken.price / state.fromToken.price;
    const calculatedAmount = state.toAmount * rate;
    state.fromAmount = calculatedAmount;
    elements.fromAmount.value = calculatedAmount.toFixed(6);
    state.isCalculating = false;
  }, 100);
}

// Set maximum amount
function setMaxAmount() {
  const balance = parseFloat(
    elements.fromBalance.textContent.replace(/,/g, "")
  );
  elements.fromAmount.value = balance.toFixed(6);
  state.fromAmount = balance;
  calculateToAmount();
  updateSubmitButton();
}

// Swap token directions
function swapTokens() {
  // Add rotation animation
  elements.swapDirectionBtn.style.transform = "rotate(180deg)";
  setTimeout(() => {
    elements.swapDirectionBtn.style.transform = "rotate(0deg)";
  }, 300);

  // Swap tokens
  const temp = state.fromToken;
  state.fromToken = state.toToken;
  state.toToken = temp;

  // Swap amounts
  const tempAmount = state.fromAmount;
  state.fromAmount = state.toAmount;
  state.toAmount = tempAmount;

  // Update display
  updateTokenDisplay();
  elements.fromAmount.value = state.fromAmount.toFixed(6);
  elements.toAmount.value = state.toAmount.toFixed(6);
  updateExchangeRate();
  updateSubmitButton();
}

// Update submit button state
function updateSubmitButton() {
  const hasAmount = state.fromAmount > 0 && state.toAmount > 0;
  const sameToken =
    state.fromToken &&
    state.toToken &&
    state.fromToken.symbol === state.toToken.symbol;
  const isLoading = state.isLoading;

  elements.swapSubmitBtn.disabled =
    !hasAmount || sameToken || state.isSwapping || isLoading;

  if (isLoading) {
    elements.swapSubmitBtn.querySelector(".btn-text").textContent =
      "Loading...";
  } else if (sameToken) {
    elements.swapSubmitBtn.querySelector(".btn-text").textContent =
      "Select Different Tokens";
  } else if (!hasAmount) {
    elements.swapSubmitBtn.querySelector(".btn-text").textContent =
      "Enter Amount";
  } else {
    elements.swapSubmitBtn.querySelector(".btn-text").textContent =
      "Swap Tokens";
  }
}

// Handle swap submission
function handleSwap() {
  if (state.isSwapping) return;

  // Validation
  if (!validateInputs()) return;

  // Start swap process
  state.isSwapping = true;
  elements.swapSubmitBtn.classList.add("loading");
  elements.swapSubmitBtn.disabled = true;

  // Simulate swap process
  setTimeout(() => {
    // Simulate success
    showSuccessMessage();

    // Reset form
    setTimeout(() => {
      resetForm();
    }, 2000);
  }, 3000);
}

// Validate inputs
function validateInputs() {
  clearErrors();
  let isValid = true;

  if (!state.fromAmount || state.fromAmount <= 0) {
    showError("fromError", "Please enter a valid amount");
    isValid = false;
  }

  if (!state.toAmount || state.toAmount <= 0) {
    showError("toError", "Please enter a valid amount");
    isValid = false;
  }

  if (state.fromToken.symbol === state.toToken.symbol) {
    showError("fromError", "Please select different tokens");
    isValid = false;
  }

  return isValid;
}

// Show error message
function showError(elementId, message) {
  elements[elementId].textContent = message;
  elements[elementId].parentElement.classList.add("shake");
  setTimeout(() => {
    elements[elementId].parentElement.classList.remove("shake");
  }, 500);
}

// Clear all errors
function clearErrors() {
  elements.fromError.textContent = "";
  elements.toError.textContent = "";
}

// Show success message
function showSuccessMessage() {
  elements.swapSubmitBtn.classList.remove("loading");
  elements.swapSubmitBtn.classList.add("success");
  elements.swapSubmitBtn.querySelector(".btn-text").textContent =
    "Swap Successful!";

  // Show success notification
  showNotification("Swap completed successfully!", "success");
}

// Reset form
function resetForm() {
  state.fromAmount = "";
  state.toAmount = "";
  state.isSwapping = false;

  elements.fromAmount.value = "";
  elements.toAmount.value = "";
  elements.swapSubmitBtn.classList.remove("loading", "success");
  elements.swapSubmitBtn.disabled = false;
  elements.swapSubmitBtn.querySelector(".btn-text").textContent = "Swap Tokens";

  clearErrors();
  updateSubmitButton();
}

// Show notification
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === "success" ? "#10b981" : "#667eea"};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1001;
    animation: slideInRight 0.3s ease;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Add notification animations
const style = document.createElement("style");
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Refresh token data
async function refreshTokenData() {
  await loadTokenData();
  showNotification("Token prices updated!", "success");
}

// Add refresh button functionality
function addRefreshButton() {
  const refreshBtn = document.createElement("button");
  refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
  refreshBtn.className = "refresh-btn";
  refreshBtn.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    transition: all 0.3s ease;
  `;

  refreshBtn.addEventListener("click", refreshTokenData);
  refreshBtn.addEventListener("mouseenter", () => {
    refreshBtn.style.transform = "scale(1.1)";
    refreshBtn.style.background = "#5a67d8";
  });
  refreshBtn.addEventListener("mouseleave", () => {
    refreshBtn.style.transform = "scale(1)";
    refreshBtn.style.background = "#667eea";
  });

  document.body.appendChild(refreshBtn);
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  init();
  addRefreshButton();
});
