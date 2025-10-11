export const tokenApi = {
  async fetchPrices() {
    try {
      const response = await fetch(
        "https://interview.switcheo.com/prices.json"
      );
      const data = await response.json();

      const priceMap = {};
      data.forEach((item) => {
        const existing = priceMap[item.currency];
        if (!existing || new Date(item.date) > new Date(existing.date)) {
          priceMap[item.currency] = item;
        }
      });

      return Object.values(priceMap)
        .map((item) => ({
          symbol: item.currency,
          name: item.currency,
          price: item.price,
        }))
        .sort((a, b) => b.price - a.price);
    } catch (error) {
      console.error("Error fetching prices:", error);
      throw error;
    }
  },
};
