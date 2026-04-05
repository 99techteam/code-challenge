import './style.scss';

const CONFIG = {
  API_URL: 'https://interview.switcheo.com/prices.json',
  TOKEN_IMAGES_REPO: '/tokens/',
  FILTERED_CURRENCIES: ["RATOM", "ATOM", "STATOM", "STEVMOS", "STLUNA", "STOSMO"],
  SPINNER_STEP: 1,
  SWAP_DELAY: 2000,
  DECIMAL_PLACES: 6
};

const DOM = {
  // Input
  fromAmountInput: document.getElementById('from-amount'),
  toAmountInput: document.getElementById('to-amount'),
  
  // Display
  exchangeRateSpan: document.getElementById('exchange-rate'),
  fromBalanceSpan: document.getElementById('from-balance'),
  toBalanceSpan: document.getElementById('to-balance'),
  
  // Button
  swapButton: document.getElementById('swap-button'),
  swapCurrenciesButton: document.getElementById('swap-currencies'),
  spinnerButtons: document.querySelectorAll('.currency-swap-form__spinner-button'),
  
  // Status
  loadingIndicator: document.getElementById('loading-indicator'),
  errorMessage: document.getElementById('error-message'),
  
  // Transaction detail
  payCurrencySpan: document.getElementById('pay-currency'),
  receiveCurrencySpan: document.getElementById('receive-currency'),
  payIcon: document.getElementById('pay-icon'),
  receiveIcon: document.getElementById('receive-icon'),
  
  // Dropdown
  fromCurrency: {
    dropdown: document.getElementById('from-currency-dropdown'),
    selected: null,
    options: null
  },
  toCurrency: {
    dropdown: document.getElementById('to-currency-dropdown'),
    selected: null,
    options: null
  }
};

// Initialize dropdown
DOM.fromCurrency.selected = DOM.fromCurrency.dropdown.querySelector('.currency-swap-form__dropdown-selected');
DOM.fromCurrency.options = DOM.fromCurrency.dropdown.querySelector('.currency-swap-form__dropdown-options');
DOM.toCurrency.selected = DOM.toCurrency.dropdown.querySelector('.currency-swap-form__dropdown-selected');
DOM.toCurrency.options = DOM.toCurrency.dropdown.querySelector('.currency-swap-form__dropdown-options');

const AppState = {
  tokenPrices: {},
  tokens: [],
  isLoading: false
};

const Utils = {
  /**
   * Creates a fallback image URL for tokens
   */
  getFallbackImageUrl() {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiM0YTRhNGEiLz4KPHR1eHQgeD0iMTIiIHk9IjE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxMCIgZm9udC1mYW1pbHk9IkludGVyIiBmb250LXdlaWdodD0iNTAwIj4/PC90ZXh0Pgo8L3N2Zz4K';
  },

  /**
   * Sets up image error handling for token icons
   */
  setupImageErrorHandling(img) {
    img.onerror = () => {
      img.src = this.getFallbackImageUrl();
    };
  },

  /**
   * Shows/hides loading state
   */
  setLoadingState(isLoading) {
    AppState.isLoading = isLoading;
    DOM.loadingIndicator.style.display = isLoading ? 'block' : 'none';
    DOM.swapButton.disabled = isLoading;
  },

  /**
   * Shows error message
   */
  showError(message) {
    DOM.errorMessage.textContent = message;
    DOM.errorMessage.style.display = 'block';
  },

  /**
   * Hides error message
   */
  hideError() {
    DOM.errorMessage.style.display = 'none';
  }
};

const API = {
  /**
   * Fetches exchange rates from the API
   */
  async fetchExchangeRates() {
    try {
      Utils.hideError();
      Utils.setLoadingState(true);

      const response = await fetch(CONFIG.API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const validPrices = data.filter(item => item.price && parseFloat(item.price) > 0);
      
      AppState.tokenPrices = validPrices.reduce((acc, item) => {
        acc[item.currency] = parseFloat(item.price);
        return acc;
      }, {});

      CurrencyManager.populateCurrencies();
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      Utils.showError('Failed to load exchange rates. Please try again later.');
    } finally {
      Utils.setLoadingState(false);
    }
  }
};

const CurrencyManager = {
  /**
   * Populates currency dropdowns with available tokens
   */
  populateCurrencies() {
    const uniqueCurrencies = new Set(Object.keys(AppState.tokenPrices));
    
    AppState.tokens = Array.from(uniqueCurrencies)
      .filter(currency => !CONFIG.FILTERED_CURRENCIES.includes(currency))
      .sort();

    this.clearDropdowns();
    this.populateDropdowns();
    this.setDefaultSelections();
    
    TransactionManager.updateTransactionDetails();
    ExchangeCalculator.calculateExchange();
  },

  /**
   * Clears all dropdown options
   */
  clearDropdowns() {
    DOM.fromCurrency.options.innerHTML = '';
    DOM.toCurrency.options.innerHTML = '';
  },

  /**
   * Populates both dropdowns with token options
   */
  populateDropdowns() {
    AppState.tokens.forEach(currency => {
      const optionFrom = this.createDropdownOption(currency, DOM.fromCurrency.dropdown);
      const optionTo = this.createDropdownOption(currency, DOM.toCurrency.dropdown);
      
      DOM.fromCurrency.options.appendChild(optionFrom);
      DOM.toCurrency.options.appendChild(optionTo);
    });
  },

  /**
   * Sets default currency selections
   */
  setDefaultSelections() {
    if (AppState.tokens.length > 1) {
      this.setDropdownSelection(DOM.fromCurrency.dropdown, AppState.tokens[0]);
      this.setDropdownSelection(DOM.toCurrency.dropdown, AppState.tokens[1]);
    } else if (AppState.tokens.length === 1) {
      this.setDropdownSelection(DOM.fromCurrency.dropdown, AppState.tokens[0]);
      this.setDropdownSelection(DOM.toCurrency.dropdown, AppState.tokens[0]);
    }
  },

  /**
   * Creates a dropdown option element
   */
  createDropdownOption(currency, parentDropdown) {
    const option = document.createElement('div');
    option.classList.add('currency-swap-form__dropdown-option');
    option.dataset.currency = currency;

    const img = this.createTokenImage(currency);
    const span = this.createTokenLabel(currency);

    option.appendChild(img);
    option.appendChild(span);

    option.addEventListener('click', () => {
      this.handleOptionClick(parentDropdown, currency);
    });

    return option;
  },

  /**
   * Creates token image element
   */
  createTokenImage(currency) {
    const img = document.createElement('img');
    img.src = `${CONFIG.TOKEN_IMAGES_REPO}${currency}.svg`;
    img.alt = currency;
    img.classList.add('currency-swap-form__token-icon');
    Utils.setupImageErrorHandling(img);
    return img;
  },

  /**
   * Creates token label element
   */
  createTokenLabel(currency) {
    const span = document.createElement('span');
    span.classList.add('currency-swap-form__token-name');
    span.textContent = currency;
    return span;
  },

  /**
   * Handles dropdown option click
   */
  handleOptionClick(parentDropdown, currency) {
    this.setDropdownSelection(parentDropdown, currency);
    parentDropdown.classList.remove('open');
    TransactionManager.updateTransactionDetails();
    ExchangeCalculator.calculateExchange();
  },

  /**
   * Sets the selected value for a dropdown
   */
  setDropdownSelection(dropdownElement, currency) {
    const selectedElement = dropdownElement.querySelector('.currency-swap-form__dropdown-selected');
    const iconElement = selectedElement.querySelector('.currency-swap-form__token-icon');
    const nameElement = selectedElement.querySelector('.currency-swap-form__token-name');

    selectedElement.dataset.currency = currency;
    iconElement.src = `${CONFIG.TOKEN_IMAGES_REPO}${currency}.svg`;
    iconElement.alt = currency;
    Utils.setupImageErrorHandling(iconElement);
    nameElement.textContent = currency;
  },

  /**
   * Swaps the selected currencies between from and to dropdowns
   */
  swapCurrencies() {
    const fromCurrency = DOM.fromCurrency.selected.dataset.currency;
    const toCurrency = DOM.toCurrency.selected.dataset.currency;

    if (fromCurrency && toCurrency) {
      this.setDropdownSelection(DOM.fromCurrency.dropdown, toCurrency);
      this.setDropdownSelection(DOM.toCurrency.dropdown, fromCurrency);
      
      // Swap input values
      const fromValue = DOM.fromAmountInput.value;
      const toValue = DOM.toAmountInput.value;
      DOM.fromAmountInput.value = toValue;
      DOM.toAmountInput.value = fromValue;

      TransactionManager.updateTransactionDetails();
      ExchangeCalculator.calculateExchange();
    }
  }
};

const TransactionManager = {
  /**
   * Updates transaction details display
   */
  updateTransactionDetails() {
    const fromCurrency = DOM.fromCurrency.selected.dataset.currency;
    const toCurrency = DOM.toCurrency.selected.dataset.currency;

    this.updateCurrencyLabels(fromCurrency, toCurrency);
    this.updateCurrencyIcons(fromCurrency, toCurrency);
    this.updateBalanceDisplays(fromCurrency, toCurrency);
  },

  /**
   * Updates currency labels in transaction details
   */
  updateCurrencyLabels(fromCurrency, toCurrency) {
    DOM.payCurrencySpan.textContent = fromCurrency;
    DOM.receiveCurrencySpan.textContent = toCurrency;
  },

  /**
   * Updates currency icons in transaction details
   */
  updateCurrencyIcons(fromCurrency, toCurrency) {
    DOM.payIcon.src = `${CONFIG.TOKEN_IMAGES_REPO}${fromCurrency}.svg`;
    DOM.payIcon.alt = fromCurrency;
    Utils.setupImageErrorHandling(DOM.payIcon);

    DOM.receiveIcon.src = `${CONFIG.TOKEN_IMAGES_REPO}${toCurrency}.svg`;
    DOM.receiveIcon.alt = toCurrency;
    Utils.setupImageErrorHandling(DOM.receiveIcon);
  },

  /**
   * Updates balance displays (mock data)
   */
  updateBalanceDisplays(fromCurrency, toCurrency) {
    DOM.fromBalanceSpan.textContent = `100 ${fromCurrency}`;
    DOM.toBalanceSpan.textContent = `0 ${toCurrency}`;
  }
};

const ExchangeCalculator = {
  /**
   * Gets exchange rate between two currencies
   */
  getRate(from, to) {
    if (from === to) return 1;
    
    const fromPrice = AppState.tokenPrices[from];
    const toPrice = AppState.tokenPrices[to];

    return (fromPrice && toPrice) ? fromPrice / toPrice : null;
  },

  /**
   * Calculates and updates exchange amounts
   */
  calculateExchange() {
    const fromAmount = parseFloat(DOM.fromAmountInput.value);
    const fromCurrency = DOM.fromCurrency.selected.dataset.currency;
    const toCurrency = DOM.toCurrency.selected.dataset.currency;

    Utils.hideError();

    if (isNaN(fromAmount) || fromAmount <= 0) {
      this.clearExchangeDisplay(fromCurrency, toCurrency);
      return;
    }

    const rate = this.getRate(fromCurrency, toCurrency);

    if (rate !== null) {
      this.updateExchangeDisplay(fromAmount, rate, fromCurrency, toCurrency);
    } else {
      this.handleNoRateAvailable(fromCurrency, toCurrency);
    }
  },

  /**
   * Clears exchange display when no valid amount
   */
  clearExchangeDisplay(fromCurrency, toCurrency) {
    DOM.toAmountInput.value = '';
    DOM.exchangeRateSpan.textContent = fromCurrency && toCurrency 
      ? `1 ${fromCurrency} ≈ -- ${toCurrency}` 
      : '--';
    DOM.swapButton.disabled = true;
  },

  /**
   * Updates exchange display with calculated values
   */
  updateExchangeDisplay(fromAmount, rate, fromCurrency, toCurrency) {
    const toAmount = fromAmount * rate;
    DOM.toAmountInput.value = toAmount.toFixed(CONFIG.DECIMAL_PLACES);
    DOM.exchangeRateSpan.textContent = `1 ${fromCurrency} ≈ ${rate.toFixed(CONFIG.DECIMAL_PLACES)} ${toCurrency}`;
    DOM.swapButton.disabled = false;
  },

  /**
   * Handles case when no exchange rate is available
   */
  handleNoRateAvailable(fromCurrency, toCurrency) {
    DOM.toAmountInput.value = '';
    DOM.exchangeRateSpan.textContent = 'No direct exchange rate available';
    DOM.swapButton.disabled = true;
    Utils.showError(`No direct exchange rate found for ${fromCurrency} to ${toCurrency}.`);
  }
};

const InputHandlers = {
  /**
   * Handles spinner button clicks
   */
  handleSpinnerClick(button) {
    const inputId = button.dataset.input;
    const input = document.getElementById(inputId);
    const isUp = button.classList.contains('currency-swap-form__spinner-button--up');
    
    if (input.readOnly || input.disabled) return;
    
    let currentValue = parseFloat(input.value) || 0;
    
    if (isUp) {
      currentValue += CONFIG.SPINNER_STEP;
    } else {
      currentValue = Math.max(0, currentValue - CONFIG.SPINNER_STEP);
    }
    
    input.value = currentValue;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  },

  /**
   * Handles swap execution
   */
  async handleSwap() {
    const fromAmount = parseFloat(DOM.fromAmountInput.value);
    const fromCurrency = DOM.fromCurrency.selected.dataset.currency;
    const toCurrency = DOM.toCurrency.selected.dataset.currency;

    if (!this.validateSwapInputs(fromAmount, fromCurrency, toCurrency)) {
      return;
    }

    await this.executeSwap(fromAmount, fromCurrency, toCurrency);
  },

  /**
   * Validates swap inputs
   */
  validateSwapInputs(fromAmount, fromCurrency, toCurrency) {
    if (isNaN(fromAmount) || fromAmount <= 0) {
      Utils.showError('Please enter a valid amount to swap.');
      return false;
    }

    const rate = ExchangeCalculator.getRate(fromCurrency, toCurrency);
    if (rate === null) {
      Utils.showError(`Cannot swap: No exchange rate found for ${fromCurrency} to ${toCurrency}.`);
      return false;
    }

    return true;
  },

  /**
   * Executes the swap transaction
   */
  async executeSwap(fromAmount, fromCurrency, toCurrency) {
    Utils.hideError();
    Utils.setLoadingState(true);

    await new Promise(resolve => setTimeout(resolve, CONFIG.SWAP_DELAY));

    Utils.setLoadingState(false);

    alert(`Swapped ${fromAmount} ${fromCurrency} to ${DOM.toAmountInput.value} ${toCurrency}`);

    DOM.fromAmountInput.value = '';
    DOM.toAmountInput.value = '';
    DOM.exchangeRateSpan.textContent = `1 ${fromCurrency} ≈ -- ${toCurrency}`;
  }
};

const EventHandlers = {
  /**
   * Sets up all event listeners
   */
  init() {
    this.setupInputListeners();
    this.setupButtonListeners();
    this.setupDropdownListeners();
    this.setupDocumentListeners();
  },

  /**
   * Sets up input event listeners
   */
  setupInputListeners() {
    DOM.fromAmountInput.addEventListener('input', ExchangeCalculator.calculateExchange.bind(ExchangeCalculator));
    DOM.toAmountInput.addEventListener('input', ExchangeCalculator.calculateExchange.bind(ExchangeCalculator));
  },

  /**
   * Sets up button event listeners
   */
  setupButtonListeners() {
    DOM.swapButton.addEventListener('click', InputHandlers.handleSwap.bind(InputHandlers));
    DOM.swapCurrenciesButton.addEventListener('click', CurrencyManager.swapCurrencies.bind(CurrencyManager));
    
    DOM.spinnerButtons.forEach(button => {
      button.addEventListener('click', () => InputHandlers.handleSpinnerClick(button));
    });
  },

  /**
   * Sets up dropdown event listeners
   */
  setupDropdownListeners() {
    DOM.fromCurrency.selected.addEventListener('click', () => {
      DOM.fromCurrency.dropdown.classList.toggle('open');
      DOM.toCurrency.dropdown.classList.remove('open');
    });

    DOM.toCurrency.selected.addEventListener('click', () => {
      DOM.toCurrency.dropdown.classList.toggle('open');
      DOM.fromCurrency.dropdown.classList.remove('open');
    });
  },

  /**
   * Sets up document-level event listeners
   */
  setupDocumentListeners() {
    document.addEventListener('click', (event) => {
      if (!DOM.fromCurrency.dropdown.contains(event.target)) {
        DOM.fromCurrency.dropdown.classList.remove('open');
      }
      if (!DOM.toCurrency.dropdown.contains(event.target)) {
        DOM.toCurrency.dropdown.classList.remove('open');
      }
    });
  }
};

const App = {
  /**
   * Initializes the application
   */
  async init() {
    console.log('🚀 Initializing Currency Swap Application...');
    
    try {
      EventHandlers.init();
      await API.fetchExchangeRates();
      console.log('✅ Application initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      Utils.showError('Failed to initialize application. Please refresh the page.');
    }
  }
};

// Start the application
App.init();
