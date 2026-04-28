import type { TokenPrice } from '@/types';
import { apiGet } from './client';
import { MOCK_TOKEN_PRICES } from './mockData';

/**
 * Fetches token price data from the Switcheo API.
 * Falls back to mock data if the API call fails (e.g., CORS restrictions).
 */
export async function fetchTokenPrices(): Promise<TokenPrice[]> {
  try {
    return await apiGet<TokenPrice[]>('/prices.json');
  } catch (error) {
    console.warn(
      '[fetchTokenPrices] API call failed, using mock data as fallback.',
      error instanceof Error ? error.message : error,
    );
    return MOCK_TOKEN_PRICES;
  }
}
