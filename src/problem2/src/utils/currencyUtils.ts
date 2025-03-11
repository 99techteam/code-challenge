export const formatCurrency = (
  amount: number,
  currencyCode: string = "USD"
): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
};

export const formatTokenAmount = (
  amount: number | string,
  decimals: number = 8
): string => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) {
    return "";
  }
  return num.toFixed(decimals);
};

export const calculateExchangeAmount = (
  amount: number,
  fromCurrencyPrice: number | undefined,
  toCurrencyPrice: number | undefined
): string => {
  if (
    fromCurrencyPrice === undefined ||
    toCurrencyPrice === undefined ||
    isNaN(amount)
  ) {
    return "";
  }
  const exchangeRate = fromCurrencyPrice / toCurrencyPrice;
  if (isNaN(exchangeRate)) return "";

  return (amount * exchangeRate).toString();
};
