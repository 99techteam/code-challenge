import React from 'react';
import { X } from 'lucide-react';
import type { Token } from '../types';

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: Token[];
  onSelect: (token: Token) => void;
}

export const TokenModal: React.FC<TokenModalProps> = ({
  isOpen,
  onClose,
  tokens,
  onSelect,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredTokens = React.useMemo(() =>
    tokens.filter(token =>
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [tokens, searchTerm]
  );

  if (!isOpen) return null;

  return (
    <div
      className="token-modal"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 60% 40%, #e0e7ff 0%, #f8fafc 100%)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        animation: 'fadeIn 0.25s',
      }}
    >
      <div
        className="modal-content"
        style={{
          background: '#fff',
          borderRadius: 32,
          boxShadow: '0 8px 40px 0 rgba(37,99,235,0.13)',
          padding: '2.5rem 1.5rem 1.5rem 1.5rem',
          width: '95%',
          maxWidth: 420,
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '2px solid #2563eb',
          position: 'relative',
          animation: 'slideUp 0.3s',
        }}
      >
        <div
          className="modal-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1.5px solid #e0e7ff',
            paddingBottom: 16,
            marginBottom: 18,
          }}
        >
          <h3 style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#2563eb',
            letterSpacing: '0.01em',
            margin: 0,
          }}>Select a token</h3>
          <button
            onClick={onClose}
            className="close-btn"
            style={{
              background: 'linear-gradient(120deg, #e0e7ff 60%, #fff 100%)',
              border: 'none',
              borderRadius: 12,
              fontSize: 22,
              color: '#64748b',
              cursor: 'pointer',
              padding: 8,
              boxShadow: '0 2px 8px 0 rgba(37,99,235,0.08)',
              transition: 'background 0.18s, color 0.18s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseOver={e => (e.currentTarget.style.color = '#ef4444')}
            onMouseOut={e => (e.currentTarget.style.color = '#64748b')}
            aria-label="Close"
          >
            <X size={22} strokeWidth={2.2} />
          </button>
        </div>
        <div
          className="search-box"
          style={{
            padding: '1rem 0',
            position: 'relative',
            marginBottom: 10,
          }}
        >
          <input
            type="text"
            id="tokenSearch"
            placeholder="Search name or paste address"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              border: '1.5px solid #e0e7ff',
              borderRadius: 14,
              fontSize: 16,
              background: '#f8fafc',
              color: '#1e293b',
              outline: 'none',
              boxShadow: '0 1px 4px 0 rgba(37,99,235,0.04)',
              transition: 'border-color 0.18s',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
            onBlur={e => (e.currentTarget.style.borderColor = '#e0e7ff')}
          />
        </div>
        <div className="token-list" style={{ padding: 4 }}>
          {filteredTokens.map((token) => (
            <div
              key={token.symbol}
              className="token-list-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.85rem',
                borderRadius: 16,
                cursor: 'pointer',
                marginBottom: 4,
                background: '#fff',
                boxShadow: '0 1px 4px 0 rgba(37,99,235,0.04)',
                border: '1.5px solid transparent',
                transition: 'background 0.18s, box-shadow 0.18s, border 0.18s',
              }}
              onClick={() => {
                onSelect(token);
                onClose();
              }}
              onMouseOver={e => {
                (e.currentTarget as HTMLDivElement).style.background = '#e0e7ff';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px 0 rgba(37,99,235,0.10)';
                (e.currentTarget as HTMLDivElement).style.border = '1.5px solid #2563eb';
              }}
              onMouseOut={e => {
                (e.currentTarget as HTMLDivElement).style.background = '#fff';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px 0 rgba(37,99,235,0.04)';
                (e.currentTarget as HTMLDivElement).style.border = '1.5px solid transparent';
              }}
            >
              <img
                src={token.icon}
                alt={token.symbol}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  marginRight: 16,
                  border: '1.5px solid #e0e7ff',
                  background: '#fff',
                  boxShadow: '0 2px 8px 0 rgba(37,99,235,0.10)',
                  objectFit: 'contain',
                  transition: 'box-shadow 0.18s',
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/SWTH.svg';
                }}
              />
              <div className="token-info">
                <div className="token-name" style={{ fontWeight: 700, fontSize: 17, color: '#1e293b' }}>{token.name}</div>
                <div className="token-symbol" style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>{token.symbol}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};