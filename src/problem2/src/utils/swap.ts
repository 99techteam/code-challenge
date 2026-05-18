export const calculateConversion = (
  fromAmount: string, 
  fromPrice: number, 
  toPrice: number
): string => {
  if (!fromAmount || isNaN(Number(fromAmount)) || !fromPrice || !toPrice) {
    return '';
  }
  const converted = (Number(fromAmount) * fromPrice) / toPrice;
  return converted.toFixed(2);
};

export const formatToTwoDecimals = (val: string): string => {
  if (!val || isNaN(Number(val))) return '';
  return Number(val).toFixed(2);
};

export const validateInput = (val: string): boolean => {
  return val === '' || /^\d*\.?\d{0,2}$/.test(val);
};
