// @ts-nocheck
// Currency Swap Application
class CurrencySwap {
  constructor() {
    this.tokens = [];
    this.selectedFromToken = null;
    this.selectedToToken = null;
    this.currentSelector = null;
    this.exchangeRate = 0;

    this.init();
  }

  async init() {
    await this.loadTokens();
    this.setupEventListeners();
    this.initializeTokenSelectors();
    this.updateUI();
  }

  async loadTokens() {
    try {
      const response = await fetch(
        'https://interview.switcheo.com/prices.json'
      );
      const priceData = await response.json();

      // Process and deduplicate tokens
      const tokenMap = new Map();

      priceData.forEach((item) => {
        if (
          !tokenMap.has(item.currency) ||
          new Date(item.date) > new Date(tokenMap.get(item.currency).date)
        ) {
          tokenMap.set(item.currency, item);
        }
      });

      this.tokens = Array.from(tokenMap.values())
        .filter((token) => token.price > 0)
        .sort((a, b) => a.currency.localeCompare(b.currency));

      console.log('Loaded tokens:', this.tokens);
    } catch (error) {
      console.error('Error loading tokens:', error);
      this.showError('Failed to load token data. Please refresh the page.');
    }
  }

  setupEventListeners() {
    // Token selector clicks
    document
      .getElementById('from-token-selector')
      .addEventListener('click', () => {
        this.currentSelector = 'from';
        this.showTokenModal();
      });

    document
      .getElementById('to-token-selector')
      .addEventListener('click', () => {
        this.currentSelector = 'to';
        this.showTokenModal();
      });

    // Swap button
    document.getElementById('swap-tokens').addEventListener('click', () => {
      this.swapTokens();
    });

    // Amount input
    document.getElementById('from-amount').addEventListener('input', (e) => {
      this.calculateToAmount(e.target.value);
    });

    // Form submission
    document.getElementById('swap-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSwap();
    });

    // Modal events
    document.querySelector('.close-modal').addEventListener('click', () => {
      this.hideTokenModal();
    });

    document.getElementById('token-modal').addEventListener('click', (e) => {
      if (e.target.id === 'token-modal') {
        this.hideTokenModal();
      }
    });

    // Token search
    document.getElementById('token-search').addEventListener('input', (e) => {
      this.filterTokens(e.target.value);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideTokenModal();
        this.hideSuccessModal();
      }
    });
  }

  showTokenModal() {
    const modal = document.getElementById('token-modal');
    modal.classList.add('show');
    this.renderTokenList();

    // Focus search input
    setTimeout(() => {
      document.getElementById('token-search').focus();
    }, 100);
  }

  hideTokenModal() {
    const modal = document.getElementById('token-modal');
    modal.classList.remove('show');
    document.getElementById('token-search').value = '';
  }

  renderTokenList(filteredTokens = null) {
    const tokenList = document.getElementById('token-list');
    const tokensToShow = filteredTokens || this.tokens;

    tokenList.innerHTML = tokensToShow
      .map(
        (token) => `
      <div class="token-item" data-currency="${token.currency}">
        <img src="${this.getTokenIcon(token.currency)}" alt="${
          token.currency
        }" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2NjdlZWEiLz4KPHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEwIiBmb250LXdlaWdodD0iYm9sZCI+JHt0b2tlbi5jdXJyZW5jeS5zdWJzdHIoMCwgMil9PC90ZXh0Pgo8L3N2Zz4K'">
        <div class="token-info">
          <div class="token-symbol">${token.currency}</div>
          <div class="token-price">$${this.formatPrice(token.price)}</div>
        </div>
      </div>
    `
      )
      .join('');

    // Add click listeners to token items
    tokenList.querySelectorAll('.token-item').forEach((item) => {
      item.addEventListener('click', () => {
        const currency = item.dataset.currency;
        this.selectToken(currency);
      });
    });
  }

  filterTokens(searchTerm) {
    const filtered = this.tokens.filter((token) =>
      token.currency.toLowerCase().includes(searchTerm.toLowerCase())
    );
    this.renderTokenList(filtered);
  }

  selectToken(currency) {
    const token = this.tokens.find((t) => t.currency === currency);
    if (!token) return;

    if (this.currentSelector === 'from') {
      this.selectedFromToken = token;
      this.updateTokenSelector('from', token);
    } else {
      this.selectedToToken = token;
      this.updateTokenSelector('to', token);
    }

    this.hideTokenModal();
    this.updateUI();
    this.calculateToAmount(document.getElementById('from-amount').value);
  }

  updateTokenSelector(type, token) {
    const icon = document.getElementById(`${type}-token-icon`);
    const symbol = document.getElementById(`${type}-token-symbol`);

    icon.src = this.getTokenIcon(token.currency);
    icon.style.display = 'block';
    symbol.textContent = token.currency;
  }

  initializeTokenSelectors() {
    // Hide icons initially and set default placeholder icons
    const fromIcon = document.getElementById('from-token-icon');
    const toIcon = document.getElementById('to-token-icon');

    fromIcon.style.display = 'none';
    toIcon.style.display = 'none';

    // Set default placeholder icon (using a generic token icon)
    const defaultIcon =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiNlNWU3ZWIiLz4KPHN2ZyB4PSI2IiB5PSI2IiB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMiAxNWwtNS01aDNWOGg0djRoM2wtNSA1eiIgZmlsbD0iIzljYTNhZiIvPgo8L3N2Zz4KPC9zdmc+';

    fromIcon.src = defaultIcon;
    toIcon.src = defaultIcon;
  }

  swapTokens() {
    if (!this.selectedFromToken || !this.selectedToToken) return;

    // Swap the tokens
    const tempToken = this.selectedFromToken;
    this.selectedFromToken = this.selectedToToken;
    this.selectedToToken = tempToken;

    // Update UI
    this.updateTokenSelector('from', this.selectedFromToken);
    this.updateTokenSelector('to', this.selectedToToken);

    // Swap amounts
    const fromAmount = document.getElementById('from-amount').value;
    const toAmount = document.getElementById('to-amount').value;

    document.getElementById('from-amount').value = toAmount;
    document.getElementById('to-amount').value = fromAmount;

    this.calculateToAmount(document.getElementById('from-amount').value);
    this.updateUI();
  }

  calculateToAmount(fromAmount) {
    if (
      !this.selectedFromToken ||
      !this.selectedToToken ||
      !fromAmount ||
      fromAmount <= 0
    ) {
      document.getElementById('to-amount').value = '';
      document.getElementById('from-usd-value').textContent = '$0.00';
      document.getElementById('to-usd-value').textContent = '$0.00';
      document.getElementById('exchange-info').style.display = 'none';
      this.updateUI();
      return;
    }

    const fromValue = parseFloat(fromAmount);
    const fromPrice = this.selectedFromToken.price;
    const toPrice = this.selectedToToken.price;

    // Calculate exchange rate and to amount
    this.exchangeRate = fromPrice / toPrice;
    const toAmount = fromValue * this.exchangeRate;

    // Update UI - use raw number for input field (no commas)
    document.getElementById('to-amount').value = toAmount
      .toFixed(6)
      .replace(/\.?0+$/, '');
    document.getElementById(
      'from-usd-value'
    ).textContent = `$${this.formatPrice(fromValue * fromPrice)}`;
    document.getElementById('to-usd-value').textContent = `$${this.formatPrice(
      toAmount * toPrice
    )}`;

    // Show exchange info
    document.getElementById('exchange-rate').textContent = `1 ${
      this.selectedFromToken.currency
    } = ${this.formatAmount(this.exchangeRate)} ${
      this.selectedToToken.currency
    }`;
    document.getElementById('exchange-info').style.display = 'block';

    // Update button state
    this.updateUI();
  }

  updateUI() {
    const fromAmount = document.getElementById('from-amount').value;
    const confirmButton = document.getElementById('confirm-swap');
    const buttonText = confirmButton.querySelector('.button-text');

    // Update button state
    if (!this.selectedFromToken || !this.selectedToToken) {
      confirmButton.disabled = true;
      buttonText.textContent = 'Select tokens to continue';
    } else if (!fromAmount || fromAmount <= 0) {
      confirmButton.disabled = true;
      buttonText.textContent = 'Enter amount to swap';
    } else {
      confirmButton.disabled = false;
      buttonText.textContent = `Swap ${this.selectedFromToken.currency} for ${this.selectedToToken.currency}`;
    }

    // Clear errors
    this.clearErrors();
  }

  async handleSwap() {
    const fromAmount = document.getElementById('from-amount').value;

    if (!this.validateSwap(fromAmount)) return;

    // Show loading state
    this.setLoadingState(true);

    try {
      // Simulate API call with delay
      await this.simulateSwap();

      // Show success
      this.showSuccessModal(fromAmount);

      // Reset form
      this.resetForm();
    } catch (error) {
      this.showError('Swap failed. Please try again.');
    } finally {
      this.setLoadingState(false);
    }
  }

  validateSwap(fromAmount) {
    this.clearErrors();
    let isValid = true;

    if (!fromAmount || fromAmount <= 0) {
      this.showFieldError('from-error', 'Please enter a valid amount');
      isValid = false;
    }

    if (parseFloat(fromAmount) > 1000000) {
      this.showFieldError('from-error', 'Amount too large');
      isValid = false;
    }

    return isValid;
  }

  async simulateSwap() {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(resolve, 2000 + Math.random() * 1000);
    });
  }

  setLoadingState(loading) {
    const confirmButton = document.getElementById('confirm-swap');
    const buttonText = confirmButton.querySelector('.button-text');
    const spinner = confirmButton.querySelector('.loading-spinner');

    if (loading) {
      confirmButton.disabled = true;
      buttonText.style.opacity = '0';
      spinner.style.display = 'block';
    } else {
      confirmButton.disabled = false;
      buttonText.style.opacity = '1';
      spinner.style.display = 'none';
    }
  }

  showSuccessModal(fromAmount) {
    const modal = document.getElementById('success-modal');
    const message = document.getElementById('success-message');
    const toAmount = document.getElementById('to-amount').value;

    message.textContent = `Successfully swapped ${fromAmount} ${this.selectedFromToken.currency} for ${toAmount} ${this.selectedToToken.currency}`;
    modal.classList.add('show');
  }

  hideSuccessModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.remove('show');
  }

  resetForm() {
    document.getElementById('from-amount').value = '';
    document.getElementById('to-amount').value = '';
    document.getElementById('from-usd-value').textContent = '$0.00';
    document.getElementById('to-usd-value').textContent = '$0.00';
    document.getElementById('exchange-info').style.display = 'none';
    this.updateUI();
  }

  showFieldError(fieldId, message) {
    document.getElementById(fieldId).textContent = message;
  }

  showError(message) {
    // You could implement a toast notification here
    console.error(message);
    alert(message);
  }

  clearErrors() {
    document.getElementById('from-error').textContent = '';
    document.getElementById('to-error').textContent = '';
  }

  getTokenIcon(currency) {
    return `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${currency}.svg`;
  }

  formatPrice(price) {
    if (price >= 1) {
      return price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } else {
      return price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8,
      });
    }
  }

  formatAmount(amount) {
    if (amount >= 1) {
      return amount.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6,
      });
    } else {
      return amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8,
      });
    }
  }
}

// Global functions for modal controls
window.closeSuccessModal = function () {
  document.getElementById('success-modal').classList.remove('show');
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CurrencySwap();
});

// Add some demo balances for better UX
document.addEventListener('DOMContentLoaded', () => {
  // Simulate random balances
  const updateBalances = () => {
    const fromBalance = document.getElementById('from-balance');
    const toBalance = document.getElementById('to-balance');

    fromBalance.textContent = (Math.random() * 1000).toFixed(2);
    toBalance.textContent = (Math.random() * 1000).toFixed(2);
  };

  // Update balances every few seconds to simulate real data
  setInterval(updateBalances, 5000);
  updateBalances();
});
