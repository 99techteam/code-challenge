import React, { useMemo, useState } from 'react';
import type { TokenPrice } from '../lib/prices';
import { buildTokenIconUrl } from '../lib/prices';
import { formatNumber, formatUsd } from '../lib/format';

type Props = {
  label: string;
  token: TokenPrice;
  amount: string;
  onAmountChange?: (v: string) => void;
  onTokenClick: () => void;
  helper?: React.ReactNode;
  readOnly?: boolean;
  error?: string;
};

export default function TokenField({
  label,
  token,
  amount,
  onAmountChange,
  onTokenClick,
  helper,
  readOnly,
  error
}: Props) {
  const [iconErr, setIconErr] = useState(false);
  const icon = useMemo(() => buildTokenIconUrl(token.symbol), [token.symbol]);

  return (
    <div className="field">
      <div className="field__top">
        <div className="label">{label}</div>
        <div className="helper">{helper}</div>
      </div>

      <div className={`field__box ${error ? 'field__box--error' : ''}`}>
        <button className="token-btn" type="button" onClick={onTokenClick} aria-label={`Select ${label} token`}>
          {iconErr ? (
            <div className="token-icon token-icon--fallback">{token.symbol.slice(0, 1)}</div>
          ) : (
            <img className="token-icon" src={icon} alt={token.symbol} onError={() => setIconErr(true)} />
          )}
          <div className="token-btn__text">
            <div className="token-btn__symbol">{token.symbol}</div>
            <div className="token-btn__price">{formatUsd(token.price)}</div>
          </div>
          <div className="token-btn__chev">▾</div>
        </button>

        <div className="amount">
          <input
            className="amount__input"
            inputMode="decimal"
            placeholder="0.0"
            value={amount}
            readOnly={!!readOnly}
            onChange={(e) => onAmountChange?.(e.target.value)}
            aria-label={`${label} amount`}
          />
          <div className="amount__usd">≈ {formatUsd(Number.isFinite(+amount.replace(/,/g, '')) ? (+amount.replace(/,/g, '') || 0) * token.price : 0)}</div>
          <div className="amount__meta">1 {token.symbol} = {formatNumber(token.price, 6)} USD</div>
        </div>
      </div>

      {error ? <div className="error">{error}</div> : null}
    </div>
  );
}
