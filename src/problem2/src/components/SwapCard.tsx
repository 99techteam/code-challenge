import { useState, useEffect, useCallback } from 'react';
import type { Token, SwapFormErrors } from '../types';
import { TokenSelector } from './TokenSelector';
import { AmountInput } from './AmountInput';

interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface SwapCardProps {
  tokens: Token[];
  balances: Record<string, number>;
}

let toastId = 0;

export const SwapCard: React.FC<SwapCardProps> = ({ tokens, balances }) => {
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [errors, setErrors] = useState<SwapFormErrors>({});
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapSuccess, setSwapSuccess] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const calculateToAmount = useCallback(
    (from: Token | null, to: Token | null, amount: string) => {
      if (!from || !to || !amount || !from.price || !to.price) return '';
      const amountNum = Number(amount);
      if (!Number.isFinite(amountNum) || amountNum <= 0) return '';
      const result = (amountNum * from.price) / to.price;
      return result.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      });
    },
    []
  );

  useEffect(() => {
    setToAmount(fromAmount ? calculateToAmount(fromToken, toToken, fromAmount) : '');
  }, [fromAmount, fromToken, toToken, calculateToAmount]);

  const addToast = useCallback((type: Toast['type'], title: string, message: string) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const simulateSwap = useCallback(async () => {
    setIsSwapping(true);
    setSwapSuccess(false);

    const shouldFail = Math.random() < 0.15;

    await new Promise((resolve) => setTimeout(resolve, 1800));

    setIsSwapping(false);

    if (shouldFail) {
      const reasons = [
        'Liquidity pool depleted. Try a smaller amount.',
        'Slippage exceeded 0.5%. Adjust and retry.',
        'Network congestion. Transaction timed out.',
        'Insufficient gas. Please fund your wallet.',
      ];
      const msg = reasons[Math.floor(Math.random() * reasons.length)];
      addToast('error', 'Swap failed', msg);
    } else {
      setSwapSuccess(true);
      addToast(
        'success',
        'Swap successful',
        `You received ${toAmount} ${toToken?.symbol} — transaction confirmed on-chain.`
      );
      window.setTimeout(() => {
        setSwapSuccess(false);
        setFromAmount('');
        setToAmount('');
      }, 2200);
    }
  }, [toAmount, toToken, addToast]);

  const handleSwap = async () => {
    if (!validateForm()) return;
    await simulateSwap();
  };

  const validateForm = (): boolean => {
    const nextErrors: SwapFormErrors = {};

    if (!fromToken) nextErrors.fromToken = 'Select a token';
    if (!toToken) nextErrors.toToken = 'Select a token';

    const amountNum = Number(fromAmount);
    if (!fromAmount.trim()) {
      nextErrors.fromAmount = 'Enter an amount';
    } else if (!Number.isFinite(amountNum) || amountNum <= 0) {
      nextErrors.fromAmount = 'Invalid amount';
    } else if (fromToken && balances[fromToken.symbol] < amountNum) {
      nextErrors.fromBalance = `Insufficient ${fromToken.symbol} balance`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSwapTokens = () => {
    setIsSwitching(true);
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
    setErrors({});
    setTimeout(() => setIsSwitching(false), 500);
  };

  const fromPrice = fromToken?.price ?? 0;
  const toPrice = toToken?.price ?? 0;

  const exchangeRate = fromPrice && toPrice
    ? `1 ${fromToken?.symbol} = ${(fromPrice / toPrice).toLocaleString(undefined, { maximumFractionDigits: 6 })} ${toToken?.symbol}`
    : '';

  const priceImpact = fromPrice && toPrice && fromAmount
    ? Math.min(0.98, Math.abs((Number(fromAmount) * fromPrice) / (toPrice * 1000)))
    : 0;

  const fromValueUSD = fromToken && fromAmount ? Number(fromAmount) * fromPrice : 0;
  const minReceived = toAmount ? (Number(toAmount.replace(/,/g, '')) * 0.995).toFixed(4) : '0.00';

  const getButtonLabel = () => {
    if (swapSuccess) return 'Swap complete';
    if (isSwapping) return 'Swapping...';
    if (!fromToken) return 'Select a token';
    if (!toToken) return 'Select a token';
    if (!fromAmount || Number(fromAmount) <= 0) return 'Enter an amount';
    if (errors.fromBalance) return 'Insufficient balance';
    return 'Swap';
  };

  return (
    <section className="swap-card">
      <div className="swap-card__header">
        <div>
          <span className="swap-card__eyebrow">Instant exchange</span>
          <h2>Swap tokens</h2>
        </div>
      </div>

      <div className="swap-card__panel">
        <div className="swap-field">
          <div className="swap-field__meta">
            <span>You pay</span>
            {fromToken ? (
              <span>Balance {balances[fromToken.symbol]?.toLocaleString(undefined, { maximumFractionDigits: 4 })} {fromToken.symbol}</span>
            ) : (
              <span>Select token</span>
            )}
          </div>
          <div className="swap-field__row">
            <div className="swap-field__amount">
              <AmountInput
                value={fromAmount}
                onChange={setFromAmount}
                placeholder="0.0"
                error={errors.fromAmount || errors.fromBalance}
              />
            </div>
            <div className="swap-field__selector">
              <TokenSelector tokens={tokens} selectedToken={fromToken} onSelect={setFromToken} />
            </div>
          </div>
          {fromAmount && fromValueUSD > 0 && (
            <div className="swap-field__usd">~${fromValueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          )}
        </div>

        <button className={`swap-switch${isSwitching ? ' switching' : ''}`} type="button" onClick={handleSwapTokens} aria-label="Switch tokens">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 7h11m0 0-3-3m3 3-3 3M17 17H6m0 0 3 3m-3-3 3-3" />
          </svg>
        </button>

        <div className="swap-field swap-field--receive">
          <div className="swap-field__meta">
            <span>You receive</span>
            {toToken ? (
              <span>Balance {balances[toToken.symbol]?.toLocaleString(undefined, { maximumFractionDigits: 4 })} {toToken.symbol}</span>
            ) : (
              <span>Select token</span>
            )}
          </div>
          <div className="swap-field__row">
            <div className="swap-field__amount">
              <AmountInput
                value={toAmount}
                onChange={() => undefined}
                placeholder="0.0"
                readOnly
                error={errors.toToken}
              />
            </div>
            <div className="swap-field__selector">
              <TokenSelector tokens={tokens} selectedToken={toToken} onSelect={setToToken} />
            </div>
          </div>
        </div>

        {isSwapping && (
          <div className="swap-progress">
            <div className="swap-progress__bar">
              <div className="swap-progress__fill" />
            </div>
            <span className="swap-progress__label">Processing transaction…</span>
          </div>
        )}
      </div>

      <div className="swap-card__summary">
        {exchangeRate ? (
          <>
            <div><span>Rate</span><strong>{exchangeRate}</strong></div>
            <div><span>Price impact</span><strong className={priceImpact > 0.5 ? 'is-warn' : ''}>{priceImpact < 0.01 ? '<0.01' : priceImpact.toFixed(2)}%</strong></div>
            <div><span>Network fee</span><strong>~$0.50</strong></div>
            <div><span>Min received</span><strong>{minReceived} {toToken?.symbol ?? ''}</strong></div>
          </>
        ) : (
          <div className="swap-card__summary-placeholder">Choose tokens to preview rate and slippage</div>
        )}
      </div>

      <button
        className={`swap-card__submit${swapSuccess ? ' is-success' : ''}${isSwapping ? ' is-loading' : ''}`}
        type="button"
        onClick={handleSwap}
        disabled={isSwapping || swapSuccess}
      >
        {isSwapping ? (
          <span className="swap-card__submit-state">
            <span className="swap-card__spinner" />
            Swapping...
          </span>
        ) : swapSuccess ? (
          <span className="swap-card__submit-state">
            <svg viewBox="0 0 20 20" fill="currentColor" className="swap-card__check">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Swap complete
          </span>
        ) : (
          getButtonLabel()
        )}
      </button>

      <div className="toast-stack" aria-live="polite">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast--${toast.type}`} role="alert">
            <div className="toast__icon">
              {toast.type === 'success' && (
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {toast.type === 'error' && (
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              {toast.type === 'info' && (
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="toast__body">
              <p className="toast__title">{toast.title}</p>
              <p className="toast__message">{toast.message}</p>
            </div>
            <button className="toast__close" onClick={() => removeToast(toast.id)} aria-label="Dismiss">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
