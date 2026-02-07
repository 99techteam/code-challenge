const TOKEN_SVG_API = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';
const CURRENCY_API = 'https://interview.switcheo.com/prices.json'

let tokenIconsCache = {};
let currencyData = [];

async function getTokenData(token) {
  try {
    // Check cache first
    if (tokenIconsCache[token]) {
      return tokenIconsCache[token];
    }

    const response = await fetch(`${TOKEN_SVG_API}/${token}.svg`);
    if (response.ok) {
      const svgText = await response.text();
      tokenIconsCache[token] = svgText;
      return svgText;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching icon for ${token}:`, error);
    return null;
  }
}

async function updateCurrencyIcon(currency, iconElementId) {
  const iconElement = document.getElementById(iconElementId);
  if (!currency || !iconElement) {
    if (iconElement) {
      iconElement.innerHTML = '';
    }
    return;
  }

  const iconSvg = await getTokenData(currency);
  if (iconSvg) {
    iconElement.innerHTML = iconSvg;
    // Style the SVG inside
    const svg = iconElement.querySelector('svg');
    if (svg) {
      svg.style.width = '24px';
      svg.style.height = '24px';
    }
  } else {
    // Fallback to currency initials if icon not available
    iconElement.innerHTML = currency.substring(0, 2).toUpperCase();
    iconElement.style.fontSize = '10px';
    iconElement.style.fontWeight = 'bold';
  }
}

async function getCurrencyData() {
  const response = await fetch(CURRENCY_API);
  return response.json();
}

function calculateSwapAmount() {
  const inputCurrency = document.getElementById('input-currency').value;
  const outputCurrency = document.getElementById('output-currency').value;
  const inputAmount = parseFloat(document.getElementById('input-amount').value) || 0;
  const outputAmountField = document.getElementById('output-amount');

  if (!inputCurrency || !outputCurrency) {
    outputAmountField.value = '';
    return;
  }

  // Find currency prices
  const inputCurrencyData = currencyData.find(c => c.currency === inputCurrency);
  const outputCurrencyData = currencyData.find(c => c.currency === outputCurrency);

  if (!inputCurrencyData || !outputCurrencyData) {
    outputAmountField.value = '';
    return;
  }

  if (inputAmount > 0) {
    const inputPrice = parseFloat(inputCurrencyData.price);
    const outputPrice = parseFloat(outputCurrencyData.price);

    // Calculate: (inputAmount * inputPrice) / outputPrice
    const outputAmount = (inputAmount * inputPrice) / outputPrice;
    outputAmountField.value = outputAmount.toFixed(6);
  } else {
    outputAmountField.value = '';
  }
}

function showError(fieldId, errorMessage) {
  const field = document.getElementById(fieldId);
  const errorElement = document.getElementById(`${fieldId}-error`);

  if (field && errorElement) {
    field.classList.add('is-invalid');
    field.classList.remove('is-valid');
    errorElement.textContent = errorMessage;
    errorElement.classList.add('show');
  }
}

function clearError(fieldId) {
  const field = document.getElementById(fieldId);
  const errorElement = document.getElementById(`${fieldId}-error`);

  if (field && errorElement) {
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
    errorElement.textContent = '';
    errorElement.classList.remove('show');
  }
}

function validateInputCurrency() {
  const inputCurrency = document.getElementById('input-currency').value;
  const outputCurrency = document.getElementById('output-currency').value;

  if (!inputCurrency) {
    showError('input-currency', 'Please select a currency to send from.');
    return false;
  }

  if (inputCurrency && outputCurrency && inputCurrency === outputCurrency) {
    showError('input-currency', 'Please select a different currency from the "To" currency.');
    return false;
  }

  clearError('input-currency');
  return true;
}

function validateOutputCurrency() {
  const inputCurrency = document.getElementById('input-currency').value;
  const outputCurrency = document.getElementById('output-currency').value;

  if (!outputCurrency) {
    showError('output-currency', 'Please select a currency to receive.');
    return false;
  }

  if (inputCurrency && outputCurrency && inputCurrency === outputCurrency) {
    showError('output-currency', 'Please select a different currency from the "From" currency.');
    return false;
  }

  clearError('output-currency');
  return true;
}

function validateInputAmount() {
  const inputAmount = parseFloat(document.getElementById('input-amount').value) || 0;

  if (inputAmount <= 0) {
    showError('input-amount', 'Please enter a valid amount greater than 0.');
    return false;
  }

  clearError('input-amount');
  return true;
}

function validateForm() {
  const inputCurrencyValid = validateInputCurrency();
  const outputCurrencyValid = validateOutputCurrency();
  const inputAmountValid = validateInputAmount();

  return inputCurrencyValid && outputCurrencyValid && inputAmountValid;
}

function handleFormSubmit(event) {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  const inputCurrency = document.getElementById('input-currency').value;
  const outputCurrency = document.getElementById('output-currency').value;
  const inputAmount = parseFloat(document.getElementById('input-amount').value);
  const outputAmount = parseFloat(document.getElementById('output-amount').value);

  // Find currency data for display
  const inputCurrencyData = currencyData.find(c => c.currency === inputCurrency);
  const outputCurrencyData = currencyData.find(c => c.currency === outputCurrency);

  const swapDetails = {
    from: {
      currency: inputCurrency.toUpperCase(),
      amount: inputAmount,
      price: parseFloat(inputCurrencyData.price)
    },
    to: {
      currency: outputCurrency.toUpperCase(),
      amount: outputAmount,
      price: parseFloat(outputCurrencyData.price)
    }
  };

  // Log swap details (in a real app, this would be sent to a server)
  console.log('Swap confirmed:', swapDetails);

  // Populate modal with swap details
  document.getElementById('modal-sending-details').textContent =
    `${swapDetails.from.amount} ${swapDetails.from.currency} ($${swapDetails.from.price})`;

  document.getElementById('modal-receiving-details').textContent =
    `${swapDetails.to.amount.toFixed(6)} ${swapDetails.to.currency} ($${swapDetails.to.price})`;

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('swapConfirmationModal'));
  modal.show();

  // Optionally reset form or keep values
  // document.getElementById('swap-form').reset();
}

async function populateCurrencySelects() {
  currencyData = await getCurrencyData();
  const inputSelect = document.getElementById('input-currency');
  const outputSelect = document.getElementById('output-currency');

  // Clear loading messages
  inputSelect.innerHTML = '';
  outputSelect.innerHTML = '';

  // Populate both selects with currencies
  // const currencies = Object.keys(currencyData).sort();

  console.log(currencyData);

  currencyData.forEach(option => {
    const { currency, price } = option;

    // Create option for input select
    const inputOption = document.createElement('option');
    inputOption.value = currency;
    inputOption.textContent = `${currency.toUpperCase()} ($${parseFloat(price).toFixed(2)})`;
    inputSelect.appendChild(inputOption);

    // Create option for output select
    const outputOption = document.createElement('option');
    outputOption.value = currency;
    outputOption.textContent = `${currency.toUpperCase()} ($${parseFloat(price).toFixed(2)})`;
    outputSelect.appendChild(outputOption);
  });

  // Set default selections if available
  if (currencyData.length > 0) {
    inputSelect.value = currencyData[0].currency;
    await updateCurrencyIcon(currencyData[0].currency, 'input-currency-icon');

    if (currencyData.length > 1) {
      outputSelect.value = currencyData[1].currency;
      await updateCurrencyIcon(currencyData[1].currency, 'output-currency-icon');
    } else {
      outputSelect.value = currencyData[0].currency;
      await updateCurrencyIcon(currencyData[0].currency, 'output-currency-icon');
    }
  }
}

async function main() {
  await populateCurrencySelects();

  // Add event listeners to update icons when selection changes
  const inputSelect = document.getElementById('input-currency');
  const outputSelect = document.getElementById('output-currency');
  const inputAmount = document.getElementById('input-amount');
  const form = document.getElementById('swap-form');

  inputSelect.addEventListener('change', async (e) => {
    await updateCurrencyIcon(e.target.value, 'input-currency-icon');
    calculateSwapAmount();
    // Validate on change
    validateInputCurrency();
    // Also re-validate output currency in case they're now the same
    validateOutputCurrency();
  });

  outputSelect.addEventListener('change', async (e) => {
    await updateCurrencyIcon(e.target.value, 'output-currency-icon');
    calculateSwapAmount();
    // Validate on change
    validateOutputCurrency();
    // Also re-validate input currency in case they're now the same
    validateInputCurrency();
  });

  // Calculate swap amount when input amount changes
  inputAmount.addEventListener('input', calculateSwapAmount);

  // Inline validation on blur
  inputSelect.addEventListener('blur', validateInputCurrency);
  outputSelect.addEventListener('blur', validateOutputCurrency);
  inputAmount.addEventListener('blur', validateInputAmount);

  // Handle form submission
  form.addEventListener('submit', handleFormSubmit);
}

await main();