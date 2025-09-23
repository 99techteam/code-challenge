import React, { useState, useCallback } from 'react';
import { ArrowDown } from 'lucide-react';
import { TokenSelector } from './TokenSelector';
import { TokenModal } from './TokenModal';
import { Toast } from './Toast';
import { useSwap } from '../hooks/useSwap';
import type { Token } from '../types';

const DECIMAL_PLACES = 6;

export const SwapForm: React.FC = () => {
  const { state, calculateSwapAmount, setSelectedDirection } = useSwap();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fromToken, setFromToken] = useState<Token>({
    symbol: 'SWTH',
    name: 'Switcheo Token',
    price: 0,
    icon: 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/SWTH.svg',
  });
  const [toToken, setToToken] = useState<Token>({
    symbol: 'ETH',
    name: 'Ethereum',
    price: 0,
    icon: 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/ETH.svg',
  });
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleFromAmountChange = useCallback((value: string) => {
    setFromAmount(value);
    if (!value) {
      setToAmount('');
      return;
    }

    const amount = calculateSwapAmount(
      parseFloat(value),
      fromToken.symbol,
      toToken.symbol
    );

    if (amount === null) {
      setToast({ type: 'error', message: 'Price information unavailable' });
      return;
    }

    setToAmount(amount.toFixed(DECIMAL_PLACES));
  }, [calculateSwapAmount, fromToken.symbol, toToken.symbol]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAmount) {
      setToast({ type: 'error', message: 'Please enter an amount' });
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      setToast({ type: 'success', message: 'Swap successful!' });
      setFromAmount('');
      setToAmount('');
    } catch {
      setToast({ type: 'error', message: 'Swap failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    if (fromAmount) {
      handleFromAmountChange(fromAmount);
    }
  };

  const handleTokenSelect = (token: Token) => {
    if (state.selectedDirection === 'from') {
      setFromToken(token);
    } else {
      setToToken(token);
    }
    if (fromAmount) {
      handleFromAmountChange(fromAmount);
    }
  };

  return (
    <div className="swap-card">
      <div className="card-header">
        <h2>Swap Tokens</h2>
        <p className="subtitle">Trade tokens in an instant</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="input-group from-token">
          <label>You Pay</label>
          <div className="token-input-container">
            <TokenSelector
              token={fromToken}
              direction="from"
              onClick={() => {
                setSelectedDirection('from');
                setIsModalOpen(true);
              }}
            />
            <input
              type="number"
              id="fromAmount"
              placeholder="0.0"
              step="any"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
            />
            <div className="token-balance">
              Balance: <span>0.00</span>
            </div>
          </div>
        </div>

        <div
          className="swap-direction-btn"
          onClick={switchTokens}
        >
          <ArrowDown color="#fff" size={24} strokeWidth={2.5} />
        </div>

        <div className="input-group to-token">
          <label>You Receive</label>
          <div className="token-input-container">
            <TokenSelector
              token={toToken}
              direction="to"
              onClick={() => {
                setSelectedDirection('to');
                setIsModalOpen(true);
              }}
            />
            <input
              type="number"
              id="toAmount"
              placeholder="0.0"
              step="any"
              value={toAmount}
              readOnly
            />
            <div className="token-balance">
              Balance: <span>0.00</span>
            </div>
          </div>
        </div>

        <div className="exchange-rate">
          1 {fromToken.symbol} = {calculateSwapAmount(Number(1), fromToken.symbol, toToken.symbol)?.toFixed(DECIMAL_PLACES) || '0.0000'} {toToken.symbol}
        </div>

        <button
          type="submit"
          className="swap-button"
          disabled={!fromAmount || loading || state.loadingPrices}
        >
          <span className="button-text">
            {loading ? 'Swapping...' : !fromAmount ? 'Enter an amount' : 'Swap'}
          </span>
          {loading && <div className="loading-spinner" />}
        </button>
      </form>

      <TokenModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tokens={state.tokens}
        onSelect={handleTokenSelect}
      />

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};