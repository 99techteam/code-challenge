/**
 * WalletRow Component
 * Displays a single wallet balance row with accessibility features
 */

import React from 'react';
import type { FormattedWalletBalance } from '../types';

interface WalletRowProps {
  balance: FormattedWalletBalance;
  usdValue: number;
}

/**
 * Formats USD value for display
 */
const formatUSDValue = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * WalletRow component - displays a single balance row
 * WCAG compliant with proper ARIA labels and semantic HTML
 */
export const WalletRow: React.FC<WalletRowProps> = ({ balance, usdValue }) => {
  const formattedUSD = formatUSDValue(usdValue);

  return (
    <div
      className='wallet-row'
      role='row'
      aria-label={`Balance for ${balance.currency}`}
    >
      <div className='wallet-cell-start' role='gridcell'>
        <span
          className='wallet-currency'
          aria-label={`Currency: ${balance.currency}`}
        >
          {balance.currency}
        </span>
        <span
          className='wallet-amount'
          aria-label={`Amount: ${balance.formatted}`}
        >
          {balance.formatted}
        </span>
      </div>
      <div className='wallet-cell-end' role='gridcell'>
        <span
          className='wallet-usd-value'
          aria-label={`USD Value: ${formattedUSD}`}
        >
          {formattedUSD}
        </span>
        <span
          className='wallet-formatted-amount'
          aria-label={`Blockchain: ${balance.blockchain}`}
        >
          {balance.blockchain}
        </span>
      </div>
    </div>
  );
};
