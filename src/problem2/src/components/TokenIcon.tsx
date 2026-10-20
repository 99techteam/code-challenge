import React, { useState } from 'react';

interface TokenIconProps {
  symbol: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const COLOR_MAP: Record<string, string> = {
  ETH: 'from-blue-500 to-indigo-600',
  WBTC: 'from-amber-500 to-orange-600',
  USDC: 'from-blue-400 to-cyan-500',
  BUSD: 'from-yellow-400 to-amber-500',
  ATOM: 'from-purple-500 to-indigo-700',
  OSMO: 'from-fuchsia-500 to-purple-600',
  SWTH: 'from-emerald-400 to-teal-600',
  GMX: 'from-sky-400 to-blue-600',
  BLUR: 'from-orange-500 to-red-500',
  LUNA: 'from-amber-400 to-yellow-600'
};

export const TokenIcon: React.FC<TokenIconProps> = ({ symbol, className = '', size = 'md' }) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-5 h-5 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-12 h-12 text-base'
  }[size];

  const primaryGradient = COLOR_MAP[symbol] || 'from-slate-600 to-slate-800';
  const iconUrl = `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${encodeURIComponent(symbol)}.svg`;

  if (hasError) {
    return (
      <div
        className={`rounded-full flex items-center justify-center font-bold text-white shadow-sm bg-gradient-to-br ${primaryGradient} ${sizeClasses} ${className}`}
        title={symbol}
      >
        {symbol.slice(0, 3)}
      </div>
    );
  }

  return (
    <div className={`relative rounded-full overflow-hidden flex-shrink-0 bg-slate-800/80 p-0.5 ${sizeClasses} ${className}`}>
      <img
        src={iconUrl}
        alt={symbol}
        className="w-full h-full object-contain rounded-full"
        onError={() => setHasError(true)}
        loading="lazy"
      />
    </div>
  );
};

