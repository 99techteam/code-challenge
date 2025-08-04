import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getTokenIconUrl } from '../data/mockData';
import { formatNumber } from '../utils/api';

// Enhanced Token interface for component usage
interface TokenInfo {
  symbol: string;
  name: string;
  price: number;
  iconUrl: string;
}

interface TokenAmountInputProps {
  label: string; // e.g. "From", "To"
  selectedToken: TokenInfo | null;
  onTokenSelect?: (token: TokenInfo) => void;
  tokenList: TokenInfo[]; // All available tokens (with prices)
  balanceMap?: Record<string, number>; // Optional mock balances
  
  // Amount input props
  amount: string;
  onAmountChange?: (value: string) => void;
  amountReadonly?: boolean;
  amountPlaceholder?: string;
  
  // Token selector props
  estimatedValue?: number; // Optional display when readonly
  disabledTokens?: string[]; // Optional, tokens not selectable
  excludeToken?: string; // Token to exclude from dropdown
  showBalanceFilter?: boolean; // Filter tokens with balance > 0
  tokenPlaceholder?: string;
  className?: string;
  
  // Layout props
  showBalance?: boolean;
  maxButtonLabel?: string;
  onMaxClick?: () => void;
}

const TokenAmountInput: React.FC<TokenAmountInputProps> = ({
  label,
  selectedToken,
  onTokenSelect,
  tokenList = [],
  balanceMap = {},
  
  amount,
  onAmountChange,
  amountReadonly = false,
  amountPlaceholder = "0.0",
  
  estimatedValue,
  disabledTokens = [],
  excludeToken,
  showBalanceFilter = false,
  tokenPlaceholder = "Select token",
  className = "",
  
  showBalance = true,
  maxButtonLabel,
  onMaxClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingIcons, setLoadingIcons] = useState<Set<string>>(new Set());
  const [failedIcons, setFailedIcons] = useState<Set<string>>(new Set());
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Calculate dropdown position for portal
  const calculateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right - window.scrollX
      });
    }
  };

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
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

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen) {
      calculateDropdownPosition();
      const handleResize = () => calculateDropdownPosition();
      const handleScroll = () => calculateDropdownPosition();
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isOpen]);

  // Set dropdown position via DOM manipulation to avoid inline styles lint error
  useEffect(() => {
    if (dropdownRef.current && dropdownPosition) {
      const element = dropdownRef.current;
      element.style.top = `${dropdownPosition.top}px`;
      element.style.right = `${dropdownPosition.right}px`;
    }
  }, [dropdownPosition]);

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
    if (!disabledTokens.includes(token.symbol) && onTokenSelect) {
      onTokenSelect(token);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onAmountChange && !amountReadonly) {
      onAmountChange(e.target.value);
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

  const selectedBalance = selectedToken ? balanceMap[selectedToken.symbol] || 0 : 0;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header with label and balance */}
      <div className="flex justify-between items-center">
        <span className="text-gray-300 text-sm font-medium">{label}</span>
        {selectedToken && showBalance && (
          <span className="text-gray-300 text-xs">
            Balance: {formatNumber(selectedBalance, 4)} {selectedToken.symbol}
          </span>
        )}
      </div>
      
      {/* Combined Input Container - Fixed Layout */}
      <div className="w-full flex items-center justify-between gap-4 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 shadow-sm relative transition-all duration-200">
        {/* Amount Input Section - Left Side */}
        <div className="flex-1 min-w-0">
          <input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            placeholder={amountPlaceholder}
            readOnly={amountReadonly}
            className={`
              w-full bg-transparent text-white text-lg font-semibold placeholder-gray-400 outline-none border-none
              ${amountReadonly ? 'cursor-default' : 'cursor-text'}
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
            `}
            step="any"
            min="0"
          />
          
          {/* Max button or estimated value */}
          {maxButtonLabel && onMaxClick && !amountReadonly && selectedToken && selectedBalance > 0 && (
            <button
              onClick={onMaxClick}
              className="text-indigo-400 text-xs hover:text-indigo-300 transition-colors mt-1 font-medium truncate"
            >
              {maxButtonLabel}: {formatNumber(selectedBalance, 4)}
            </button>
          )}
          
          {estimatedValue !== undefined && amountReadonly && selectedToken && (
            <div className="text-green-400 text-xs mt-1 truncate">
              ≈ {formatNumber(estimatedValue, 4)} {selectedToken.symbol}
            </div>
          )}
        </div>

        {/* Token Selector Section - Right Side */}
        <div className="relative flex-shrink-0">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            {...(isOpen ? { 'aria-expanded': true } : { 'aria-expanded': false })}
            aria-haspopup="listbox"
            aria-label={`Select ${label} token`}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-lg px-3 py-2 transition-all duration-150 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            {selectedToken ? (
              <>
                {renderTokenIcon(selectedToken.symbol, 'sm')}
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <span className="text-white font-bold text-sm truncate">{selectedToken.symbol}</span>
                  <span className="text-gray-400 text-xs truncate">
                    ${formatNumber(selectedToken.price, 2)}
                  </span>
                </div>
              </>
            ) : (
              <span className="text-gray-400 font-medium text-sm truncate">{tokenPlaceholder}</span>
            )}
            
            {/* Chevron Icon */}
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-150 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Portal - Using React Portal for proper z-index */}
          {isOpen && dropdownPosition && createPortal(
            <div 
              ref={dropdownRef}
              className="dropdown-portal bg-white rounded-lg shadow-2xl border border-gray-200 min-w-[280px] sm:min-w-[320px] w-max max-h-[350px] overflow-hidden animate-in fade-in slide-in-from-top-2"
              data-top={dropdownPosition.top}
              data-right={dropdownPosition.right}
            >
              {/* Search Input */}
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="max-h-[240px] overflow-y-auto" role="listbox" aria-label={`${label} token selection`}>
                {filteredTokens.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <div className="w-10 h-10 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
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
                          {...(isSelected ? { 'aria-selected': true } : { 'aria-selected': false })}
                          className={`
                            w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 hover:bg-gray-100 active:bg-gray-200 cursor-pointer
                            ${isDisabled 
                              ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                              : ''
                            }
                            ${isSelected ? 'bg-indigo-50 border-r-4 border-indigo-500' : ''}
                          `}
                          title={`${token.name} - $${formatNumber(token.price, 4)}`}
                        >
                          {/* Token Icon */}
                          <div className="flex-shrink-0">
                            {renderTokenIcon(token.symbol, 'sm')}
                          </div>
                          
                          {/* Token Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-gray-900 font-bold text-base truncate">{token.symbol}</span>
                              <span className="text-green-600 text-xs font-semibold whitespace-nowrap">
                                ${formatNumber(token.price, 4)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-gray-500 text-sm truncate">{token.name}</span>
                              {balanceMap[token.symbol] !== undefined && (
                                <span className={`text-xs whitespace-nowrap ${
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
                  <span className="truncate">
                    {filteredTokens.length} token{filteredTokens.length !== 1 ? 's' : ''} available
                  </span>
                  <span className="whitespace-nowrap ml-2">Press ESC to close</span>
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenAmountInput;
