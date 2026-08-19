import { useMemo, useState } from 'react';
import { usePrices } from './usePrices';
import { TokenSelect } from './TokenSelect';
import type { Token } from './types';

type Status = 'idle' | 'submitting' | 'success';

export function SwapForm() {
  const { tokens, loading, error } = usePrices();
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const amountNumber = Number(amount);
  const amountValid = amount.trim() !== '' && Number.isFinite(amountNumber) && amountNumber > 0;

  const formError = useMemo(() => {
    if (!fromToken || !toToken) return null;
    if (fromToken.symbol === toToken.symbol) return 'Choose two different tokens';
    if (amount.trim() !== '' && !amountValid) return 'Enter a valid positive amount';
    return null;
  }, [fromToken, toToken, amount, amountValid]);

  const canSubmit =
    !!fromToken && !!toToken && amountValid && !formError && status !== 'submitting';

  const receiveAmount =
    fromToken && toToken && amountValid
      ? (amountNumber * fromToken.price) / toToken.price
      : null;

  function swapDirection() {
    setFromToken(toToken);
    setToToken(fromToken);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus('submitting');
    setTimeout(() => {
      setStatus('success');
    }, 1200);
  }

  if (loading) return <div className="swap-card swap-card--loading">Loading tokens…</div>;
  if (error) return <div className="swap-card swap-card--loading">Failed to load prices: {error}</div>;

  if (status === 'success') {
    return (
      <div className="swap-card">
        <h1>Swap complete</h1>
        <p className="swap-success">
          Swapped {amount} {fromToken?.symbol} for {receiveAmount?.toFixed(6)} {toToken?.symbol}
        </p>
        <button
          type="button"
          className="swap-submit"
          onClick={() => {
            setAmount('');
            setStatus('idle');
          }}
        >
          Make another swap
        </button>
      </div>
    );
  }

  return (
    <form className="swap-card" onSubmit={handleSubmit}>
      <h1>Swap</h1>

      <label className="swap-label" htmlFor="amount-in">
        Amount to send
      </label>
      <div className="swap-row">
        <input
          id="amount-in"
          className="swap-amount-input"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <TokenSelect tokens={tokens} value={fromToken} onChange={setFromToken} label="Token to send" />
      </div>

      <button
        type="button"
        className="swap-direction"
        onClick={swapDirection}
        aria-label="Reverse swap direction"
        disabled={!fromToken && !toToken}
      >
        ↓
      </button>

      <label className="swap-label" htmlFor="amount-out">
        Amount to receive
      </label>
      <div className="swap-row">
        <input
          id="amount-out"
          className="swap-amount-input"
          type="text"
          readOnly
          placeholder="0.0"
          value={receiveAmount !== null ? receiveAmount.toFixed(6) : ''}
        />
        <TokenSelect tokens={tokens} value={toToken} onChange={setToToken} label="Token to receive" />
      </div>

      {formError && <p className="swap-error">{formError}</p>}

      <button type="submit" className="swap-submit" disabled={!canSubmit}>
        {status === 'submitting' ? 'Swapping…' : 'CONFIRM SWAP'}
      </button>
    </form>
  );
}
