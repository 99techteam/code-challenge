import { useState, useRef, useEffect } from 'react';
import type { Token } from '../types';
import { TokenIcon } from './TokenIcon';

interface TokenSelectorProps {
  tokens: Token[];
  selectedToken: Token | null;
  onSelect: (token: Token) => void;
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({
  tokens,
  selectedToken,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(search.toLowerCase()) ||
      token.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="token-selector" ref={dropdownRef}>
      <button type="button" className="token-selector__button" onClick={() => setIsOpen((value) => !value)}>
        {selectedToken ? (
          <>
            <TokenIcon token={selectedToken} size="sm" />
            <span>{selectedToken.symbol}</span>
          </>
        ) : (
          <span className="token-selector__placeholder">Select</span>
        )}
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="token-selector__dropdown">
          <div className="token-selector__search">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search token"
              type="text"
            />
          </div>

          <div className="token-selector__list">
            {filteredTokens.length === 0 ? (
              <div className="token-selector__empty">No tokens found</div>
            ) : (
              filteredTokens.map((token) => (
                <button
                  key={token.symbol}
                  type="button"
                  className="token-selector__item"
                  onClick={() => {
                    onSelect(token);
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  <TokenIcon token={token} size="md" />
                  <div className="token-selector__item-copy">
                    <strong>{token.symbol}</strong>
                    <span>{token.name}</span>
                  </div>
                  <em>${token.price?.toLocaleString()}</em>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
