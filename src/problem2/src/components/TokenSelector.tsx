import React, { useState, useRef, useEffect } from 'react';
import { getTokenIconUrl } from '../data/mockData';
import { formatNumber } from '../utils/api';

// Enhanced Token interface for component usage
interface TokenInfo {
  symbol: string;
  name: string;
  price: number;
  iconUrl: string;
}

interface TokenSelectorProps {
  label: string; // e.g. "From", "To"
  selectedToken: TokenInfo | null;
  onSelect?: (token: TokenInfo) => void;
  tokenList: TokenInfo[]; // All available tokens (with prices)
  balanceMap?: Record<string, number>; // Optional mock balances
  estimatedValue?: number; // Optional display when readonly
  isReadonly?: boolean; // true = cannot change (used for To)
  disabledTokens?: string[]; // Optional, tokens not selectable
  excludeToken?: string; // Token to exclude from dropdown
  showBalanceFilter?: boolean; // Filter tokens with balance > 0
  placeholder?: string;
  className?: string;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({
  label,
  selectedToken,
  onSelect,
  tokenList = [],
  balanceMap = {},
  estimatedValue,
  isReadonly = false,
  disabledTokens = [],
  excludeToken,
  showBalanceFilter = false,
  placeholder = "Select token",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingIcons, setLoadingIcons] = useState<Set<string>>(new Set());
  const [failedIcons, setFailedIcons] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Filter and search tokens
  const filteredTokens = React.useMemo(() => {
    let filtered = tokenList.filter(token => {
      // Exclude specified token
      if (token.symbol === excludeToken) return false;
      
      // Filter disabled tokens
      if (disabledTokens.includes(token.symbol)) return false;
      
      // Filter by balance if required
      if (showBalanceFilter && (balanceMap[token.symbol] || 0) === 0) return false;
      
      return true;
    });

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(token => 
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [tokenList, excludeToken, disabledTokens, showBalanceFilter, balanceMap, searchTerm]);

  const handleTokenSelect = (token: TokenInfo) => {
    if (!disabledTokens.includes(token.symbol) && onSelect) {
      onSelect(token);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleImageLoad = (symbol: string) => {
    setLoadingIcons(prev => {
      const newSet = new Set(prev);
      newSet.delete(symbol);
      return newSet;
    });
  };

  const handleImageError = (symbol: string) => {
    setFailedIcons(prev => new Set(prev).add(symbol));
    setLoadingIcons(prev => {
      const newSet = new Set(prev);
      newSet.delete(symbol);
      return newSet;
    });
  };

  const handleImageLoadStart = (symbol: string) => {
    setLoadingIcons(prev => new Set(prev).add(symbol));
  };

  const renderTokenIcon = (symbol: string, size: 'sm' | 'md' = 'md') => {
    const isLoading = loadingIcons.has(symbol);
    const hasFailed = failedIcons.has(symbol);
    const sizeClasses = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';

    if (hasFailed) {
      return (
        <div className={`${sizeClasses} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
          {symbol.charAt(0)}
        </div>
      );
    }

    return (
      <div className={`relative ${sizeClasses} flex-shrink-0`}>
        {isLoading && (
          <div className={`absolute inset-0 rounded-full bg-gray-200 animate-pulse`}></div>
        )}
        <img
          src={getTokenIconUrl(symbol)}
          alt={symbol}
          className={`${sizeClasses} rounded-full shadow-sm border border-gray-200 transition-opacity ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoadStart={() => handleImageLoadStart(symbol)}
          onLoad={() => handleImageLoad(symbol)}
          onError={() => handleImageError(symbol)}
        />
      </div>
    );
  };

  const buttonContent = (
    <>
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {selectedToken ? (
          <>
            {renderTokenIcon(selectedToken.symbol)}
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="text-gray-900 font-bold text-sm truncate">{selectedToken.symbol}</span>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                {/* Show balance for normal mode */}
                {balanceMap[selectedToken.symbol] !== undefined && !isReadonly && (
                  <span className="truncate">
                    Balance: {formatNumber(balanceMap[selectedToken.symbol], 4)}
                  </span>
                )}
                {/* Show estimated value for readonly mode */}
                {isReadonly && estimatedValue !== undefined && (
                  <span className="text-green-600 font-medium truncate">
                    ≈ {formatNumber(estimatedValue, 4)} {selectedToken.symbol}
                  </span>
                )}
                {/* Show price */}
                <span className="text-gray-400">
                  ${formatNumber(selectedToken.price, 2)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <span className="text-gray-500 font-medium">{placeholder}</span>
        )}
      </div>
      
      {/* Show appropriate icon based on state */}
      <div className="flex-shrink-0 ml-2">
        {isReadonly ? (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        ) : (
          <svg
            className={`w-4 h-4 text-gray-600 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
    </>
  );

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      {/* Main Button/Container */}
      {isReadonly ? (
        <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 shadow-sm flex justify-between items-center min-h-[56px]">
          {buttonContent}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          {...(isOpen ? { 'aria-expanded': 'true' } : { 'aria-expanded': 'false' })}
          aria-haspopup="listbox"
          aria-label={`Select ${label} token`}
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 shadow-sm flex justify-between items-center min-h-[56px] hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150 ease-in-out"
        >
          {buttonContent}
        </button>
      )}

      {/* Dropdown Portal */}
      {isOpen && !isReadonly && (
        <div 
          className="absolute top-full left-0 right-0 mt-1 z-50 bg-white w-full max-h-64 overflow-hidden rounded-md shadow-lg border border-gray-200 min-w-[300px] animate-in fade-in slide-in-from-top-2"
        >
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tokens..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-sm"
              />
            </div>
          </div>

          {/* Token List */}
          <div className="max-h-60 overflow-y-auto" role="listbox" aria-label={`${label} token selection`}>
            {filteredTokens.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <div className="w-10 h-10 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm font-medium">
                  {searchTerm ? `No tokens found for "${searchTerm}"` : 'No tokens available'}
                </p>
                {searchTerm && (
                  <p className="text-gray-400 text-xs mt-1">Try a different search term</p>
                )}
              </div>
            ) : (
              <div className="py-1">
                {filteredTokens.map((token) => {
                  const isSelected = selectedToken?.symbol === token.symbol;
                  const isDisabled = disabledTokens.includes(token.symbol);
                  const balance = balanceMap[token.symbol] || 0;
                  
                  return (
                    <button
                      key={token.symbol}
                      onClick={() => !isDisabled && handleTokenSelect(token)}
                      disabled={isDisabled}
                      role="option"
                      {...(isSelected ? { 'aria-selected': 'true' } : { 'aria-selected': 'false' })}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 cursor-pointer text-left
                        ${isDisabled 
                          ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                          : 'hover:bg-gray-50 active:bg-gray-100'
                        }
                        ${isSelected ? 'bg-indigo-50 border-r-4 border-indigo-500' : ''}
                      `}
                      title={`${token.name} - $${formatNumber(token.price, 4)}`}
                    >
                      {renderTokenIcon(token.symbol, 'sm')}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-900 font-bold text-sm truncate">{token.symbol}</span>
                          <span className="text-green-600 text-xs font-semibold">
                            ${formatNumber(token.price, 4)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 text-xs truncate">{token.name}</span>
                          {balanceMap[token.symbol] !== undefined && (
                            <span className={`text-xs ${
                              balance === 0 ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {balance === 0 ? 'Empty' : formatNumber(balance, 4)}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {filteredTokens.length} token{filteredTokens.length !== 1 ? 's' : ''} available
              </span>
              <span>Press ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenSelector;
