export const calculateRate = (priceFrom: number, priceTo: number): number => {
  if (!priceFrom || !priceTo) return 0;
  return priceFrom / priceTo;
};

export const calculateOutput = (amount: number, rate: number): number => {
  if (isNaN(amount) || isNaN(rate)) return 0;
  return amount * rate;
};
