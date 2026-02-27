export const formatCurrency = (value: number, minDecimals: number = 2, maxDecimals: number = 6): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  }).format(value);
};

export const parseAmount = (value: string): number => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};
