export const swapCalculator = {
  calculateOutput(fromAmount, fromPrice, toPrice) {
    if (!fromAmount || !fromPrice || !toPrice) return 0;
    return (fromAmount * fromPrice) / toPrice;
  },

  calculateExchangeRate(fromPrice, toPrice) {
    if (!fromPrice || !toPrice) return 0;
    return fromPrice / toPrice;
  },

  calculatePriceImpact(fromAmount, fromPrice) {
    const tradeValueUSD = fromAmount * fromPrice;
    let priceImpact = (tradeValueUSD / 10000) * 100;
    return Math.min(priceImpact, 15);
  },

  getPriceImpactColor(priceImpact) {
    if (priceImpact > 10) return "#ff4d4f";
    if (priceImpact > 5) return "#faad14";
    return "#52c41a";
  },
};
