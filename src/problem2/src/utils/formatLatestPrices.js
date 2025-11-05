export const formatLatestPrices = (data) => {
  const latestCurrencyMap = {};

  data.forEach((item) => {
    const currency = item.currency;
    const date = new Date(item.date).getTime();
    if (
      !latestCurrencyMap[currency] ||
      date > new Date(latestCurrencyMap[currency].date).getTime()
    ) {
      latestCurrencyMap[currency] = item;
    }
  });

  return Object.values(latestCurrencyMap);
};
