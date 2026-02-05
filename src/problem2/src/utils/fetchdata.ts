import type { TokenPrice } from '@/@types/type';

// API endpoint for fetching token prices
const PRICES_API_URL = 'https://interview.switcheo.com/prices.json';

// Base URL for token icon images from Switcheo's GitHub repository
const TOKEN_ICON_BASE_URL =
  'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

/**
 * Fetches token prices from the API and returns the latest price for each currency.
 * Filters out duplicate currencies by keeping only the most recent entry based on date.
 *
 * @returns Promise<TokenPrice[]> Array of unique tokens with their latest prices
 * @throws Error if the API request fails
 */
export async function fetchPrices(): Promise<TokenPrice[]> {
  // Fetch data from the API
  const response = await fetch(PRICES_API_URL);

  // Check if the request was successful
  if (!response.ok) {
    throw new Error('Failed to fetch token prices');
  }

  // Parse the JSON response
  const data: TokenPrice[] = await response.json();

  // Deduplicate currencies by keeping only the latest entry for each currency
  const pricesData: TokenPrice[] = Object.values(
    data.reduce((acc: Record<string, TokenPrice>, item: TokenPrice) => {
      const existing = acc[item.currency];
      const currentDate = new Date(item.date);

      // Only update if this is the first occurrence or if the current date is more recent
      if (!existing || currentDate > new Date(existing.date)) {
        acc[item.currency] = {
          currency: item.currency,
          date: item.date,
          icon: getTokenIconUrl(item.currency),
          price: parseFloat(String(item.price)),
        };
      }
      return acc;
    }, {}),
  );
  return Object.values(pricesData);
}

/**
 * Generates the URL for a token's icon image.
 * Icons are fetched from Switcheo's GitHub token-icons repository.
 *
 * @param currency The currency symbol (e.g., 'ETH', 'USDC')
 * @returns The full URL to the token's SVG icon
 */
export function getTokenIconUrl(currency: string) {
  return `${TOKEN_ICON_BASE_URL}/${currency}.svg`;
}
