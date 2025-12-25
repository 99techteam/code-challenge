// Constants
const API_URL = 'https://api.exchangerate-api.com/v4/latest/';
const DEFAULT_BASE_CURRENCY = 'USD';
const MAX_AMOUNT = 1000000;
const MIN_AMOUNT = 0;
const DECIMAL_PLACES = 2;
const RATE_DECIMAL_PLACES = 4;
const INPUT_DEBOUNCE_MS = 300;
const SUCCESS_MESSAGE_DURATION = 5000;
const SUBMIT_SIMULATION_DELAY = 2000;

// Error messages
const ERROR_MESSAGES = {
  INVALID_AMOUNT: 'Please enter an amount greater than 0',
  MAX_AMOUNT_EXCEEDED: 'Amount exceeds maximum limit of 1,000,000',
  INVALID_CONVERSION: 'Invalid conversion amount',
  SAME_CURRENCY: 'Please select different currencies',
};

// State
let exchangeRates = {};
let currentBaseCurrency = DEFAULT_BASE_CURRENCY;
let abortController = null;
let inputDebounceTimer = null;

// DOM Elements - cached for performance
const form = document.getElementById('swapForm');
const inputAmount = document.getElementById('input-amount');
const outputAmount = document.getElementById('output-amount');
const inputCurrency = document.getElementById('input-currency');
const outputCurrency = document.getElementById('output-currency');
const swapBtn = document.getElementById('swapBtn');
const submitBtn = document.getElementById('submitBtn');
const rateInfo = document.getElementById('rateInfo');
const rateText = document.getElementById('rateText');
const successMessage = document.getElementById('successMessage');
const inputGroup = document.getElementById('inputGroup');
const outputGroup = document.getElementById('outputGroup');
const inputError = document.getElementById('inputError');
const outputError = document.getElementById('outputError');
const inputErrorText = document.getElementById('inputErrorText');
const outputErrorText = document.getElementById('outputErrorText');
const submitStatus = document.getElementById('submit-status');
const currencyIcons = document.querySelectorAll('.currency-icon');

/** Fetch exchange rates from API */
async function fetchExchangeRates(base = DEFAULT_BASE_CURRENCY) {
  // Cancel any ongoing request to prevent race conditions
  if (abortController) {
    abortController.abort();
  }

  abortController = new AbortController();
  const { signal } = abortController;

  try {
    const response = await fetch(`${API_URL}${base}`, { signal });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data?.rates) {
      throw new Error('Invalid API response: missing rates');
    }

    exchangeRates = data.rates;
    currentBaseCurrency = base;
    return true;
  } catch (error) {
    // Don't log errors for aborted requests
    if (error.name === 'AbortError') {
      return false;
    }
    console.error('Error fetching exchange rates:', error);
    return false;
  }
}

/** Clear all form errors and reset error states */
function clearErrors() {
  inputGroup?.classList.remove('error');
  outputGroup?.classList.remove('error');
  inputError?.classList.remove('show');
  outputError?.classList.remove('show');
  inputAmount?.setAttribute('aria-invalid', 'false');
  outputAmount?.setAttribute('aria-invalid', 'false');
}

/** Clear success message */
function clearSuccessMessage() {
  successMessage?.classList.remove('show');
}

/** Update currency icon based on selected currency */
function updateCurrencyIcon(select, iconElement) {
  if (!select || !iconElement) return;

  const selectedOption = select.options[select.selectedIndex];
  const icon = selectedOption?.getAttribute('data-icon') || '';
  iconElement.textContent = icon;
}

/** Calculate and display currency conversion */
function calculateConversion() {
  const input = parseFloat(inputAmount?.value || 0);
  const fromCurrency = inputCurrency?.value;
  const toCurrency = outputCurrency?.value;

  // Validate input and exchange rates availability
  if (
    !input ||
    input <= MIN_AMOUNT ||
    !fromCurrency ||
    !toCurrency ||
    !exchangeRates[toCurrency]
  ) {
    if (outputAmount) outputAmount.value = '';
    rateInfo?.classList.remove('show');
    return;
  }

  // Calculate exchange rate
  let rate;
  if (currentBaseCurrency === fromCurrency) {
    rate = exchangeRates[toCurrency];
  } else if (currentBaseCurrency === toCurrency) {
    rate = 1 / exchangeRates[fromCurrency];
  } else {
    // Convert through base currency
    const toBase = 1 / exchangeRates[fromCurrency];
    rate = toBase * exchangeRates[toCurrency];
  }

  // Update output amount
  const result = (input * rate).toFixed(DECIMAL_PLACES);
  if (outputAmount) outputAmount.value = result;

  // Update rate info display
  if (rateText) {
    rateText.textContent = `1 ${fromCurrency} = ${rate.toFixed(
      RATE_DECIMAL_PLACES
    )} ${toCurrency}`;
  }
  rateInfo?.classList.add('show');
}

/** Set error state for a field */
function setFieldError(
  group,
  errorElement,
  inputElement,
  errorTextElement,
  message = ''
) {
  group?.classList.add('error');
  errorElement?.classList.add('show');
  inputElement?.setAttribute('aria-invalid', 'true');
  if (errorTextElement) errorTextElement.textContent = message;
}

/** Validate form and display errors if invalid */
function validateForm() {
  clearErrors();

  const input = parseFloat(inputAmount?.value || 0);
  const output = parseFloat(outputAmount?.value || 0);
  const fromCurrency = inputCurrency?.value;
  const toCurrency = outputCurrency?.value;

  // Validate input amount
  if (!inputAmount?.value || input <= MIN_AMOUNT) {
    setFieldError(
      inputGroup,
      inputError,
      inputAmount,
      inputErrorText,
      ERROR_MESSAGES.INVALID_AMOUNT
    );
    return false;
  }

  if (input > MAX_AMOUNT) {
    setFieldError(
      inputGroup,
      inputError,
      inputAmount,
      inputErrorText,
      ERROR_MESSAGES.MAX_AMOUNT_EXCEEDED
    );
    return false;
  }

  // Validate output amount
  if (!outputAmount?.value || output <= MIN_AMOUNT) {
    setFieldError(
      outputGroup,
      outputError,
      outputAmount,
      outputErrorText,
      ERROR_MESSAGES.INVALID_CONVERSION
    );
    return false;
  }

  // Validate different currencies
  if (fromCurrency === toCurrency) {
    setFieldError(
      inputGroup,
      inputError,
      inputAmount,
      inputErrorText,
      ERROR_MESSAGES.SAME_CURRENCY
    );
    outputGroup?.classList.add('error');
    return false;
  }

  return true;
}

/** Debounce function to limit function calls */
function debounce(func, wait = INPUT_DEBOUNCE_MS) {
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(inputDebounceTimer);
      func(...args);
    };
    clearTimeout(inputDebounceTimer);
    inputDebounceTimer = setTimeout(later, wait);
  };
}

/** Handle currency swap */
function handleSwap() {
  clearErrors();
  clearSuccessMessage();

  // Swap currencies
  const tempCurrency = inputCurrency.value;
  inputCurrency.value = outputCurrency.value;
  outputCurrency.value = tempCurrency;

  // Swap amounts
  const tempAmount = inputAmount.value;
  inputAmount.value = outputAmount.value;
  outputAmount.value = tempAmount;

  // Update icons
  updateCurrencyIcon(inputCurrency, currencyIcons[0]);
  updateCurrencyIcon(outputCurrency, currencyIcons[1]);

  // Recalculate if input has value
  if (inputAmount.value) {
    calculateConversion();
  }
}

/** Handle input amount changes with debouncing */
const handleInputChange = debounce(() => {
  clearSuccessMessage();
  clearErrors();
  calculateConversion();
}, INPUT_DEBOUNCE_MS);

/** Handle input currency change */
async function handleInputCurrencyChange() {
  clearErrors();
  clearSuccessMessage();

  updateCurrencyIcon(inputCurrency, currencyIcons[0]);
  await fetchExchangeRates(inputCurrency.value);
  calculateConversion();
}

/** Handle output currency change */
function handleOutputCurrencyChange() {
  clearErrors();
  clearSuccessMessage();

  updateCurrencyIcon(outputCurrency, currencyIcons[1]);
  calculateConversion();
}

/** Focus first invalid field for accessibility */
function focusFirstInvalidField() {
  if (inputAmount?.getAttribute('aria-invalid') === 'true') {
    inputAmount.focus();
  } else if (outputAmount?.getAttribute('aria-invalid') === 'true') {
    outputAmount.focus();
  }
}

/** Set submit button loading state */
function setSubmitButtonLoading(isLoading = false) {
  if (!submitBtn) return;

  if (isLoading) {
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');
    if (submitStatus) submitStatus.textContent = 'Processing swap...';
  } else {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    submitBtn.setAttribute('aria-busy', 'false');
    if (submitStatus) submitStatus.textContent = '';
  }
}

/** Handle form submission */
async function handleFormSubmit(e) {
  e.preventDefault();

  if (!validateForm()) {
    focusFirstInvalidField();
    return;
  }

  setSubmitButtonLoading(true);

  // Simulate API call
  setTimeout(() => {
    setSubmitButtonLoading(false);
    successMessage?.classList.add('show');

    setTimeout(() => {
      clearSuccessMessage();
    }, SUCCESS_MESSAGE_DURATION);
  }, SUBMIT_SIMULATION_DELAY);
}

/** Initialize application */
async function init() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
    return;
  }

  // Initialize exchange rates
  await fetchExchangeRates(DEFAULT_BASE_CURRENCY);

  // Update currency icons
  updateCurrencyIcon(inputCurrency, currencyIcons[0]);
  updateCurrencyIcon(outputCurrency, currencyIcons[1]);

  // Attach event listeners
  swapBtn?.addEventListener('click', handleSwap);
  inputAmount?.addEventListener('input', handleInputChange);
  inputCurrency?.addEventListener('change', handleInputCurrencyChange);
  outputCurrency?.addEventListener('change', handleOutputCurrencyChange);
  form?.addEventListener('submit', handleFormSubmit);
}

// Start initialization
init();
