"use client";

import React from 'react';
import { Info } from 'lucide-react';
import { TokenPrice } from '../types/token';

interface ExchangeRateInfoProps {
  fromToken: TokenPrice;
  toToken: TokenPrice;
  rate: number;
}

export default function ExchangeRateInfo({ fromToken, toToken, rate }: ExchangeRateInfoProps) {
  if (!rate) return null;

  return (
    <div className="flex items-center justify-between text-sm font-medium text-gray-500 dark:text-gray-400 transition-opacity duration-300">
      <div className="flex items-center gap-1.5 hover:text-gray-700 dark:hover:text-gray-300 cursor-help" title={`Price from: $${fromToken.price.toFixed(4)}\nPrice to: $${toToken.price.toFixed(4)}`}>
        <Info className="w-4 h-4" />
        <span>Exchange Rate</span>
      </div>
      <div className="font-semibold text-gray-700 dark:text-gray-300">
        1 {fromToken.currency} = {rate.toFixed(4)} {toToken.currency}
      </div>
    </div>
  );
}
