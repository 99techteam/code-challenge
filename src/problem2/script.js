// Global state management
const state = {
  tokens: [],
  prices: {},
  selectedFromToken: null,
  selectedToToken: null,
  fromAmount: 0,
  toAmount: 0,
  isSwapping: false,
  currentTokenSelector: null // 'from' or 'to'
};

// DOM elements
const elements = {
  fromTokenSelector: document.getElementById('from-token-selector'),
  toTokenSelector: document.getElementById('to-token-selector'),
  fromTokenIcon: document.getElementById('from-token-icon'),
  toTokenIcon: document.getElementById('to-token-icon'),
  fromTokenSymbol: document.getElementById('from-token-symbol'),
  toTokenSymbol: document.getElementById('to-token-symbol'),
  fromAmount: document.getElementById('from-amount'),
  toAmount: document.getElementById('to-amount'),
  fromBalance: document.getElementById('from-balance'),
  toBalance: document.getElementById('to-balance'),
  swapDirectionBtn: document.getElementById('swap-direction-btn'),
  swapSubmitBtn: document.getElementById('swap-submit-btn'),
  exchangeInfo: document.getElementById('exchange-info'),
  exchangeRate: document.getElementById('exchange-rate'),
  priceImpact: document.getElementById('price-impact'),
  errorMessage: document.getElementById('error-message'),
  tokenModal: document.getElementById('token-modal'),
  tokenList: document.getElementById('token-list'),
  tokenSearch: document.getElementById('token-search'),
  closeModal: document.getElementById('close-modal'),
  successModal: document.getElementById('success-modal'),
  closeSuccessModal: document.getElementById('close-success-modal'),
  swapForm: document.getElementById('swap-form'),
  maxButton: document.querySelector('.max-btn'),
  submitText: document.querySelector('.submit-text'),
  loadingIcon: document.querySelector('.loading-icon')
};

// Initialize the application
async function initializeApp() {
  try {
    showLoading();
    await Promise.all([
      loadTokens(),
      loadPrices()
    ]);
    setupEventListeners();
    hideLoading();
  } catch (error) {
    console.error('Failed to initialize app:', error);
    showError('Failed to load token data. Please refresh the page.');
    hideLoading();
  }
}

// Load token data
async function loadTokens() {
  try {
    // Popular tokens with their contract addresses or symbols
    const popularTokens = [
      { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
      { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
      { symbol: 'USDT', name: 'Tether USD', decimals: 6 },
      { symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8 },
      { symbol: 'SWTH', name: 'Switcheo Token', decimals: 8 },
      { symbol: 'ATOM', name: 'Cosmos', decimals: 6 },
      { symbol: 'BNB', name: 'Binance Coin', decimals: 18 },
      { symbol: 'MATIC', name: 'Polygon', decimals: 18 },
      { symbol: 'AVAX', name: 'Avalanche', decimals: 18 },
      { symbol: 'SOL', name: 'Solana', decimals: 9 },
      { symbol: 'DOT', name: 'Polkadot', decimals: 10 },
      { symbol: 'LINK', name: 'Chainlink', decimals: 18 },
      { symbol: 'UNI', name: 'Uniswap', decimals: 18 },
      { symbol: 'AAVE', name: 'Aave', decimals: 18 },
      { symbol: 'COMP', name: 'Compound', decimals: 18 }
    ];

    // Add icon URLs for each token
    state.tokens = popularTokens.map(token => ({
      ...token,
      iconUrl: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${token.symbol}.svg`,
      balance: Math.random() * 1000 // Mock balance
    }));

  } catch (error) {
    console.error('Error loading tokens:', error);
    throw error;
  }
}

// Load price data from the API
async function loadPrices() {
  try {
    const response = await fetch('https://interview.switcheo.com/prices.json');
    const pricesArray = await response.json();
    
    // Convert array to object for easier lookup
    state.prices = {};
    pricesArray.forEach(item => {
      if (item.currency && item.price) {
        state.prices[item.currency.toUpperCase()] = parseFloat(item.price);
      }
    });
    
    console.log('Loaded prices:', state.prices);
  } catch (error) {
    console.error('Error loading prices:', error);
    // Continue without prices - we'll show "Price not available"
  }
}

// Setup event listeners
function setupEventListeners() {
  // Token selector clicks
  elements.fromTokenSelector.addEventListener('click', () => openTokenModal('from'));
  elements.toTokenSelector.addEventListener('click', () => openTokenModal('to'));

  // Amount input changes
  elements.fromAmount.addEventListener('input', handleFromAmountChange);
  
  // Swap direction button
  elements.swapDirectionBtn.addEventListener('click', swapTokens);

  // MAX button
  if (elements.maxButton) {
    elements.maxButton.addEventListener('click', setMaxAmount);
  }

  // Form submission
  elements.swapForm.addEventListener('submit', handleSwapSubmission);

  // Modal controls
  elements.closeModal.addEventListener('click', closeTokenModal);
  elements.closeSuccessModal.addEventListener('click', closeSuccessModal);
  elements.tokenModal.addEventListener('click', (e) => {
    if (e.target === elements.tokenModal) closeTokenModal();
  });

  // Token search
  elements.tokenSearch.addEventListener('input', handleTokenSearch);

  // Close modals on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeTokenModal();
      closeSuccessModal();
    }
  });
}

// Open token selection modal
function openTokenModal(type) {
  state.currentTokenSelector = type;
  populateTokenList();
  elements.tokenModal.style.display = 'flex';
  elements.tokenSearch.focus();
}

// Close token selection modal
function closeTokenModal() {
  elements.tokenModal.style.display = 'none';
  elements.tokenSearch.value = '';
  state.currentTokenSelector = null;
}

// Close success modal
function closeSuccessModal() {
  elements.successModal.style.display = 'none';
}

// Populate token list in modal
function populateTokenList(filter = '') {
  const filteredTokens = state.tokens.filter(token => 
    token.symbol.toLowerCase().includes(filter.toLowerCase()) ||
    token.name.toLowerCase().includes(filter.toLowerCase())
  );

  elements.tokenList.innerHTML = filteredTokens.map(token => {
    const price = state.prices[token.symbol];
    const priceDisplay = price ? `$${price.toFixed(6)}` : 'Price not available';
    
    return `
      <div class="token-item" data-symbol="${token.symbol}">
        <img src="${token.iconUrl}" alt="${token.symbol}" onerror="this.style.display='none'">
        <div class="token-details">
          <span class="token-name">${token.symbol}</span>
          <div class="token-price">${priceDisplay}</div>
        </div>
      </div>
    `;
  }).join('');

  // Add click listeners to token items
  document.querySelectorAll('.token-item').forEach(item => {
    item.addEventListener('click', () => {
      const symbol = item.dataset.symbol;
      selectToken(symbol);
    });
  });
}

// Handle token search
function handleTokenSearch(e) {
  populateTokenList(e.target.value);
}

// Select a token
function selectToken(symbol) {
  const token = state.tokens.find(t => t.symbol === symbol);
  if (!token) return;

  if (state.currentTokenSelector === 'from') {
    state.selectedFromToken = token;
    updateFromTokenDisplay();
  } else if (state.currentTokenSelector === 'to') {
    state.selectedToToken = token;
    updateToTokenDisplay();
  }

  closeTokenModal();
  updateSwapButton();
  calculateExchangeRate();
}

// Update from token display
function updateFromTokenDisplay() {
  if (state.selectedFromToken) {
    elements.fromTokenIcon.src = state.selectedFromToken.iconUrl;
    elements.fromTokenIcon.classList.add('visible');
    elements.fromTokenSymbol.textContent = state.selectedFromToken.symbol;
    elements.fromBalance.textContent = state.selectedFromToken.balance.toFixed(6);
  }
}

// Update to token display
function updateToTokenDisplay() {
  if (state.selectedToToken) {
    elements.toTokenIcon.src = state.selectedToToken.iconUrl;
    elements.toTokenIcon.classList.add('visible');
    elements.toTokenSymbol.textContent = state.selectedToToken.symbol;
    elements.toBalance.textContent = state.selectedToToken.balance.toFixed(6);
  }
}

// Handle from amount change
function handleFromAmountChange(e) {
  state.fromAmount = parseFloat(e.target.value) || 0;
  calculateToAmount();
  updateUSDAmounts();
  validateInputs();
}

// Calculate to amount based on exchange rate
function calculateToAmount() {
  if (!state.selectedFromToken || !state.selectedToToken || !state.fromAmount) {
    state.toAmount = 0;
    elements.toAmount.value = '';
    return;
  }

  const fromPrice = state.prices[state.selectedFromToken.symbol];
  const toPrice = state.prices[state.selectedToToken.symbol];

  if (fromPrice && toPrice) {
    // Calculate based on USD prices
    state.toAmount = (state.fromAmount * fromPrice) / toPrice;
  } else {
    // Mock calculation if prices not available
    state.toAmount = state.fromAmount * 0.95; // 5% mock fee
  }

  elements.toAmount.value = state.toAmount.toFixed(6);
  calculateExchangeRate();
}

// Update USD amounts
function updateUSDAmounts() {
  const fromUsdElement = document.querySelector('.source-token .amount-usd');
  const toUsdElement = document.querySelector('.destination-token .amount-usd');
  
  if (fromUsdElement && state.selectedFromToken && state.fromAmount) {
    const fromPrice = state.prices[state.selectedFromToken.symbol];
    if (fromPrice) {
      const usdAmount = state.fromAmount * fromPrice;
      fromUsdElement.textContent = `~$${usdAmount.toFixed(2)}`;
    }
  }
  
  if (toUsdElement && state.selectedToToken && state.toAmount) {
    const toPrice = state.prices[state.selectedToToken.symbol];
    if (toPrice) {
      const usdAmount = state.toAmount * toPrice;
      toUsdElement.textContent = `~$${usdAmount.toFixed(2)}`;
    }
  }
}

// Calculate and display exchange rate
function calculateExchangeRate() {
  if (!state.selectedFromToken || !state.selectedToToken || !state.fromAmount || !state.toAmount) {
    elements.exchangeInfo.style.display = 'none';
    return;
  }

  const rate = state.toAmount / state.fromAmount;
  elements.exchangeRate.textContent = `1 ${state.selectedFromToken.symbol} = ${rate.toFixed(6)} ${state.selectedToToken.symbol}`;
  elements.exchangeInfo.style.display = 'block';
}

// Swap tokens
function swapTokens() {
  const tempToken = state.selectedFromToken;
  state.selectedFromToken = state.selectedToToken;
  state.selectedToToken = tempToken;

  updateFromTokenDisplay();
  updateToTokenDisplay();

  // Swap amounts
  const tempAmount = state.fromAmount;
  state.fromAmount = state.toAmount;
  state.toAmount = tempAmount;

  elements.fromAmount.value = state.fromAmount ? state.fromAmount.toFixed(6) : '';
  elements.toAmount.value = state.toAmount ? state.toAmount.toFixed(6) : '';

  updateUSDAmounts();
  calculateExchangeRate();
  updateSwapButton();
}

// Set maximum amount
function setMaxAmount() {
  if (!state.selectedFromToken) return;
  
  state.fromAmount = state.selectedFromToken.balance;
  elements.fromAmount.value = state.fromAmount.toFixed(6);
  calculateToAmount();
  updateUSDAmounts();
  validateInputs();
}

// Validate inputs and update UI
function validateInputs() {
  clearError();

  if (!state.selectedFromToken || !state.selectedToToken) {
    return false;
  }

  if (state.fromAmount <= 0) {
    showError('Please enter an amount greater than 0');
    return false;
  }

  if (state.fromAmount > state.selectedFromToken.balance) {
    showError('Insufficient balance');
    return false;
  }

  if (state.selectedFromToken.symbol === state.selectedToToken.symbol) {
    showError('Cannot swap the same token');
    return false;
  }

  return true;
}

// Update swap button state
function updateSwapButton() {
  const isValid = state.selectedFromToken && state.selectedToToken && !state.isSwapping;
  
  if (!state.selectedFromToken || !state.selectedToToken) {
    elements.swapSubmitBtn.disabled = true;
    if (elements.submitText) {
      elements.submitText.textContent = 'Select tokens to swap';
    }
  } else if (state.isSwapping) {
    elements.swapSubmitBtn.disabled = true;
    if (elements.submitText) {
      elements.submitText.textContent = 'Swapping...';
    }
  } else {
    elements.swapSubmitBtn.disabled = false;
    if (elements.submitText) {
      elements.submitText.textContent = 'Confirm Swap';
    }
  }
}

// Handle swap form submission
async function handleSwapSubmission(e) {
  e.preventDefault();
  
  if (!validateInputs() || state.isSwapping) return;

  state.isSwapping = true;
  updateSwapButton();

  // Show loading spinner
  if (elements.loadingIcon) {
    elements.loadingIcon.style.display = 'block';
  }
  if (elements.submitText) {
    elements.submitText.style.opacity = '0';
  }

  try {
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate successful swap
    showSuccessModal();
    resetForm();
  } catch (error) {
    showError('Swap failed. Please try again.');
  } finally {
    state.isSwapping = false;
    updateSwapButton();
    if (elements.loadingIcon) {
      elements.loadingIcon.style.display = 'none';
    }
    if (elements.submitText) {
      elements.submitText.style.opacity = '1';
    }
  }
}

// Show success modal
function showSuccessModal() {
  elements.successModal.style.display = 'flex';
}

// Reset form after successful swap
function resetForm() {
  state.selectedFromToken = null;
  state.selectedToToken = null;
  state.fromAmount = 0;
  state.toAmount = 0;

  elements.fromTokenIcon.classList.remove('visible');
  elements.toTokenIcon.classList.remove('visible');
  elements.fromTokenSymbol.textContent = 'Select Token';
  elements.toTokenSymbol.textContent = 'Select Token';
  elements.fromAmount.value = '';
  elements.toAmount.value = '';
  elements.fromBalance.textContent = '0.00';
  elements.toBalance.textContent = '0.00';
  elements.exchangeInfo.style.display = 'none';

  // Reset USD amounts
  const usdElements = document.querySelectorAll('.amount-usd');
  usdElements.forEach(el => el.textContent = '~$0.00');

  clearError();
  updateSwapButton();
}

// Error handling
function showError(message) {
  elements.errorMessage.textContent = message;
  elements.errorMessage.style.display = 'block';
}

function clearError() {
  elements.errorMessage.style.display = 'none';
}

// Loading states
function showLoading() {
  console.log('Loading...');
}

function hideLoading() {
  console.log('Loading complete');
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);