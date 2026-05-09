import { useState } from 'react';
import './CurrencySwap.css';

// Currency exchange rates (mock data - base currency USD)
const exchangeRates = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 148.50,
  AUD: 1.52,
  CAD: 1.36,
  CHF: 0.88,
  CNY: 7.24
};

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY'];

const CurrencySwap = () => {
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [inputCurrency, setInputCurrency] = useState('USD');
  const [outputCurrency, setOutputCurrency] = useState('EUR');
  const [inputError, setInputError] = useState('');
  const [outputError, setOutputError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastEdited, setLastEdited] = useState('input');

  const formatCurrency = (amount, currency) => {
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      AUD: 'A$',
      CAD: 'C$',
      CHF: 'Fr',
      CNY: '¥'
    };
    return `${symbols[currency]}${parseFloat(amount).toFixed(2)}`;
  };

  const getExchangeRate = (from, to) => {
    if (from === to) return 1.0;
    return exchangeRates[to] / exchangeRates[from];
  };

  const calculateConversion = (amount, fromCurrency, toCurrency) => {
    const rate = getExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
  };

  const getDisplayRate = () => {
    const rate = getExchangeRate(inputCurrency, outputCurrency);
    return `1 ${inputCurrency} = ${rate.toFixed(4)} ${outputCurrency}`;
  };

  const validateAmount = (value) => {
    if (!value || value.trim() === '') {
      return { valid: false, message: 'Amount is required' };
    }
    
    const num = parseFloat(value);
    
    if (isNaN(num)) {
      return { valid: false, message: 'Please enter a valid number' };
    }
    
    if (num <= 0) {
      return { valid: false, message: 'Amount must be greater than 0' };
    }
    
    if (num > 1000000000) {
      return { valid: false, message: 'Amount is too large' };
    }
    
    return { valid: true, message: '' };
  };

  const handleInputAmountChange = (e) => {
    const value = e.target.value;
    setInputAmount(value);
    setLastEdited('input');
    setInputError('');
    
    if (!value || value.trim() === '') {
      setOutputAmount('');
      return;
    }
    
    const validation = validateAmount(value);
    if (!validation.valid) {
      setInputError(validation.message);
      setOutputAmount('');
      return;
    }
    
    const amount = parseFloat(value);
    const result = calculateConversion(amount, inputCurrency, outputCurrency);
    setOutputAmount(result.toFixed(2));
  };

  const handleOutputAmountChange = (e) => {
    const value = e.target.value;
    setOutputAmount(value);
    setLastEdited('output');
    setOutputError('');
    
    if (!value || value.trim() === '') {
      setInputAmount('');
      return;
    }
    
    const validation = validateAmount(value);
    if (!validation.valid) {
      setOutputError(validation.message);
      setInputAmount('');
      return;
    }
    
    const amount = parseFloat(value);
    const result = calculateConversion(amount, outputCurrency, inputCurrency);
    setInputAmount(result.toFixed(2));
  };

  const handleCurrencyChange = (type, newCurrency) => {
    if (type === 'input') {
      setInputCurrency(newCurrency);
      if (lastEdited === 'input' && inputAmount) {
        const amount = parseFloat(inputAmount);
        if (!isNaN(amount)) {
          const result = calculateConversion(amount, newCurrency, outputCurrency);
          setOutputAmount(result.toFixed(2));
        }
      } else if (lastEdited === 'output' && outputAmount) {
        const amount = parseFloat(outputAmount);
        if (!isNaN(amount)) {
          const result = calculateConversion(amount, outputCurrency, newCurrency);
          setInputAmount(result.toFixed(2));
        }
      }
    } else {
      setOutputCurrency(newCurrency);
      if (lastEdited === 'input' && inputAmount) {
        const amount = parseFloat(inputAmount);
        if (!isNaN(amount)) {
          const result = calculateConversion(amount, inputCurrency, newCurrency);
          setOutputAmount(result.toFixed(2));
        }
      } else if (lastEdited === 'output' && outputAmount) {
        const amount = parseFloat(outputAmount);
        if (!isNaN(amount)) {
          const result = calculateConversion(amount, newCurrency, inputCurrency);
          setInputAmount(result.toFixed(2));
        }
      }
    }
  };

  const handleSwapCurrencies = () => {
    setInputCurrency(outputCurrency);
    setOutputCurrency(inputCurrency);
    setInputAmount(outputAmount);
    setOutputAmount(inputAmount);
    setLastEdited(lastEdited === 'input' ? 'output' : 'input');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setInputError('');
    setOutputError('');
    
    const inputValidation = validateAmount(inputAmount);
    const outputValidation = validateAmount(outputAmount);
    
    let hasError = false;
    
    if (!inputValidation.valid) {
      setInputError(inputValidation.message);
      hasError = true;
    }
    
    if (!outputValidation.valid) {
      setOutputError(outputValidation.message);
      hasError = true;
    }
    
    if (inputCurrency === outputCurrency) {
      setInputError('Please select different currencies');
      hasError = true;
    }
    
    if (hasError) return;
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setShowSuccess(true);
  };

  const handleReset = () => {
    setShowSuccess(false);
    setInputAmount('');
    setOutputAmount('');
    setInputCurrency('USD');
    setOutputCurrency('EUR');
    setInputError('');
    setOutputError('');
    setLastEdited('input');
  };

  return (
    <div className="container">
      <div className="swap-card">
        <h1 className="title">Currency Swap</h1>
        <p className="subtitle">Exchange your assets seamlessly</p>
        
        {!showSuccess ? (
          <form className="swap-form" onSubmit={handleSubmit}>
            {/* Input Currency */}
            <div className="input-group">
              <label htmlFor="input-amount">You send</label>
              <div className="input-wrapper">
                <input 
                  type="text" 
                  id="input-amount" 
                  className={`amount-input ${inputError ? 'error' : ''}`}
                  placeholder="0.00"
                  value={inputAmount}
                  onChange={handleInputAmountChange}
                  autoComplete="off"
                />
                <select 
                  id="input-currency" 
                  className="currency-select"
                  value={inputCurrency}
                  onChange={(e) => handleCurrencyChange('input', e.target.value)}
                >
                  {CURRENCIES.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>
              {inputError && <div className="error-message">{inputError}</div>}
            </div>

            {/* Swap Button */}
            <div className="swap-icon-wrapper">
              <button 
                type="button" 
                className="swap-icon-btn" 
                onClick={handleSwapCurrencies}
                aria-label="Swap currencies"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 16V4M7 4L3 8M7 4L11 8" />
                  <path d="M17 8V20M17 20L21 16M17 20L13 16" />
                </svg>
              </button>
            </div>

            {/* Output Currency */}
            <div className="input-group">
              <label htmlFor="output-amount">You receive</label>
              <div className="input-wrapper">
                <input 
                  type="text" 
                  id="output-amount" 
                  className={`amount-input ${outputError ? 'error' : ''}`}
                  placeholder="0.00"
                  value={outputAmount}
                  onChange={handleOutputAmountChange}
                  autoComplete="off"
                />
                <select 
                  id="output-currency" 
                  className="currency-select"
                  value={outputCurrency}
                  onChange={(e) => handleCurrencyChange('output', e.target.value)}
                >
                  {CURRENCIES.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>
              {outputError && <div className="error-message">{outputError}</div>}
            </div>

            {/* Exchange Rate */}
            <div className="exchange-rate">
              <span className="rate-label">Exchange rate:</span>
              <span className="rate-value">{getDisplayRate()}</span>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className={`submit-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              <span className="btn-text">CONFIRM SWAP</span>
              {isLoading && <span className="btn-loader"></span>}
            </button>
          </form>
        ) : (
          <div className="success-message show">
            <svg className="success-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h3>Swap Successful!</h3>
            <p>
              Successfully swapped {formatCurrency(inputAmount, inputCurrency)} to {formatCurrency(outputAmount, outputCurrency)}
            </p>
            <button className="reset-btn" onClick={handleReset}>
              Make Another Swap
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencySwap;
