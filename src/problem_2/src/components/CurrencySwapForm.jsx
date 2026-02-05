import { useState, useEffect, useRef } from 'react';
import { fetchTokenPrices, getTokenIconUrl, calculateExchangeRate, calculateOutputAmount } from '../lib/api';
import { isValidPositiveNumber, formatNumber } from '../lib/validation';
import './CurrencySwapForm.css';

// Animated number component with smooth, elegant animation
function AnimatedNumber({ value, className = '' }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current !== value && value && value !== '') {
      setIsAnimating(true);
      setAnimationKey(prev => prev + 1);
      
      const startValue = parseFloat(prevValueRef.current) || 0;
      const endValue = parseFloat(value) || 0;
      const duration = 300; // 300ms fast animation
      const startTime = Date.now();

      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth ease-out-quart for elegant feel
        const easeOut = 1 - Math.pow(1 - progress, 4);
        const currentValue = startValue + (endValue - startValue) * easeOut;
        
        setDisplayValue(formatNumber(currentValue));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(value);
          setIsAnimating(false);
        }
      };
      
      requestAnimationFrame(animate);
      prevValueRef.current = value;
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  return (
    <span 
      key={animationKey}
      className={`animated-number ${isAnimating ? 'animating' : ''} ${className}`}
    >
      {displayValue}
    </span>
  );
}

export default function CurrencySwapForm() {
  const [tokenPrices, setTokenPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [fromToken, setFromToken] = useState('');
  const [toToken, setToToken] = useState('');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  
  const [fromAmountError, setFromAmountError] = useState('');
  const [exchangeRate, setExchangeRate] = useState(0);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  
  const fromDropdownRef = useRef(null);
  const toDropdownRef = useRef(null);

  // Fetch token prices on component mount
  useEffect(() => {
    async function loadPrices() {
      try {
        setLoading(true);
        setError(null);
        const prices = await fetchTokenPrices();
        setTokenPrices(prices);
        
        // Set default tokens if available
        const tokens = Object.keys(prices);
        if (tokens.length > 0) {
          setFromToken(tokens[0]);
          if (tokens.length > 1) {
            setToToken(tokens[1]);
          }
        }
      } catch (err) {
        setError('Failed to load token prices. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPrices();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (fromDropdownRef.current && !fromDropdownRef.current.contains(event.target)) {
        setShowFromDropdown(false);
      }
      if (toDropdownRef.current && !toDropdownRef.current.contains(event.target)) {
        setShowToDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate exchange rate and output amount when inputs change
  useEffect(() => {
    if (fromToken && toToken && tokenPrices[fromToken] && tokenPrices[toToken]) {
      const rate = calculateExchangeRate(tokenPrices[fromToken], tokenPrices[toToken]);
      setExchangeRate(rate);
      
      if (fromAmount && isValidPositiveNumber(fromAmount)) {
        const output = calculateOutputAmount(parseFloat(fromAmount), rate);
        setToAmount(formatNumber(output));
      } else {
        setToAmount('');
      }
    } else {
      setExchangeRate(0);
      setToAmount('');
    }
  }, [fromToken, toToken, fromAmount, tokenPrices]);

  // Handle from amount input change
  const handleFromAmountChange = (e) => {
    const value = e.target.value;
    setFromAmount(value);
    
    if (value === '') {
      setFromAmountError('');
      setToAmount('');
      return;
    }
    
    if (!isValidPositiveNumber(value)) {
      setFromAmountError('Please enter a valid positive number');
      setToAmount('');
    } else {
      setFromAmountError('');
    }
  };

  // Handle max button click
  const handleMaxClick = () => {
    // In a real app, this would use actual balance
    // For now, we'll use a placeholder
    const mockBalance = '1000';
    setFromAmount(mockBalance);
    setFromAmountError('');
  };

  // Handle swap tokens
  const handleSwapTokens = () => {
    if (!fromToken || !toToken) return;
    
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    
    // Swap amounts
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  // Handle swap button click with animation
  const handleSwapClick = () => {
    if (!fromToken || !toToken || !fromAmount || fromAmountError || !isValidPositiveNumber(fromAmount)) {
      return;
    }
    
    setIsSwapping(true);
    
    // Trigger animation effect
    setTimeout(() => {
      setIsSwapping(false);
    }, 1000);
  };

  // Get available tokens (only those with prices)
  const availableTokens = Object.keys(tokenPrices).sort();
  
  // Filter tokens based on search
  const filteredFromTokens = availableTokens.filter(token => 
    token.toLowerCase().includes(searchFrom.toLowerCase())
  );
  const filteredToTokens = availableTokens.filter(token => 
    token.toLowerCase().includes(searchTo.toLowerCase()) && token !== fromToken
  );

  // Handle token selection
  const handleSelectFromToken = (token) => {
    setFromToken(token);
    setShowFromDropdown(false);
    setSearchFrom('');
    if (token === toToken) {
      setToToken('');
    }
  };

  const handleSelectToToken = (token) => {
    setToToken(token);
    setShowToDropdown(false);
    setSearchTo('');
  };

  if (loading) {
    return (
      <div className="currency-swap-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading token prices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="currency-swap-container">
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="currency-swap-container">
      <div className="currency-swap-card">
        <div className="card-header">
          <h1 className="title">Swap</h1>
        </div>
        
        <div className="swap-form">
          {/* From Token Section */}
          <div className="token-section">
            <div className="section-header">
              <span className="section-label">From</span>
              {fromToken && (
                <span className="balance">Balance: {formatNumber(1000, 2)}</span>
              )}
            </div>
            <div className="token-input-container">
              <div className="token-select-container" ref={fromDropdownRef}>
                <button 
                  className="token-select-button"
                  onClick={() => {
                    setShowFromDropdown(!showFromDropdown);
                    setShowToDropdown(false);
                  }}
                >
                  {fromToken ? (
                    <>
                      <img 
                        src={getTokenIconUrl(fromToken)} 
                        alt={fromToken}
                        className="token-icon"
                        onError={(e) => {
                          e.target.src = '/vite.svg';
                        }}
                      />
                      <span className="token-symbol">{fromToken}</span>
                    </>
                  ) : (
                    <span className="select-token-text">Select token</span>
                  )}
                  <svg className="dropdown-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                {showFromDropdown && (
                  <div className="token-dropdown">
                    <div className="dropdown-search">
                      <input
                        type="text"
                        placeholder="Search tokens..."
                        value={searchFrom}
                        onChange={(e) => setSearchFrom(e.target.value)}
                        className="search-input"
                        autoFocus
                      />
                    </div>
                    <div className="token-list">
                      {filteredFromTokens.length > 0 ? (
                        filteredFromTokens.map(token => (
                          <button
                            key={token}
                            className={`token-option ${fromToken === token ? 'selected' : ''}`}
                            onClick={() => handleSelectFromToken(token)}
                          >
                            <img 
                              src={getTokenIconUrl(token)} 
                              alt={token}
                              className="token-option-icon"
                              onError={(e) => {
                                e.target.src = '/vite.svg';
                              }}
                            />
                            <span className="token-option-symbol">{token}</span>
                            {tokenPrices[token] && (
                              <span className="token-option-price">
                                ${formatNumber(tokenPrices[token], 2)}
                              </span>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="no-tokens">No tokens found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="amount-container">
                <input
                  type="text"
                  className={`amount-input ${fromAmountError ? 'error' : ''}`}
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={handleFromAmountChange}
                />
                <button 
                  className="max-button"
                  onClick={handleMaxClick}
                  disabled={!fromToken}
                >
                  MAX
                </button>
              </div>
              {fromAmountError && (
                <span className="error-message">{fromAmountError}</span>
              )}
              {fromToken && tokenPrices[fromToken] && fromAmount && isValidPositiveNumber(fromAmount) && (
                <div className="amount-usd">
                  ≈ $<AnimatedNumber value={formatNumber(parseFloat(fromAmount) * tokenPrices[fromToken], 2)} /> USD
                </div>
              )}
            </div>
          </div>

          {/* Swap Button */}
          <div className="swap-button-container">
            <button 
              className="swap-button"
              onClick={handleSwapTokens}
              disabled={!fromToken || !toToken}
              aria-label="Swap tokens"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M7 4L3 8L7 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 20L21 16L17 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 8H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 16H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* To Token Section */}
          <div className="token-section">
            <div className="section-header">
              <span className="section-label">To</span>
              {toToken && (
                <span className="balance">Balance: {formatNumber(500, 2)}</span>
              )}
            </div>
            <div className="token-input-container">
              <div className="token-select-container" ref={toDropdownRef}>
                <button 
                  className="token-select-button"
                  onClick={() => {
                    setShowToDropdown(!showToDropdown);
                    setShowFromDropdown(false);
                  }}
                >
                  {toToken ? (
                    <>
                      <img 
                        src={getTokenIconUrl(toToken)} 
                        alt={toToken}
                        className="token-icon"
                        onError={(e) => {
                          e.target.src = '/vite.svg';
                        }}
                      />
                      <span className="token-symbol">{toToken}</span>
                    </>
                  ) : (
                    <span className="select-token-text">Select token</span>
                  )}
                  <svg className="dropdown-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                {showToDropdown && (
                  <div className="token-dropdown">
                    <div className="dropdown-search">
                      <input
                        type="text"
                        placeholder="Search tokens..."
                        value={searchTo}
                        onChange={(e) => setSearchTo(e.target.value)}
                        className="search-input"
                        autoFocus
                      />
                    </div>
                    <div className="token-list">
                      {filteredToTokens.length > 0 ? (
                        filteredToTokens.map(token => (
                          <button
                            key={token}
                            className={`token-option ${toToken === token ? 'selected' : ''}`}
                            onClick={() => handleSelectToToken(token)}
                          >
                            <img 
                              src={getTokenIconUrl(token)} 
                              alt={token}
                              className="token-option-icon"
                              onError={(e) => {
                                e.target.src = '/vite.svg';
                              }}
                            />
                            <span className="token-option-symbol">{token}</span>
                            {tokenPrices[token] && (
                              <span className="token-option-price">
                                ${formatNumber(tokenPrices[token], 2)}
                              </span>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="no-tokens">No tokens found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="amount-container">
                <div className="amount-input amount-display">
                  {toAmount ? (
                    <AnimatedNumber value={toAmount} />
                  ) : (
                    <span className="placeholder-text">0.00</span>
                  )}
                </div>
              </div>
              {toToken && tokenPrices[toToken] && toAmount && (
                <div className="amount-usd">
                  ≈ <AnimatedNumber value={formatNumber(parseFloat(toAmount) * tokenPrices[toToken], 2)} /> USD
                </div>
              )}
            </div>
          </div>

          {/* Exchange Rate Display */}
          {fromToken && toToken && exchangeRate > 0 && (
            <div className="exchange-rate-info">
              <div className="rate-row">
                <span>Rate</span>
                <span className="rate-value">
                  1 {fromToken} = <AnimatedNumber value={formatNumber(exchangeRate, 6)} /> {toToken}
                </span>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <button 
            className={`submit-button ${isSwapping ? 'swapping' : ''}`}
            onClick={handleSwapClick}
            disabled={!fromToken || !toToken || !fromAmount || fromAmountError || !isValidPositiveNumber(fromAmount)}
          >
            {isSwapping ? (
              <>
                <span className="swap-spinner"></span>
                <span>Swapping...</span>
              </>
            ) : (
              'Swap'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
