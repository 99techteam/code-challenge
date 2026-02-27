"use client";

import React, { Fragment, useState, useMemo } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { TokenPrice } from '../types/token';

interface TokenSelectorProps {
  tokens: TokenPrice[];
  selectedToken: TokenPrice | null;
  onChange: (token: TokenPrice | null) => void;
  excludeToken?: TokenPrice | null;
}

export default function TokenSelector({ tokens, selectedToken, onChange, excludeToken }: TokenSelectorProps) {
  const [query, setQuery] = useState('');

  const filteredTokens = useMemo(() => {
    return tokens
      .filter((token) => token.currency !== excludeToken?.currency)
      .filter((token) =>
        token.currency.toLowerCase().includes(query.toLowerCase())
      );
  }, [tokens, query, excludeToken]);

  const getTokenIcon = (symbol: string) => {
    return `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${symbol}.svg`;
  };

  return (
    <div className="relative z-20">
      <Combobox value={selectedToken} onChange={onChange}>
        <div className="relative">
          <Combobox.Button className="w-full flex items-center justify-between gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm rounded-full py-1.5 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            {selectedToken ? (
              <div className="flex items-center gap-2 overflow-hidden pl-1">
                <img
                  src={getTokenIcon(selectedToken.currency)}
                  alt={selectedToken.currency}
                  className="w-6 h-6 rounded-full"
                  onError={(e) => {
                    // Fallback if icon fails to load
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="%23ccc"/></svg>';
                  }}
                />
                <span className="font-semibold text-gray-900 dark:text-white truncate">
                  {selectedToken.currency}
                </span>
              </div>
            ) : (
              <span className="pl-2 text-sm text-gray-500 font-medium">Select</span>
            )}
            <ChevronDown className="w-4 h-4 text-gray-400 font-bold mr-1" />
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery('')}
        >
          <Combobox.Options className="absolute right-0 z-50 mt-2 max-h-64 w-[200px] sm:w-[240px] overflow-auto rounded-2xl bg-white dark:bg-gray-900 py-1 text-base shadow-2xl border border-gray-100 dark:border-gray-800 focus:outline-none sm:text-sm">
            <div className="px-2 pb-2 pt-2 sticky top-0 bg-white dark:bg-gray-900 z-10 border-b border-gray-100 dark:border-gray-800 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
              <Combobox.Input
                className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 border-none py-2.5 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                displayValue={(token: TokenPrice | null) => ''} 
                placeholder="Search token"
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            
            {filteredTokens.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none py-4 px-4 text-gray-500 dark:text-gray-400 text-center font-medium">
                Nothing found.
              </div>
            ) : (
              filteredTokens.map((token) => (
                <Combobox.Option
                  key={token.currency}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-3 pl-3 pr-9 transition-colors ${
                      active ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'
                    }`
                  }
                  value={token}
                >
                  {({ selected, active }) => (
                    <>
                      <div className="flex items-center gap-3">
                         <img
                          src={getTokenIcon(token.currency)}
                          alt={token.currency}
                          className="w-7 h-7 rounded-full shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="%23ccc"/></svg>';
                          }}
                        />
                        <span className={`block truncate ${selected ? 'font-semibold' : 'font-medium'}`}>
                          {token.currency}
                        </span>
                      </div>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                            active ? 'text-blue-600 dark:text-blue-400' : 'text-blue-500 dark:text-blue-500'
                          }`}
                        >
                          <Check className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </Combobox>
    </div>
  );
}
