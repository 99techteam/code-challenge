import type { TokenPrice, Token } from '../types';

const API_URL = 'https://interview.switcheo.com/prices.json';
const TOKEN_ICON_BASE_URL = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

/**
 * Fetch token prices from API and process them
 */
export async function fetchTokenPrices(): Promise<Token[]> {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch token prices');
        }

        const data: TokenPrice[] = await response.json();

        // Group by currency and take the latest price
        const tokenMap = new Map<string, TokenPrice>();

        data.forEach(item => {
            const existing = tokenMap.get(item.currency);
            if (!existing || new Date(item.date) > new Date(existing.date)) {
                tokenMap.set(item.currency, item);
            }
        });

        // Convert to Token array and filter out tokens without prices
        const tokens: Token[] = Array.from(tokenMap.values())
            .filter(item => item.price && item.price > 0)
            .map(item => ({
                symbol: item.currency,
                price: item.price,
                iconUrl: `${TOKEN_ICON_BASE_URL}/${item.currency}.svg`
            }))
            .sort((a, b) => a.symbol.localeCompare(b.symbol));

        return tokens;
    } catch (error) {
        console.error('Error fetching token prices:', error);
        throw error;
    }
}

/**
 * Calculate exchange rate between two tokens
 */
export function calculateExchangeRate(fromToken: Token, toToken: Token): number {
    if (!fromToken || !toToken || fromToken.price === 0) {
        return 0;
    }
    return fromToken.price / toToken.price;
}

/**
 * Convert amount from one token to another
 */
export function convertAmount(
    amount: number,
    fromToken: Token,
    toToken: Token
): number {
    const rate = calculateExchangeRate(fromToken, toToken);
    return amount * rate;
}

/**
 * Format number with appropriate decimal places
 */
export function formatNumber(value: number, maxDecimals: number = 6): string {
    if (value === 0) return '0';

    // For very small numbers, use more decimals
    if (value < 0.01) {
        return value.toFixed(8);
    }

    // For normal numbers, use up to maxDecimals
    const formatted = value.toFixed(maxDecimals);

    // Remove trailing zeros
    return formatted.replace(/\.?0+$/, '');
}
