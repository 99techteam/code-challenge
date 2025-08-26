import axios from "axios";
import { config } from "../configs/config.js";

// Cached data
let cachedPrices = null;
let lastFetchTime = null;

// Function to start automatic cache refresh
const startAutoRefresh = () => {
  setInterval(async () => {
    const now = Date.now();
    if (!lastFetchTime || now - lastFetchTime > config.refreshInterval) {
      await fetchPrices();
    }
  }, config.refreshInterval);
};

export const fetchPrices = async () => {
  const now = Date.now();
  if (!lastFetchTime || now - lastFetchTime > config.cacheDuration) {
    try {
      const response = await axios.get(config.pricesUrl);
      cachedPrices = response.data;
      lastFetchTime = now;
      console.log(`Price data updated at ${new Date().toISOString()}`);
    } catch (error) {
      console.error("Error fetching prices:", error);
      throw new Error("Unable to load price data.");
    }
  }
  return cachedPrices;
};

const processPriceData = (prices, currency) => {
  const currencyData = prices.filter((item) => item.currency === currency);
  if (currencyData.length === 0) return null;

  currencyData.sort((a, b) => new Date(b.date) - new Date(a.date));

  const latestEntry = currencyData[0];
  const latestDate = latestEntry.date;

  const sameDateEntries = currencyData.filter(
    (item) => item.date === latestDate
  );

  if (sameDateEntries.length > 1) {
    // If multiple entries on the same date, calculate average price
    const averagePrice =
      sameDateEntries.reduce((sum, item) => sum + item.price, 0) /
      sameDateEntries.length;
    return { price: averagePrice, date: latestDate };
  }

  return { price: latestEntry.price, date: latestEntry.date };
};

export const getExchangeRate = async (from, to) => {
  const prices = await fetchPrices();
  const fromData = processPriceData(prices, from);
  const toData = processPriceData(prices, to);

  if (!fromData || !toData) {
    throw new Error("One or both currencies do not exist");
  }

  // Use the latest timestamp between from and to
  const timestamp = new Date(
    Math.max(new Date(fromData.date), new Date(toData.date))
  ).toISOString();

  return {
    fromPrice: fromData.price,
    toPrice: toData.price,
    timestamp,
  };
};

export const getUniqueCurrencies = async () => {
  const prices = await fetchPrices();
  return [...new Set(prices.map((item) => item.currency))].sort();
};

// Start auto refresh when module is imported
startAutoRefresh();
