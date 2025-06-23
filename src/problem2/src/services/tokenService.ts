import axios from "axios";
import type { Token } from "../types";
import { env } from "../config/env";

// Use environment variables instead of hardcoded values
const PRICES_URL = env.pricesUrl;
const TOKEN_ICON_BASE_URL = env.tokenIconBaseUrl;
const TOKEN_CACHE_KEY = env.tokenCacheKey;
const CACHE_DURATION = env.cacheDurationMs;
const API_TIMEOUT = env.apiTimeoutMs;

export const fetchTokenPrices = async (): Promise<Token[]> => {
  // Check cache first
  const cached = localStorage.getItem(TOKEN_CACHE_KEY);
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log('Using cached token prices');
        return data;
      }
    } catch (error) {
      console.warn('Invalid cache data, fetching fresh data');
      localStorage.removeItem(TOKEN_CACHE_KEY);
    }
  }

  try {
    console.log(`Fetching token prices from: ${PRICES_URL}`);
    const response = await axios.get<Token[]>(PRICES_URL, {
      timeout: API_TIMEOUT,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    // Validate response data
    if (!Array.isArray(response.data)) {
      throw new Error('Invalid response format: expected array');
    }
    
    // Cache the response
    const cacheData = {
      data: response.data,
      timestamp: Date.now(),
    };
    
    try {
      localStorage.setItem(TOKEN_CACHE_KEY, JSON.stringify(cacheData));
      console.log('Token prices cached successfully');
    } catch (cacheError) {
      console.warn('Failed to cache token prices:', cacheError);
    }
    
    return response.data;
  } catch (error) {
    console.error("Error fetching token prices:", error);
    
    // Return cached data if available, even if expired
    const cached = localStorage.getItem(TOKEN_CACHE_KEY);
    if (cached) {
      try {
        const { data } = JSON.parse(cached);
        console.log('Using expired cache as fallback');
        return data;
      } catch (parseError) {
        console.error('Failed to parse cached data:', parseError);
      }
    }
    
    return [];
  }
};

export const getTokenIconUrl = (currency: string): string => {
  if (!currency) return "https://via.placeholder.com/24";
  return `${TOKEN_ICON_BASE_URL}/${currency}.svg`;
};

export const calculateExchangeRate = (
  fromToken: Token,
  toToken: Token
): number => {
  if (!fromToken?.price || !toToken?.price || fromToken.price <= 0 || toToken.price <= 0) {
    return 0;
  }
  return fromToken.price / toToken.price;
};

// Utility function to clear cache
export const clearTokenCache = (): void => {
  localStorage.removeItem(TOKEN_CACHE_KEY);
  console.log('Token cache cleared');
};

// Utility function to get cache info
export const getCacheInfo = () => {
  const cached = localStorage.getItem(TOKEN_CACHE_KEY);
  if (!cached) return null;
  
  try {
    const { timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;
    const isExpired = age > CACHE_DURATION;
    
    return {
      age,
      isExpired,
      expiresIn: isExpired ? 0 : CACHE_DURATION - age,
    };
  } catch {
    return null;
  }
};
