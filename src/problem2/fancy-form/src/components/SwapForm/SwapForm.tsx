import React, { useState, useCallback, useEffect } from 'react';
import TokenSelector from '../TokenSelector/TokenSelector';
import { useTokenPrices } from '../../hooks/useTokenPrices';
import { useWallet } from '../../hooks/useWallet';
import { formatAmount } from '../../utils/format';
import type { Token, SwapStatus } from '../../types';
import './SwapForm.scss';

const SwapForm: React.FC = () => {
  const { tokens: rawTokens, loading: tokensLoading } = useTokenPrices();
  const { balances, updateBalance } = useWallet();

  // Merge raw token data with current wallet balances
  const tokens = React.useMemo(() => {
    return rawTokens.map(t => ({
      ...t,
      balance: balances[t.symbol] || 0
    }));
  }, [rawTokens, balances]);

  const [fromSymbol, setFromSymbol] = useState('');
  const [toSymbol, setToSymbol] = useState('');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [swapStatus, setSwapStatus] = useState<SwapStatus>('idle');
  const [errors, setErrors] = useState<{ from?: string; token?: string }>({});
  const [isFlipping, setIsFlipping] = useState(false);

  // Derived token objects (reactive to balance changes)
  const fromToken = tokens.find(t => t.symbol === fromSymbol) || null;
  const toToken = tokens.find(t => t.symbol === toSymbol) || null;

  // Set default tokens once loaded
  useEffect(() => {
    if (tokens.length > 0 && !fromSymbol && !toSymbol) {
      const eth = tokens.find((t) => t.symbol === 'ETH');
      const usdc = tokens.find((t) => t.symbol === 'USDC');
      setFromSymbol(eth?.symbol || tokens[0].symbol);
      setToSymbol(usdc?.symbol || tokens[1].symbol);
    }
  }, [tokens, fromSymbol, toSymbol]);

  // Compute toAmount when fromAmount or tokens change
  useEffect(() => {
    const num = parseFloat(fromAmount);
    if (!isNaN(num) && num > 0 && fromToken && toToken) {
      const rate = fromToken.price / toToken.price;
      setToAmount(formatAmount(num * rate));
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromToken, toToken]);

  const exchangeRate = fromToken && toToken
    ? fromToken.price / toToken.price
    : null;

  const validate = useCallback(() => {
    const errs: { from?: string; token?: string } = {};
    const amount = parseFloat(fromAmount);
    if (!fromAmount || amount <= 0) {
      errs.from = 'Enter a valid amount to swap.';
    } else if (fromToken && amount > (fromToken.balance || 0)) {
      errs.from = `Insufficient ${fromToken.symbol} balance.`;
    }
    
    if (!fromToken || !toToken) {
      errs.token = 'Please select both tokens.';
    }
    if (fromToken && toToken && fromToken.symbol === toToken.symbol) {
      errs.token = 'Cannot swap a token with itself.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [fromAmount, fromToken, toToken]);

  const handleSwitch = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
      const prevFrom = fromSymbol;
      const prevTo = toSymbol;
      setFromSymbol(prevTo);
      setToSymbol(prevFrom);
      setFromAmount(toAmount);
      setIsFlipping(false);
    }, 300);
  };

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow only numeric input
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setFromAmount(val);
      setErrors((prev) => ({ ...prev, from: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSwapStatus('loading');
    // Simulate backend call
    await new Promise((res) => setTimeout(res, 2000));
    const success = Math.random() > 0.1; // 90% success rate
    setSwapStatus(success ? 'success' : 'error');
    if (success) {
      // Update the mock wallet balances
      updateBalance(fromToken!.symbol, -parseFloat(fromAmount));
      updateBalance(toToken!.symbol, parseFloat(toAmount));
      
      setTimeout(() => {
        setSwapStatus('idle');
        setFromAmount('');
        setToAmount('');
      }, 3000);
    } else {
      setTimeout(() => setSwapStatus('idle'), 3000);
    }
  };

  const handleSelectFrom = (token: Token) => {
    setFromSymbol(token.symbol);
    if (toSymbol === token.symbol) setToSymbol('');
    setErrors((prev) => ({ ...prev, token: undefined }));
  };

  const handleSelectTo = (token: Token) => {
    setToSymbol(token.symbol);
    if (fromSymbol === token.symbol) setFromSymbol('');
    setErrors((prev) => ({ ...prev, token: undefined }));
  };

  const isLoading = swapStatus === 'loading';
  const isSuccess = swapStatus === 'success';
  const isError = swapStatus === 'error';

  return (
    <div className="swap-card">
      {/* Header */}
      <div className="swap-card__header">
        <div className="swap-card__title-wrap">
          <div className="swap-card__logo">
            <svg viewBox="0 0 24 24" fill="none" className="swap-icon">
              <path d="M7 16V4m0 0L3 8m4-4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 8v12m0 0l4-4m-4 4l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className="swap-card__title">Swap</h1>
            <p className="swap-card__subtitle">Exchange tokens instantly</p>
          </div>
        </div>
        <div className="swap-card__badge">
          <span className="swap-card__badge-dot" />
          Live Rates
        </div>
      </div>

      {tokensLoading ? (
        <div className="swap-loading">
          <div className="swap-spinner" />
          <span>Loading token prices…</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="swap-form" noValidate>
          {/* FROM section */}
          <div className={`swap-field ${errors.from ? 'has-error' : ''}`}>
            <div className="swap-field__inner">
              <div className="swap-field__left">
                <label className="swap-field__label" htmlFor="input-amount">You pay</label>
                <input
                  id="input-amount"
                  className="swap-field__input"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={handleFromAmountChange}
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>
              <TokenSelector
                label="From"
                tokens={tokens}
                selected={fromToken}
                onSelect={handleSelectFrom}
                disabled={isLoading}
              />
            </div>
            
            <div className="swap-field__footer">
              <div className="swap-field__usd">
                {fromToken && fromAmount && (
                  <>≈ ${ (parseFloat(fromAmount) * fromToken.price).toLocaleString('en-US', { maximumFractionDigits: 2 }) }</>
                )}
              </div>
              {fromToken && (
                <div className="swap-field__balance">
                  <span className="swap-field__balance-text">Balance: {fromToken.balance?.toLocaleString('en-US', { maximumFractionDigits: 6 })}</span>
                  <button 
                    type="button" 
                    className="swap-field__max" 
                    onClick={() => fromToken.balance && setFromAmount(fromToken.balance.toString())}
                    disabled={isLoading}
                  >
                    MAX
                  </button>
                </div>
              )}
            </div>
            {errors.from && <p className="swap-field__error">{errors.from}</p>}
          </div>

          {/* Switch button */}
          <div className="swap-switch-wrap">
            <div className="swap-divider" />
            <button
              type="button"
              className={`swap-switch ${isFlipping ? 'flipping' : ''}`}
              onClick={handleSwitch}
              disabled={isLoading}
              aria-label="Switch tokens"
              title="Switch tokens"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
            <div className="swap-divider" />
          </div>

          {/* TO section */}
          <div className={`swap-field ${errors.token ? 'has-error' : ''}`}>
            <div className="swap-field__inner">
              <div className="swap-field__left">
                <label className="swap-field__label" htmlFor="output-amount">You receive</label>
                <input
                  id="output-amount"
                  className="swap-field__input swap-field__input--receive"
                  type="text"
                  placeholder="0.00"
                  value={toAmount}
                  readOnly
                />
              </div>
              <TokenSelector
                label="To"
                tokens={tokens}
                selected={toToken}
                onSelect={handleSelectTo}
                disabled={isLoading}
              />
            </div>

            <div className="swap-field__footer">
              <div className="swap-field__usd">
                {toToken && toAmount && (
                   <>≈ ${ (parseFloat(toAmount) * toToken.price).toLocaleString('en-US', { maximumFractionDigits: 2 }) }</>
                )}
              </div>
              {toToken && (
                <div className="swap-field__balance">
                  <span className="swap-field__balance-text">Balance: {toToken.balance?.toLocaleString('en-US', { maximumFractionDigits: 6 })}</span>
                </div>
              )}
            </div>
            {errors.token && <p className="swap-field__error">{errors.token}</p>}
          </div>

          {/* Exchange rate info */}
          {exchangeRate && fromToken && toToken && (
            <div className="swap-rate">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="swap-rate__icon">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              <span>
                1 {fromToken.symbol} = {formatAmount(exchangeRate)} {toToken.symbol}
              </span>
              <span className="swap-rate__divider">·</span>
              <span className="swap-rate__fee">~0.3% fee</span>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className={`swap-submit ${swapStatus}`}
            disabled={isLoading}
          >
            {isLoading && (
              <svg className="swap-submit__spinner" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4" strokeDashoffset="10" />
              </svg>
            )}
            {isSuccess && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="swap-submit__icon">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {isError && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="swap-submit__icon">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
            <span>
              {isLoading ? 'Swapping…' : isSuccess ? 'Swap Successful!' : isError ? 'Swap Failed — Retry' : 'Confirm Swap'}
            </span>
          </button>
        </form>
      )}
    </div>
  );
};

export default SwapForm;
