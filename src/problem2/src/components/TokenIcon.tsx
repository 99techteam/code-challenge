import { useState } from 'react';
import { getTokenIconUrl } from '../utils/api';

interface TokenIconProps {
  symbol: string | null;
  className?: string;
}

export const TokenIcon = ({ symbol, className = '' }: TokenIconProps) => {
  const [failed, setFailed] = useState(false);

  if (!symbol) return <span className={`token-icon ${className}`} />;

  if (failed) {
    return (
      <span className={`token-icon fallback ${className}`} aria-hidden="true">
        {symbol.charAt(0)}
      </span>
    );
  }

  return (
    <span className={`token-icon ${className}`} aria-hidden="true">
      <img
        src={getTokenIconUrl(symbol)}
        alt=""
        onError={() => setFailed(true)}
      />
    </span>
  );
};
