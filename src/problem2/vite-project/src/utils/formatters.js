export const formatters = {
  formatPrice(price, decimals = 6) {
    return parseFloat(price).toFixed(decimals);
  },

  formatPriceImpact(impact) {
    return impact < 0.01 ? "< 0.01%" : `${impact.toFixed(2)}%`;
  },
};
