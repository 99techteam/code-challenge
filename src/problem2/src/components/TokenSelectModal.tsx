import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TokenIcon } from './TokenIcon';
import { formatDisplayAmount, formatRelativeTime } from '../utils/format';
import type { PriceData } from '../types';

interface TokenSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: string[];
  priceMap: Map<string, PriceData>;
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
  title: string;
}

export const TokenSelectModal = ({
  isOpen,
  onClose,
  tokens,
  priceMap,
  selectedSymbol,
  onSelect,
  title,
}: TokenSelectModalProps) => {
  const [search, setSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredTokens = useMemo(() => {
    const trimmedSearch = search.trim();
    if (trimmedSearch) {
      return tokens.filter((s) =>
        s.toLowerCase().includes(trimmedSearch.toLowerCase())
      );
    }
    return tokens;
  }, [search, tokens]);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleSelect = (symbol: string) => {
    onSelect(symbol);
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="modal token-select-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="token-modal-title"
      aria-describedby="token-modal-desc"
    >
      <div className="modal-overlay" onClick={onClose} aria-hidden="true" />
      <div className="modal-content token-select-modal-content">
        <div className="token-select-modal-header">
          <div className="token-select-modal-header-text">
            <h2 id="token-modal-title" className="token-select-modal-title">
              {title}
            </h2>
            <p id="token-modal-desc" className="token-select-modal-subtitle">
              Search and select a token
            </p>
          </div>
          <button
            type="button"
            className="token-select-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="token-select-modal-search">
          <input
            ref={searchInputRef}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by symbol..."
            aria-label="Search tokens"
            className="token-select-modal-search-input"
          />
        </div>

        <ul
          className="token-select-modal-list"
          role="listbox"
          aria-label="Token list"
        >
          {filteredTokens.length === 0 ? (
            <li className="token-select-modal-item token-select-modal-item--empty">
              <span className="token-select-modal-empty-icon" aria-hidden="true">🔍</span>
              <span>
                {search.trim()
                  ? `No token found for "${search.trim()}"`
                  : 'No tokens available'}
              </span>
            </li>
          ) : (
            filteredTokens.map((symbol) => {
              const data = priceMap.get(symbol);
              const isSelected = symbol === selectedSymbol;
              return (
                <li
                  key={symbol}
                  className="token-select-modal-item"
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={0}
                  onClick={() => handleSelect(symbol)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(symbol);
                    }
                  }}
                >
                  <span className="token-select-modal-item-icon">
                    <TokenIcon symbol={symbol} />
                  </span>
                  <div className="token-select-modal-item-info">
                    <span className="token-select-modal-item-symbol">{symbol}</span>
                    {data ? (
                      <>
                        <span className="token-select-modal-item-price">
                          ${formatDisplayAmount(data.price)}
                        </span>
                        <span className="token-select-modal-item-date">
                          {formatRelativeTime(new Date(data.date))}
                        </span>
                      </>
                    ) : (
                      <span className="token-select-modal-item-meta">—</span>
                    )}
                  </div>
                  {isSelected && (
                    <span className="token-select-modal-item-check" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
