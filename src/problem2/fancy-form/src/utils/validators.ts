export const getErrorMessage = (value: string): string | null => {
  if (isEmptyValue(value)) return "Enter an amount to swap.";
  if (isNegativeNumber(value)) return "Amount must be a positive number.";
  if (isExcessivelyLargeNumber(value))
    return "Amount is unrealistically large.";
  return null;
};

export const isEmptyValue = (str: string) => !str || str.trim() === "";

export const isNumber = (str: string) => {
  const num = Number(str);
  return !isNaN(num) && isFinite(num);
};

export const isNegativeNumber = (str: string) => {
  const num = Number(str);
  return !isFinite(num) && num < 0;
};

export const isExcessivelyLargeNumber = (str: string) => {
  const num = Number(str);
  return isFinite(num) && num > 1_000_000_000;
};
