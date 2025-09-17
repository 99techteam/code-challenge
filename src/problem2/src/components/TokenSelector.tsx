'use client';

import { useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import Image from 'next/image';
import { Token, TOKENS } from '@/lib/tokens';

interface TokenSelectorProps {
  selectedToken: Token | null;
  onSelectToken: (token: Token) => void;
  disabled?: boolean;
  excludeToken?: Token | null;
}

export default function TokenSelector({
  selectedToken,
  onSelectToken,
  disabled = false,
  excludeToken,
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTokens = TOKENS.filter(token => {
    const matchesSearch = 
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isNotExcluded = excludeToken ? token.id !== excludeToken.id : true;
    
    return matchesSearch && isNotExcluded;
  });

  const handleSelect = (token: Token) => {
    onSelectToken(token);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative">
      {/* Token Selector Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 
          dark:border-gray-700 bg-white dark:bg-gray-800 
          hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          min-w-[120px] justify-between
        `}
      >
        {selectedToken ? (
          <>
            <div className="flex items-center gap-2">
              <Image
                src={selectedToken.icon}
                alt={selectedToken.symbol}
                width={20}
                height={20}
                className="rounded-full"
              />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {selectedToken.symbol}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </>
        ) : (
          <>
            <span className="text-gray-500">Select token</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </>
        )}
      </button>

      {/* Token Selection Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Select a token
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name or symbol"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 
                           bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Token List */}
            <div className="flex-1 overflow-y-auto">
              {filteredTokens.length > 0 ? (
                <div className="p-2">
                  {filteredTokens.map((token) => (
                    <button
                      key={token.id}
                      onClick={() => handleSelect(token)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 
                               dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <Image
                        src={token.icon}
                        alt={token.symbol}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {token.symbol}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {token.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          ${token.price.toLocaleString()}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No tokens found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}