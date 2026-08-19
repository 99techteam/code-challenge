import { useState } from 'react';
import { tokenIconUrl } from './tokenIconUrl';

export function TokenIcon({ symbol }: { symbol: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="token-icon token-icon--fallback" aria-hidden="true">
        {symbol.slice(0, 1)}
      </span>
    );
  }

  return (
    <img
      className="token-icon"
      src={tokenIconUrl(symbol)}
      alt={symbol}
      onError={() => setFailed(true)}
    />
  );
}
