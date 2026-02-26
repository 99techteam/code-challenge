import type { ValidationErrors, ValidationResult } from '../types';

export const validateForm = (
  amount: string,
  fromToken: string,
  toToken: string
): ValidationResult => {
  const errors: ValidationErrors = {};

  const numAmount = Number(amount);
  if (amount === '' || amount == null) {
    errors.amount = 'Please enter an amount';
  } else if (Number.isNaN(numAmount)) {
    errors.amount = 'Amount must be a valid number';
  } else if (numAmount <= 0) {
    errors.amount = 'Amount must be a positive number';
  }

  if (fromToken && toToken && fromToken === toToken) {
    errors.tokens = 'From and To tokens must be different';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const parseAmount = (value: string): number | null => {
  const cleaned = String(value).replace(/[^\d.]/g, '');
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? null : num;
};
