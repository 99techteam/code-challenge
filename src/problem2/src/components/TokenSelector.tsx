import React from 'react';
import type { Token } from '../types';

interface TokenSelectorProps {
  token: Token;
  direction: string;
  onClick: () => void;
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({
  token,
  direction,
  onClick,
}) => (
  <button
    type="button"
    className="token-selector improved"
    onClick={onClick}
    data-direction={direction}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.5rem 1.25rem',
      background: 'linear-gradient(90deg, #f8fafc 60%, #e0e7ff 100%)',
      border: '2px solid #2563eb',
      borderRadius: '999px',
      boxShadow: '0 4px 16px 0 rgba(37,99,235,0.10)',
      cursor: 'pointer',
      transition: 'box-shadow 0.22s, transform 0.22s, border-color 0.22s',
      fontWeight: 700,
      fontSize: '1.08rem',
      color: '#1e293b',
      outline: 'none',
      position: 'relative',
      minWidth: 90,
      borderColor: '#2563eb',
    }}
    onMouseOver={e => {
      (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px 0 rgba(37,99,235,0.18)';
      (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px) scale(1.06)';
      (e.currentTarget as HTMLButtonElement).style.borderColor = '#1d4ed8';
      const icon = e.currentTarget.querySelector('i');
      if (icon) (icon as HTMLElement).style.color = '#2563eb';
    }}
    onMouseOut={e => {
      (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px 0 rgba(37,99,235,0.10)';
      (e.currentTarget as HTMLButtonElement).style.transform = 'none';
      (e.currentTarget as HTMLButtonElement).style.borderColor = '#2563eb';
      const icon = e.currentTarget.querySelector('i');
      if (icon) (icon as HTMLElement).style.color = '#64748b';
    }}
  >
    <img
      id={`${direction}TokenIcon`}
      src={token.icon}
      alt={token.symbol}
      className="token-icon"
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        boxShadow: '0 2px 8px 0 rgba(37,99,235,0.10)',
        background: '#fff',
        objectFit: 'contain',
        marginRight: 4,
        border: '1.5px solid #e2e8f0',
        transition: 'box-shadow 0.22s',
      }}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/SWTH.svg';
      }}
    />
    <span
      id={`${direction}TokenSymbol`}
      style={{
        fontWeight: 700,
        fontSize: '1.08rem',
        letterSpacing: '0.01em',
        marginRight: 2,
        color: '#1e293b',
        textShadow: '0 1px 2px #e0e7ff',
      }}
    >
      {token.symbol}
    </span>
    <i
      className="fas fa-chevron-down"
      style={{
        fontSize: '1.15rem',
        color: '#64748b',
        marginLeft: 2,
        transition: 'color 0.22s',
      }}
    />
  </button>
);