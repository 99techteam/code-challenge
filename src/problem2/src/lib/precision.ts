/**
 * Precision utilities for cryptocurrency calculations using bignumber.js
 * Ensures no precision loss in financial calculations
 */

import BigNumber from 'bignumber.js';

// Configure BigNumber for cryptocurrency use
BigNumber.config({
  DECIMAL_PLACES: 30,                     // Maximum decimal places
  ROUNDING_MODE: BigNumber.ROUND_DOWN,    // Always round down for crypto
  EXPONENTIAL_AT: [-30, 30],              // Avoid scientific notation
  CRYPTO: true                            // Use cryptographically secure random
});

// Default decimals for unknown tokens
export const DEFAULT_DECIMALS = 18;

/**
 * Calculate exchange amount with precise arithmetic
 * @param fromAmount Amount string in user-readable format
 * @param fromPrice Price of from token
 * @param toPrice Price of to token
 * @returns Amount string in user-readable format of to token
 */
export function calculateExchangeAmount(
  fromAmount: string,
  fromPrice: number,
  toPrice: number,
): string {
  if (!fromAmount || fromAmount === '0' || toPrice === 0) return '0';
  
  try {
    // Use BigNumber for all calculations
    const amount = new BigNumber(fromAmount);
    const fromPriceBN = new BigNumber(fromPrice);
    const toPriceBN = new BigNumber(toPrice);
    
    // Calculate: (amount * fromPrice) / toPrice
    const result = amount.multipliedBy(fromPriceBN).dividedBy(toPriceBN);
    
    // Return with appropriate precision
    return result.toFixed();
  } catch {
    return '0';
  }
}

/**
 * Calculate exchange rate between two tokens
 * @param fromPrice Price of from token
 * @param toPrice Price of to token
 * @returns Exchange rate as string
 */
export function calculateExchangeRate(fromPrice: number, toPrice: number): string {
  if (toPrice === 0) return '0';
  
  try {
    const fromPriceBN = new BigNumber(fromPrice);
    const toPriceBN = new BigNumber(toPrice);
    
    return fromPriceBN.dividedBy(toPriceBN).toFixed();
  } catch {
    return '0';
  }
}

/**
 * Validate amount string for a specific token
 * @param amount Amount string to validate
 * @param decimals Maximum decimal places allowed
 * @returns Validation result
 */
export function validateAmount(amount: string, decimals: number): {
  isValid: boolean;
  error?: string;
} {
  if (!amount || amount === '') {
    return { isValid: true };
  }
  
  // Check for valid number format
  if (!/^\d*\.?\d*$/.test(amount)) {
    return { isValid: false, error: 'Invalid number format' };
  }
  
  // Check for multiple decimal points
  const parts = amount.split('.');
  if (parts.length > 2) {
    return { isValid: false, error: 'Multiple decimal points' };
  }
  
  // Check decimal places
  if (parts[1] && parts[1].length > decimals) {
    return { isValid: false, error: `Maximum ${decimals} decimal places allowed` };
  }
  
  // Check if it's a valid BigNumber
  try {
    const bn = new BigNumber(amount);
    if (bn.isNaN() || !bn.isFinite()) {
      return { isValid: false, error: 'Invalid number' };
    }
    
    // Check for reasonable value (prevent overflow)
    // Max supply of Bitcoin is 21 million, so 1e12 is a reasonable upper limit for any token
    if (bn.isGreaterThan('1e12')) {
      return { isValid: false, error: 'Amount too large' };
    }
    
    if (bn.isNegative()) {
      return { isValid: false, error: 'Amount cannot be negative' };
    }
  } catch {
    return { isValid: false, error: 'Invalid amount' };
  }
  
  return { isValid: true };
}

/**
 * Sanitize user input for amount fields
 * @param input Raw user input
 * @param decimals Maximum decimal places allowed
 * @returns Sanitized input string
 */
export function sanitizeAmountInput(
  input: string,
  decimals: number
): string {
  // Remove any non-numeric characters except decimal point
  let sanitized = input.replace(/[^0-9.]/g, '');
  
  // Handle empty string
  if (sanitized === '') return '';
  
  // Prevent multiple decimal points
  const decimalCount = (sanitized.match(/\./g) || []).length;
  if (decimalCount > 1) {
    // Keep only the first decimal point
    const firstDecimalIndex = sanitized.indexOf('.');
    sanitized = sanitized.substring(0, firstDecimalIndex + 1) + 
                sanitized.substring(firstDecimalIndex + 1).replace(/\./g, '');
  }
  
  // Limit decimal places
  const parts = sanitized.split('.');
  if (parts[1] && parts[1].length > decimals) {
    sanitized = parts[0] + '.' + parts[1].substring(0, decimals);
  }
  
  // Prevent leading zeros (except for "0." pattern)
  if (sanitized.length > 1 && sanitized[0] === '0' && sanitized[1] !== '.') {
    sanitized = sanitized.substring(1);
  }
  
  return sanitized;
}

/**
 * Format amount for display with proper precision
 * @param amount Amount string
 * @param displayDecimals Maximum decimals to display (optional)
 * @returns Formatted string
 */
export function formatAmountForDisplay(
  amount: string,
  displayDecimals?: number
): string {
  if (!amount || amount === '') return '0';
  
  try {
    const bn = new BigNumber(amount);
    if (bn.isNaN() || !bn.isFinite()) return '0';
    
    if (displayDecimals !== undefined) {
      return bn.toFixed(displayDecimals);
    }
    
    // Remove trailing zeros
    return bn.toFixed();
  } catch {
    return '0';
  }
}

