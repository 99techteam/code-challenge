/**
 * API utilities for fetching token prices
 */

const PRICES_API_URL = 'https://interview.switcheo.com/prices.json';
const TOKEN_ICON_BASE_URL = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

/**
 * Fetch token prices from the API
 * @returns {Promise<Object>} Object with token symbols as keys and prices as values
 */
export async function fetchTokenPrices() {
  try {
    const response = await fetch(PRICES_API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch token prices');
    }
    const data = await response.json();
    
    // The API returns an array of objects: [{currency, date, price}, ...]
    // Convert to object format: { "BLUR": 0.208, "ETH": 1645.93, ... }
    // If a currency appears multiple times, use the latest one (by date)
    const pricesMap = {};
    
    data.forEach(item => {
      const currency = item.currency;
      const price = item.price;
      const date = new Date(item.date);
      
      // If currency doesn't exist or this entry is newer, update it
      if (!pricesMap[currency] || new Date(pricesMap[currency].date) < date) {
        pricesMap[currency] = {
          price: price,
          date: date
        };
      }
    });
    
    // Convert to simple object with just prices
    const prices = {};
    Object.keys(pricesMap).forEach(currency => {
      prices[currency] = pricesMap[currency].price;
    });
    
    return prices;
  } catch (error) {
    console.error('Error fetching token prices:', error);
    throw error;
  }
}

/**
 * Get token icon URL
 * @param {string} tokenSymbol - Token symbol (e.g., 'SWTH', 'BTC')
 * @returns {string} URL to the token icon SVG
 */
export function getTokenIconUrl(tokenSymbol) {
  return `${TOKEN_ICON_BASE_URL}/${tokenSymbol}.svg`;
}

/**
 * Calculate exchange rate between two tokens
 * @param {number|string} fromPrice - Price of the source token
 * @param {number|string} toPrice - Price of the destination token
 * @returns {number} Exchange rate
 */
export function calculateExchangeRate(fromPrice, toPrice) {
  // Convert to numbers if they're strings
  const from = typeof fromPrice === 'string' ? parseFloat(fromPrice) : Number(fromPrice);
  const to = typeof toPrice === 'string' ? parseFloat(toPrice) : Number(toPrice);
  
  if (!from || !to || isNaN(from) || isNaN(to) || to === 0) {
    return 0;
  }
  return from / to;
}

/**
 * Calculate the output amount based on input amount and exchange rate
 * @param {number} inputAmount - Amount to swap
 * @param {number} exchangeRate - Exchange rate between tokens
 * @returns {number} Output amount
 */
export function calculateOutputAmount(inputAmount, exchangeRate) {
  if (!inputAmount || inputAmount <= 0 || !exchangeRate) {
    return 0;
  }
  return inputAmount * exchangeRate;
}
