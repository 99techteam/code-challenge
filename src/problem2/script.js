/**
 * Currency Swap Form - JavaScript Logic
 * Features:
 * - Real-time exchange rate calculation
 * - Input validation
 * - Error handling
 * - Loading states
 * - Responsive UX
 */

// DOM Elements
const form = document.getElementById('swap-form');
const inputAmountEl = document.getElementById('input-amount');
const outputAmountEl = document.getElementById('output-amount');
const fromCurrencyEl = document.getElementById('from-currency');
const toCurrencyEl = document.getElementById('to-currency');
const swapBtn = document.getElementById('swap-btn');
const confirmBtn = document.getElementById('confirm-btn');
const exchangeInfoEl = document.getElementById('exchange-info');
const rateTextEl = document.getElementById('rate-text');
const lastUpdatedEl = document.getElementById('last-updated');
const errorAlert = document.getElementById('error-alert');
const successAlert = document.getElementById('success-alert');
const loadingSpinner = document.getElementById('loading-spinner');
const fromError = document.getElementById('from-error');
const toError = document.getElementById('to-error');

// State
let exchangeRates = {};
let lastUpdateTime = null;
let isLoading = false;

/**
 * Fetch exchange rates from a free API (using exchangerate-api.com or similar)
 * Alternative: Use a mock data approach for development
 */
async function fetchExchangeRates() {
  try {
    showLoading(true);
    hideAlert('error');
    hideAlert('success');

    // Using exchangerate-api.com free API
    const baseCurrency = 'USD';
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`,
      { 
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    exchangeRates = data.rates;
    lastUpdateTime = new Date();

    console.log('Exchange rates updated:', exchangeRates);
    showAlert('success', 'Exchange rates loaded successfully!');
    
  } catch (error) {
    console.error('Error fetching rates:', error);
    // Fallback to mock data
    useMockData();
    showAlert('error', 'Using demo rates (real rates unavailable)');
  } finally {
    showLoading(false);
  }
}

/**
 * Mock exchange rates for demo/fallback purposes
 */
function useMockData() {
  exchangeRates = {
    'USD': 1.0,
    'EUR': 0.92,
    'GBP': 0.79,
    'JPY': 149.50,
    'AUD': 1.53,
    'CAD': 1.36,
    'CHF': 0.88,
    'CNY': 7.24,
    'SEK': 10.50,
    'NZD': 1.68,
    'VND': 24500.00
  };
  lastUpdateTime = new Date();
  console.log('Using mock exchange rates');
}

/**
 * Calculate the converted amount based on exchange rates
 */
function calculateExchangeRate() {
  const inputAmount = parseFloat(inputAmountEl.value) || 0;
  const fromCurrency = fromCurrencyEl.value;
  const toCurrency = toCurrencyEl.value;

  // Clear previous errors
  clearErrors();

  // Validation
  if (inputAmount < 0) {
    showError('from', 'Amount cannot be negative');
    outputAmountEl.value = '';
    exchangeInfoEl.style.display = 'none';
    return;
  }

  if (inputAmount === 0) {
    outputAmountEl.value = '';
    exchangeInfoEl.style.display = 'none';
    return;
  }

  if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
    showError('from', 'Exchange rate not available for selected currency');
    outputAmountEl.value = '';
    exchangeInfoEl.style.display = 'none';
    return;
  }

  // Calculate: Convert to base (USD) then to target currency
  const amountInUSD = inputAmount / exchangeRates[fromCurrency];
  const convertedAmount = amountInUSD * exchangeRates[toCurrency];

  // Format to 2 decimal places
  outputAmountEl.value = convertedAmount.toFixed(2);

  // Update exchange rate display
  updateExchangeRateDisplay(fromCurrency, toCurrency);
  exchangeInfoEl.style.display = 'block';
}

/**
 * Update the exchange rate display information
 */
function updateExchangeRateDisplay(from, to) {
  const rate = (exchangeRates[to] / exchangeRates[from]).toFixed(4);
  rateTextEl.textContent = `1 ${from} = ${rate} ${to}`;
  
  if (lastUpdateTime) {
    const now = new Date();
    const diffSeconds = Math.floor((now - lastUpdateTime) / 1000);
    
    if (diffSeconds < 60) {
      lastUpdatedEl.textContent = 'Updated just now';
    } else if (diffSeconds < 3600) {
      const minutes = Math.floor(diffSeconds / 60);
      lastUpdatedEl.textContent = `Updated ${minutes}m ago`;
    } else {
      const hours = Math.floor(diffSeconds / 3600);
      lastUpdatedEl.textContent = `Updated ${hours}h ago`;
    }
  }
}

/**
 * Swap the from and to currencies
 */
function handleSwapCurrencies() {
  const tempCurrency = fromCurrencyEl.value;
  fromCurrencyEl.value = toCurrencyEl.value;
  toCurrencyEl.value = tempCurrency;

  // Swap amounts if input has a value
  if (inputAmountEl.value) {
    const tempAmount = inputAmountEl.value;
    inputAmountEl.value = outputAmountEl.value;
    outputAmountEl.value = tempAmount;
  }

  calculateExchangeRate();
  inputAmountEl.focus();
}

/**
 * Handle form submission
 */
function handleSwap(event) {
  event.preventDefault();

  const inputAmount = parseFloat(inputAmountEl.value);
  const outputAmount = parseFloat(outputAmountEl.value);
  const fromCurrency = fromCurrencyEl.value;
  const toCurrency = toCurrencyEl.value;

  // Validation
  clearErrors();
  let isValid = true;

  if (!inputAmount || inputAmount <= 0) {
    showError('from', 'Please enter a valid amount');
    isValid = false;
  }

  if (fromCurrency === toCurrency) {
    showError('to', 'Please select different currencies');
    isValid = false;
  }

  if (!isValid) {
    return false;
  }

  // Show success message
  showAlert(
    'success',
    `Swapping ${inputAmount.toFixed(2)} ${fromCurrency} for ${outputAmount.toFixed(2)} ${toCurrency}`
  );

  // Reset form after 2 seconds
  setTimeout(() => {
    form.reset();
    outputAmountEl.value = '';
    exchangeInfoEl.style.display = 'none';
    hideAlert('success');
    clearErrors();
  }, 2000);

  return false;
}

/**
 * Show error message for a field
 */
function showError(field, message) {
  const errorElement = field === 'from' ? fromError : toError;
  errorElement.textContent = message;
  errorElement.style.display = 'block';
}

/**
 * Clear all error messages
 */
function clearErrors() {
  fromError.textContent = '';
  fromError.style.display = 'none';
  toError.textContent = '';
  toError.style.display = 'none';
}

/**
 * Show loading spinner
 */
function showLoading(show) {
  isLoading = show;
  loadingSpinner.style.display = show ? 'block' : 'none';
  confirmBtn.disabled = show;
}

/**
 * Show alert message
 */
function showAlert(type, message) {
  const alertEl = type === 'error' ? errorAlert : successAlert;
  alertEl.textContent = message;
  alertEl.style.display = 'flex';
}

/**
 * Hide alert message
 */
function hideAlert(type) {
  const alertEl = type === 'error' ? errorAlert : successAlert;
  alertEl.style.display = 'none';
}

/**
 * Event Listeners
 */
inputAmountEl.addEventListener('input', calculateExchangeRate);
inputAmountEl.addEventListener('change', calculateExchangeRate);
fromCurrencyEl.addEventListener('change', calculateExchangeRate);
toCurrencyEl.addEventListener('change', calculateExchangeRate);
swapBtn.addEventListener('click', handleSwapCurrencies);
form.addEventListener('submit', handleSwap);

/**
 * Initialize the application
 */
function initialize() {
  console.log('Initializing Currency Swap Form...');
  
  // Set default currency pair
  fromCurrencyEl.value = 'USD';
  toCurrencyEl.value = 'EUR';

  // Fetch exchange rates on page load
  fetchExchangeRates();

  // Refresh exchange rates every 5 minutes
  setInterval(fetchExchangeRates, 5 * 60 * 1000);

  console.log('Currency Swap Form initialized successfully!');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
