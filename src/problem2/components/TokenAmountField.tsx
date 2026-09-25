import { ChevronDown } from 'lucide-react';
import type { Token } from '../swap';
import TokenIcon from './TokenIcon';

export default function TokenAmountField({
  side,
  token,
  value,
  fiat,
  disabled,
  loading,
  invalid,
  onChange,
  onSelect,
}: {
  side: 'pay' | 'receive';
  token?: Token;
  value: string;
  fiat: string;
  disabled: boolean;
  loading: boolean;
  invalid?: boolean;
  onChange?: (value: string) => void;
  onSelect: () => void;
}) {
  const label = side === 'pay' ? 'You pay' : 'You receive';
  const id = `${side}-amount`;
  const amountSize =
    value.length > 12
      ? 'amount-small'
      : value.length > 8
        ? 'amount-medium'
        : '';
  return (
    <div className={`amount-field ${side} ${invalid ? 'invalid' : ''}`}>
      <div className="field-heading">
        <label htmlFor={id}>
          <span>{side === 'pay' ? 'From' : 'To'}</span>
          {side === 'pay' ? 'You pay' : 'You receive'}
        </label>
      </div>
      <div className="amount-row">
        {side === 'receive' ? (
          <output
            id={id}
            aria-label={label}
            className={`amount-output ${amountSize}`}
            htmlFor="pay-amount"
            title={value || undefined}
            aria-live="off"
          >
            {value || '0.00'}
          </output>
        ) : (
          <input
            id={id}
            aria-label={label}
            className={amountSize}
            value={value}
            placeholder="0.00"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={invalid || undefined}
            aria-describedby="amount-error pay-fiat"
            onChange={(event) => onChange?.(event.target.value)}
          />
        )}
        <button
          type="button"
          className="token-select"
          disabled={disabled}
          onClick={onSelect}
          aria-label={`${label}: ${token?.currency || (loading ? 'loading' : 'unavailable')}. Select token`}
        >
          {token ? (
            <>
              <TokenIcon key={token.currency} symbol={token.currency} />
              <span>{token.currency}</span>
            </>
          ) : loading ? (
            <span className="token-skeleton" />
          ) : (
            <span>Unavailable</span>
          )}
          <ChevronDown size={16} />
        </button>
      </div>
      <div className="field-bottom">
        <span className="fiat" id={`${side}-fiat`}>
          {fiat}
        </span>
        <span>
          {token?.name ||
            (loading ? 'Loading assets...' : 'Prices unavailable')}
        </span>
      </div>
    </div>
  );
}
