import { useState, useRef, useEffect, type FC } from 'react';
import type { Token } from '../types';
import { TokenIcon } from './TokenIcon';

interface CurrencySelectorProps {
  label: string;
  tokens: Token[];
  selectedToken: Token | null;
  onSelect: (token: Token) => void;
  error?: string;
  disabled?: boolean;
}

export const CurrencySelector: FC<CurrencySelectorProps> = ({
  label,
  tokens,
  selectedToken,
  onSelect,
  error,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTokens = tokens.filter(token =>
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (token: Token) => {
    onSelect(token);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>
      <button
        type="button"
        className={`w-full bg-slate-700 border rounded-lg px-4 py-3 text-base transition-colors duration-200 outline-none flex items-center justify-between gap-3 ${error
          ? 'border-red-500'
          : 'border-slate-600 hover:border-slate-500 focus:border-blue-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        {selectedToken ? (
          <div className="flex items-center gap-3">
            <TokenIcon token={selectedToken} size={20} />
            <span className="text-slate-100">{selectedToken.symbol}</span>
          </div>
        ) : (
          <span className="text-slate-400">Select token</span>
        )}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded-lg max-h-80 overflow-auto z-20 shadow-xl">
          <div className="p-3">
            <input
              type="text"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 text-base transition-colors duration-200 outline-none hover:border-slate-500 focus:border-blue-500 mb-2"
              placeholder="Search tokens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            {filteredTokens.length > 0 ? (
              filteredTokens.map(token => (
                <button
                  key={token.symbol}
                  type="button"
                  onClick={() => handleSelect(token)}
                  className="w-full px-4 py-3 flex items-center gap-3 bg-transparent border-none text-slate-100 cursor-pointer transition-colors duration-150 hover:bg-slate-700 text-left"
                >
                  <TokenIcon token={token} size={24} />
                  <div className="flex-1">
                    <div className="font-medium">{token.symbol}</div>
                    <div className="text-sm text-slate-400">
                      ${token.price.toFixed(6)}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-6 text-center text-slate-400">
                No tokens found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
