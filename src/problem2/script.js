// Constants
const PRICES_API = 'https://interview.switcheo.com/prices.json';
const TOKEN_ICONS_BASE = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';
const SWAP_DELAY = 2000; // Simulated backend delay in ms

// State
let tokens = [];
let prices = {};
let selectedFromToken = null;
let selectedToToken = null;
let currentModalTarget = null;
let isSwapping = false;

// DOM Elements
const fromAmount = document.getElementById('fromAmount');
const toAmount = document.getElementById('toAmount');
const fromTokenSelector = document.getElementById('fromTokenSelector');
const toTokenSelector = document.getElementById('toTokenSelector');
const fromTokenDisplay = document.getElementById('fromTokenDisplay');
const toTokenDisplay = document.getElementById('toTokenDisplay');
const swapDirectionBtn = document.getElementById('swapDirectionBtn');
const submitBtn = document.getElementById('submitBtn');
const swapForm = document.getElementById('swapForm');
const tokenModal = document.getElementById('tokenModal');
const modalClose = document.getElementById('modalClose');
const tokenSearch = document.getElementById('tokenSearch');
const tokenList = document.getElementById('tokenList');
const exchangeRate = document.getElementById('exchangeRate');
const fromError = document.getElementById('fromError');
const toError = document.getElementById('toError');
const successMessage = document.getElementById('successMessage');

// Initialize app
async function init() {
  try {
    await fetchPrices();
    setupEventListeners();
  } catch (error) {
    console.error('Failed to initialize app:', error);
    showError('Failed to load token prices. Please refresh the page.');
  }
}

// Fetch token prices
async function fetchPrices() {
  try {
    const response = await fetch(PRICES_API);
    if (!response.ok) throw new Error('Failed to fetch prices');
    
    const data = await response.json();
    
    // Group by currency and get unique tokens with their latest price
    const tokenMap = new Map();
    
    data.forEach(item => {
      const key = item.currency;
      if (item.price && item.price > 0) {
        if (!tokenMap.has(key)) {
          tokenMap.set(key, {
            currency: item.currency,
            price: item.price,
            date: new Date(item.date)
          });
        } else {
          const existing = tokenMap.get(key);
          const itemDate = new Date(item.date);
          if (itemDate > existing.date) {
            tokenMap.set(key, {
              currency: item.currency,
              price: item.price,
              date: itemDate
            });
          }
        }
      }
    });
    
    // Convert to array and sort
    tokens = Array.from(tokenMap.values())
      .map(item => ({
        currency: item.currency,
        price: item.price
      }))
      .sort((a, b) => a.currency.localeCompare(b.currency));
    
    // Create price lookup
    prices = tokens.reduce((acc, token) => {
      acc[token.currency] = token.price;
      return acc;
    }, {});
    
    console.log(`Loaded ${tokens.length} tokens with prices`);
  } catch (error) {
    console.error('Error fetching prices:', error);
    throw error;
  }
}

// Setup event listeners
function setupEventListeners() {
  // Token selectors
  fromTokenSelector.addEventListener('click', () => openTokenModal('from'));
  toTokenSelector.addEventListener('click', () => openTokenModal('to'));
  
  // Modal controls
  modalClose.addEventListener('click', closeTokenModal);
  tokenModal.querySelector('.modal-backdrop').addEventListener('click', closeTokenModal);
  
  // Search
  tokenSearch.addEventListener('input', handleTokenSearch);
  
  // Amount input
  fromAmount.addEventListener('input', handleAmountInput);
  
  // Swap direction
  swapDirectionBtn.addEventListener('click', swapTokenDirection);
  
  // Form submit
  swapForm.addEventListener('submit', handleSwapSubmit);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && tokenModal.style.display !== 'none') {
      closeTokenModal();
    }
  });
}

// Open token selection modal
function openTokenModal(target) {
  currentModalTarget = target;
  tokenModal.style.display = 'flex';
  tokenSearch.value = '';
  renderTokenList(tokens);
  tokenSearch.focus();
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

// Close token selection modal
function closeTokenModal() {
  tokenModal.style.display = 'none';
  currentModalTarget = null;
  document.body.style.overflow = '';
}

// Handle token search
function handleTokenSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  
  if (!query) {
    renderTokenList(tokens);
    return;
  }
  
  const filtered = tokens.filter(token => 
    token.currency.toLowerCase().includes(query)
  );
  
  renderTokenList(filtered);
}

// Render token list
function renderTokenList(tokensToRender) {
  if (tokensToRender.length === 0) {
    tokenList.innerHTML = '<div class="loading-tokens">No tokens found</div>';
    return;
  }
  
  const html = tokensToRender.map(token => {
    const iconUrl = getTokenIconUrl(token.currency);
    const isSelected = (currentModalTarget === 'from' && selectedFromToken?.currency === token.currency) ||
                       (currentModalTarget === 'to' && selectedToToken?.currency === token.currency);
    const isDisabled = (currentModalTarget === 'from' && selectedToToken?.currency === token.currency) ||
                       (currentModalTarget === 'to' && selectedFromToken?.currency === token.currency);
    
    if (isDisabled) return '';
    
    return `
      <div class="token-item ${isSelected ? 'selected' : ''}" data-currency="${token.currency}">
        <img src="${iconUrl}" alt="${token.currency}" class="token-item-icon" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23334155%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2250%22 font-size=%2240%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%2394a3b8%22>${token.currency.charAt(0)}</text></svg>'" />
        <div class="token-item-info">
          <div class="token-item-symbol">${token.currency}</div>
          <div class="token-item-name">${getTokenName(token.currency)}</div>
        </div>
        <div class="token-item-price">$${formatPrice(token.price)}</div>
      </div>
    `;
  }).join('');
  
  tokenList.innerHTML = html;
  
  // Add click listeners
  tokenList.querySelectorAll('.token-item').forEach(item => {
    item.addEventListener('click', () => {
      const currency = item.dataset.currency;
      selectToken(currency);
    });
  });
}

// Select a token
function selectToken(currency) {
  const token = tokens.find(t => t.currency === currency);
  if (!token) return;
  
  if (currentModalTarget === 'from') {
    selectedFromToken = token;
    updateTokenDisplay(fromTokenDisplay, token);
  } else {
    selectedToToken = token;
    updateTokenDisplay(toTokenDisplay, token);
  }
  
  closeTokenModal();
  calculateExchange();
  updateSubmitButton();
}

// Update token display
function updateTokenDisplay(displayElement, token) {
  const iconUrl = getTokenIconUrl(token.currency);
  displayElement.innerHTML = `
    <img src="${iconUrl}" alt="${token.currency}" class="token-icon" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%230f172a%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2250%22 font-size=%2240%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%2364748b%22>${token.currency.charAt(0)}</text></svg>'" />
    <span>${token.currency}</span>
  `;
}

// Get token icon URL
function getTokenIconUrl(currency) {
  return `${TOKEN_ICONS_BASE}/${currency}.svg`;
}

// Get token name (simplified - in production this would come from API)
function getTokenName(currency) {
  const names = {
    'SWTH': 'Switcheo',
    'ETH': 'Ethereum',
    'USDC': 'USD Coin',
    'BTC': 'Bitcoin',
    'WBTC': 'Wrapped Bitcoin',
    'USD': 'US Dollar',
    'EUR': 'Euro',
    'GBP': 'British Pound'
  };
  return names[currency] || currency;
}

// Format price
function formatPrice(price) {
  if (price >= 1) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  // For small numbers, show more decimals
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 });
}

// Format amount
function formatAmount(amount) {
  if (!amount || isNaN(amount)) return '0.0';
  const num = parseFloat(amount);
  if (num === 0) return '0.0';
  if (num < 0.000001) return num.toExponential(4);
  if (num < 1) return num.toFixed(6);
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

// Handle amount input
function handleAmountInput(e) {
  let value = e.target.value;
  
  // Allow only numbers and one decimal point
  value = value.replace(/[^0-9.]/g, '');
  
  // Ensure only one decimal point
  const parts = value.split('.');
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Update input
  e.target.value = value;
  
  // Validate and calculate
  validateAmount(value);
  calculateExchange();
}

// Validate amount
function validateAmount(value) {
  fromError.textContent = '';
  document.querySelector('.input-section').classList.remove('error');
  
  if (!value || value === '0' || value === '0.') {
    return false;
  }
  
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    fromError.textContent = 'Please enter a valid number';
    document.querySelector('.input-section').classList.add('error');
    return false;
  }
  
  if (num <= 0) {
    fromError.textContent = 'Amount must be greater than 0';
    document.querySelector('.input-section').classList.add('error');
    return false;
  }
  
  if (num > 1000000000) {
    fromError.textContent = 'Amount too large';
    document.querySelector('.input-section').classList.add('error');
    return false;
  }
  
  return true;
}

// Calculate exchange
function calculateExchange() {
  if (!selectedFromToken || !selectedToToken || !fromAmount.value) {
    toAmount.value = '';
    exchangeRate.textContent = '';
    updateSubmitButton();
    return;
  }
  
  const amount = parseFloat(fromAmount.value);
  if (isNaN(amount) || amount <= 0) {
    toAmount.value = '';
    exchangeRate.textContent = '';
    updateSubmitButton();
    return;
  }
  
  // Calculate exchange: (amount * fromPrice) / toPrice
  const fromPrice = prices[selectedFromToken.currency];
  const toPrice = prices[selectedToToken.currency];
  
  const result = (amount * fromPrice) / toPrice;
  toAmount.value = formatAmount(result);
  
  // Show exchange rate
  const rate = fromPrice / toPrice;
  exchangeRate.textContent = `1 ${selectedFromToken.currency} ≈ ${formatAmount(rate)} ${selectedToToken.currency}`;
  
  updateSubmitButton();
}

// Swap token direction
function swapTokenDirection() {
  if (!selectedFromToken || !selectedToToken) return;
  
  // Swap tokens
  const temp = selectedFromToken;
  selectedFromToken = selectedToToken;
  selectedToToken = temp;
  
  // Update displays
  updateTokenDisplay(fromTokenDisplay, selectedFromToken);
  updateTokenDisplay(toTokenDisplay, selectedToToken);
  
  // Recalculate
  calculateExchange();
}

// Update submit button state
function updateSubmitButton() {
  const hasTokens = selectedFromToken && selectedToToken;
  const hasValidAmount = fromAmount.value && parseFloat(fromAmount.value) > 0;
  const isValid = hasTokens && hasValidAmount && !fromError.textContent;
  
  if (!hasTokens) {
    submitBtn.querySelector('.btn-text').textContent = 'Select Tokens';
    submitBtn.disabled = true;
  } else if (!hasValidAmount) {
    submitBtn.querySelector('.btn-text').textContent = 'Enter Amount';
    submitBtn.disabled = true;
  } else if (!isValid) {
    submitBtn.querySelector('.btn-text').textContent = 'Invalid Amount';
    submitBtn.disabled = true;
  } else {
    submitBtn.querySelector('.btn-text').textContent = 'Confirm Swap';
    submitBtn.disabled = false;
  }
}

// Handle swap submit
async function handleSwapSubmit(e) {
  e.preventDefault();
  
  if (isSwapping || submitBtn.disabled) return;
  
  // Validate
  if (!selectedFromToken || !selectedToToken) {
    showError('Please select tokens');
    return;
  }
  
  const amount = parseFloat(fromAmount.value);
  if (!amount || amount <= 0) {
    showError('Please enter a valid amount');
    return;
  }
  
  // Start loading
  isSwapping = true;
  submitBtn.disabled = true;
  submitBtn.querySelector('.btn-text').style.display = 'none';
  submitBtn.querySelector('.loader').style.display = 'block';
  successMessage.style.display = 'none';
  
  try {
    // Simulate backend call
    await new Promise(resolve => setTimeout(resolve, SWAP_DELAY));
    
    // Show success
    successMessage.style.display = 'flex';
    
    // Reset form after delay
    setTimeout(() => {
      resetForm();
      successMessage.style.display = 'none';
    }, 3000);
    
  } catch (error) {
    console.error('Swap error:', error);
    showError('Swap failed. Please try again.');
  } finally {
    isSwapping = false;
    submitBtn.disabled = false;
    submitBtn.querySelector('.btn-text').style.display = 'inline';
    submitBtn.querySelector('.loader').style.display = 'none';
  }
}

// Reset form
function resetForm() {
  fromAmount.value = '';
  toAmount.value = '';
  selectedFromToken = null;
  selectedToToken = null;
  fromTokenDisplay.innerHTML = '<span class="token-placeholder">Select token</span>';
  toTokenDisplay.innerHTML = '<span class="token-placeholder">Select token</span>';
  exchangeRate.textContent = '';
  fromError.textContent = '';
  toError.textContent = '';
  document.querySelector('.input-section').classList.remove('error');
  updateSubmitButton();
}

// Show error
function showError(message) {
  fromError.textContent = message;
  document.querySelector('.input-section').classList.add('error');
}

// Start the app
init();

