import { useState } from 'react';
import type { TokenPrice } from './quote';

interface TokenPickerProps {
  id: string;
  iconId: string;
  label: string;
  tokens: readonly TokenPrice[];
  currency: string;
  onChange: (currency: string) => void;
}

function TokenIcon({ id, currency }: { id: string; currency: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      id={id}
      src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${encodeURIComponent(currency)}.svg`}
      alt=""
      width={24}
      height={24}
      hidden={failed}
      onError={() => setFailed(true)}
    />
  );
}

export function TokenPicker({ id, iconId, label, tokens, currency, onChange }: TokenPickerProps) {
  return (
    <div className="token-picker">
      {currency && <TokenIcon key={currency} id={iconId} currency={currency} />}
      <label className="sr-only" htmlFor={id}>{label}</label>
      <select id={id} value={currency} onChange={event => onChange(event.target.value)}>
        {tokens.map(token => (
          <option key={token.currency} value={token.currency}>{token.currency}</option>
        ))}
      </select>
    </div>
  );
}
