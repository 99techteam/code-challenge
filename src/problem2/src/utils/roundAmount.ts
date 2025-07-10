export const roundAmount = (amount: number): string => {
  return parseFloat(amount.toFixed(10)).toString();
};
