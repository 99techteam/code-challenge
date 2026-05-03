import { VALIDATION } from './constants';

export const normalizeAmount = (value: string): number | null => {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  // Remove leading zeros but keep "0" or "0.xxx"
  const normalizedValue = value.replace(/^0+(?=\d)/, '');

  const parsedValue = Number.parseFloat(normalizedValue);

  // Check if valid number
  if (Number.isNaN(parsedValue)) {
    return null;
  }

  // Check negative
  if (parsedValue < VALIDATION.MIN_AMOUNT) {
    return VALIDATION.MIN_AMOUNT;
  }

  // Check max limit
  if (parsedValue > VALIDATION.MAX_AMOUNT) {
    return VALIDATION.MAX_AMOUNT;
  }

  return parsedValue;
};

export const formatAmount = (amount: number | null, decimals: number = VALIDATION.MAX_DECIMAL_PLACES): string => {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return '';
  }

  // Round to specified decimal places
  const factor = Math.pow(10, decimals);
  const rounded = Math.round(amount * factor) / factor;
  
  return rounded.toString();
};

export const isValidAmount = (amount: number | null): boolean => {
  if (amount === null || amount === undefined) return false;
  if (Number.isNaN(amount)) return false;
  if (amount < VALIDATION.MIN_AMOUNT) return false;
  if (amount > VALIDATION.MAX_AMOUNT) return false;
  return true;
};
