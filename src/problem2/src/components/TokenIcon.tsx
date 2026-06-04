import { useState } from 'react';
import type { Token } from '../types';

interface TokenIconProps {
  token: Token;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'token-icon--sm',
  md: 'token-icon--md',
  lg: 'token-icon--lg',
};

export const TokenIcon: React.FC<TokenIconProps> = ({ token, size = 'md' }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <div className={`token-icon token-icon--fallback ${sizeClasses[size]}`}>{token.symbol.slice(0, 2)}</div>;
  }

  return (
    <img
      src={token.icon}
      alt={token.symbol}
      className={`token-icon ${sizeClasses[size]}`}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
};
