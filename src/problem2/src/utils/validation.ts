import { VALIDATION } from "../constants";

export const isValidDecimalInput = (value: string): boolean => {
  return value === "" || /^\d*\.?\d*$/.test(value);
};

export const isValidSwapAmount = (amount: string): boolean => {
  if (!amount) return false;
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount > VALIDATION.MIN_AMOUNT;
};

export const areTokensDifferent = (tokenA: string, tokenB: string): boolean => {
  return tokenA !== tokenB;
};

export const formatAmount = (
  value: number,
  decimals: number = VALIDATION.AMOUNT_DECIMALS,
): string => {
  return value.toFixed(decimals);
};
