const PRICES_API = 'https://interview.switcheo.com/prices.json';
const TOKEN_ICONS_BASE = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

const state = {
  tokens: [],
  prices: {},
  fromToken: null,
  toToken: null,
  fromAmount: '',
  currentModalTarget: null
};

const elements = {
  form: document.getElementById('swap-form'),
  fromAmount: document.getElementById('from-amount'),
  toAmount: document.getElementById('to-amount'),
  fromTokenBtn: document.getElementById('from-token-btn'),
  toTokenBtn: document.getElementById('to-token-btn'),
  fromTokenIcon: document.getElementById('from-token-icon'),
  toTokenIcon: document.getElementById('to-token-icon'),
  fromTokenSymbol: document.getElementById('from-token-symbol'),
  toTokenSymbol: document.getElementById('to-token-symbol'),
  fromUsd: document.getElementById('from-usd'),
  toUsd: document.getElementById('to-usd'),
  fromError: document.getElementById('from-error'),
  exchangeInfo: document.getElementById('exchange-info'),
  exchangeRate: document.getElementById('exchange-rate'),
  submitBtn: document.getElementById('submit-btn'),
  successMessage: document.getElementById('success-message'),
  swapDirectionBtn: document.getElementById('swap-direction'),
  modal: document.getElementById('token-modal'),
  modalBackdrop: document.getElementById('modal-backdrop'),
  closeModal: document.getElementById('close-modal'),
  tokenList: document.getElementById('token-list'),
  tokenSearch: document.getElementById('token-search')
};

const formatNumber = (num, decimals = 2) => {
  if (!num || isNaN(num)) return '0.00';
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

const formatCurrency = (num) => {
  if (!num || isNaN(num)) return '$0.00';
  return `$${formatNumber(num, 2)}`;
};

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const fetchPrices = async () => {
  try {
    const response = await fetch(PRICES_API);
    if (!response.ok) throw new Error('Failed to fetch prices');
    const data = await response.json();
    
    const priceMap = new Map();
    
    data.forEach(item => {
      const key = item.currency;
      if (!priceMap.has(key) || new Date(item.date) > new Date(priceMap.get(key).date)) {
        priceMap.set(key, item);
      }
    });
    
    const tokens = Array.from(priceMap.values())
      .filter(item => item.price > 0) // Only include tokens with valid prices
      .sort((a, b) => a.currency.localeCompare(b.currency));
    
    state.tokens = tokens;
    state.prices = Object.fromEntries(
      tokens.map(token => [token.currency, token.price])
    );
    
    return tokens;
  } catch (error) {
    console.error('Error fetching prices:', error);
    return [];
  }
};

const getTokenIconUrl = (currency) => {
  return `${TOKEN_ICONS_BASE}/${currency}.svg`;
};

const openModal = (target) => {
  state.currentModalTarget = target;
  elements.modal.style.display = 'flex';
  elements.tokenSearch.value = '';
  renderTokenList(state.tokens);
  elements.tokenSearch.focus();
};

const closeModalFn = () => {
  elements.modal.style.display = 'none';
  state.currentModalTarget = null;
  elements.tokenSearch.value = '';
};

const selectToken = (token) => {
  if (state.currentModalTarget === 'from') {
    state.fromToken = token;
    elements.fromTokenSymbol.textContent = token.currency;
    elements.fromTokenIcon.src = getTokenIconUrl(token.currency);
    elements.fromTokenIcon.alt = token.currency;
    
    if (state.toToken && state.toToken.currency === token.currency) {
      const temp = state.fromToken;
      state.fromToken = state.toToken;
      state.toToken = temp;
      updateTokenDisplay();
    }
  } else if (state.currentModalTarget === 'to') {
    state.toToken = token;
    elements.toTokenSymbol.textContent = token.currency;
    elements.toTokenIcon.src = getTokenIconUrl(token.currency);
    elements.toTokenIcon.alt = token.currency;
    
    if (state.fromToken && state.fromToken.currency === token.currency) {
      const temp = state.toToken;
      state.toToken = state.fromToken;
      state.fromToken = temp;
      updateTokenDisplay();
    }
  }
  
  closeModalFn();
  calculateExchange();
  updateSubmitButton();
};

const updateTokenDisplay = () => {
  if (state.fromToken) {
    elements.fromTokenSymbol.textContent = state.fromToken.currency;
    elements.fromTokenIcon.src = getTokenIconUrl(state.fromToken.currency);
    elements.fromTokenIcon.alt = state.fromToken.currency;
  }
  if (state.toToken) {
    elements.toTokenSymbol.textContent = state.toToken.currency;
    elements.toTokenIcon.src = getTokenIconUrl(state.toToken.currency);
    elements.toTokenIcon.alt = state.toToken.currency;
  }
};

const renderTokenList = (tokens) => {
  if (tokens.length === 0) {
    elements.tokenList.innerHTML = '<div class="no-results">No tokens found</div>';
    return;
  }
  
  elements.tokenList.innerHTML = tokens.map(token => `
    <div class="token-item" data-currency="${token.currency}">
      <img 
        src="${getTokenIconUrl(token.currency)}" 
        alt="${token.currency}" 
        class="token-item-icon"
        onerror="this.style.display='none'"
      />
      <div class="token-item-info">
        <div class="token-item-symbol">${token.currency}</div>
        <div class="token-item-name">${token.currency}</div>
      </div>
      <div class="token-item-price">
        <div class="token-item-price-value">${formatCurrency(token.price)}</div>
      </div>
    </div>
  `).join('');
  
  // Add click handlers
  document.querySelectorAll('.token-item').forEach(item => {
    item.addEventListener('click', () => {
      const currency = item.dataset.currency;
      const token = tokens.find(t => t.currency === currency);
      if (token) selectToken(token);
    });
  });
};

const filterTokens = debounce((searchTerm) => {
  const filtered = state.tokens.filter(token => 
    token.currency.toLowerCase().includes(searchTerm.toLowerCase())
  );
  renderTokenList(filtered);
}, 200);

const calculateExchange = () => {
  const amount = parseFloat(elements.fromAmount.value);
  
  elements.fromError.textContent = '';
  
  if (!amount || amount <= 0 || isNaN(amount)) {
    elements.toAmount.value = '';
    elements.fromUsd.textContent = '$0.00';
    elements.toUsd.textContent = '$0.00';
    elements.exchangeInfo.style.display = 'none';
    return;
  }
  
  if (!state.fromToken || !state.toToken) {
    elements.toAmount.value = '';
    return;
  }
  
  const fromPrice = state.prices[state.fromToken.currency];
  const toPrice = state.prices[state.toToken.currency];
  
  if (!fromPrice || !toPrice) {
    elements.fromError.textContent = 'Price data unavailable';
    return;
  }
  
  const fromUsdValue = amount * fromPrice;
  const toAmount = fromUsdValue / toPrice;
  const exchangeRate = fromPrice / toPrice;
  
  elements.toAmount.value = formatNumber(toAmount, 6);
  elements.fromUsd.textContent = formatCurrency(fromUsdValue);
  elements.toUsd.textContent = formatCurrency(fromUsdValue);
  
  elements.exchangeInfo.style.display = 'block';
  elements.exchangeRate.textContent = `1 ${state.fromToken.currency} = ${formatNumber(exchangeRate, 6)} ${state.toToken.currency}`;
  
  updateSubmitButton();
};

const validateInput = (value) => {
  if (value === '') return true;
  
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  
  if (num <= 0) return false;
  
  const parts = value.split('.');
  if (parts.length > 1 && parts[1].length > 18) return false;
  
  return true;
};

const updateSubmitButton = () => {
  const amount = parseFloat(elements.fromAmount.value);
  const hasValidAmount = amount > 0 && !isNaN(amount);
  const hasTokens = state.fromToken && state.toToken;
  
  if (hasValidAmount && hasTokens) {
    elements.submitBtn.disabled = false;
    elements.submitBtn.querySelector('.btn-text').textContent = 'Confirm Swap';
  } else if (!hasTokens) {
    elements.submitBtn.disabled = true;
    elements.submitBtn.querySelector('.btn-text').textContent = 'Select tokens to swap';
  } else if (!hasValidAmount) {
    elements.submitBtn.disabled = true;
    elements.submitBtn.querySelector('.btn-text').textContent = 'Enter an amount';
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  
  const amount = parseFloat(elements.fromAmount.value);
  if (!amount || amount <= 0 || !state.fromToken || !state.toToken) {
    elements.fromError.textContent = 'Please enter a valid amount and select tokens';
    return;
  }
  
  elements.submitBtn.classList.add('loading');
  elements.submitBtn.disabled = true;
  elements.successMessage.style.display = 'none';
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  elements.submitBtn.classList.remove('loading');
  elements.submitBtn.disabled = false;
  
  elements.successMessage.style.display = 'flex';
  
  setTimeout(() => {
    elements.successMessage.style.display = 'none';
  }, 5000);
};

const swapTokens = () => {
  if (!state.fromToken || !state.toToken) return;
  
  const temp = state.fromToken;
  state.fromToken = state.toToken;
  state.toToken = temp;
  
  updateTokenDisplay();
  
  if (elements.fromAmount.value) {
    calculateExchange();
  }
};

const initEventListeners = () => {
  elements.fromTokenBtn.addEventListener('click', () => openModal('from'));
  elements.toTokenBtn.addEventListener('click', () => openModal('to'));
  
  elements.closeModal.addEventListener('click', closeModalFn);
  elements.modalBackdrop.addEventListener('click', closeModalFn);
  
  elements.tokenSearch.addEventListener('input', (e) => {
    filterTokens(e.target.value);
  });
  
  elements.fromAmount.addEventListener('input', (e) => {
    const value = e.target.value;
    
    if (!validateInput(value)) {
      elements.fromError.textContent = 'Please enter a valid number';
      return;
    }
    
    elements.fromError.textContent = '';
    state.fromAmount = value;
    calculateExchange();
  });
  
  elements.swapDirectionBtn.addEventListener('click', swapTokens);  
  elements.form.addEventListener('submit', handleSubmit);
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.modal.style.display === 'flex') {
      closeModalFn();
    }
  });
};

const init = async () => {
  await fetchPrices();
  initEventListeners();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
