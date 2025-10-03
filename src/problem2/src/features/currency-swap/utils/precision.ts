import type { Token } from '../types';

export function computeOutput(
    fromTokenId: string,
    toTokenId: string,
    amount: number,
    tokens: Token[]
) {
    if (!fromTokenId || !toTokenId || amount <= 0) return 0;
    const fromPrice = tokens.find((t) => t.id === fromTokenId)?.price ?? 0;
    const toPrice = tokens.find((t) => t.id === toTokenId)?.price ?? 0;
    return fromPrice && toPrice ? (amount * fromPrice) / toPrice : 0;
}

export function formatInput(value: string, maxDecimals: number = 18): string {
    // Remove all non-numeric characters except decimal point
    let cleaned = value.replace(/[^0-9.]/g, '');

    // If the input is empty or only contains invalid characters, return empty string
    if (cleaned === '') return '';

    // Limit numerical input to valid format
    // Split by decimal point
    const parts = cleaned.split('.');

    // If there are multiple decimal points, keep only the first one
    if (parts.length > 2) {
        cleaned = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit decimal places
    if (parts.length === 2) {
        const decimalPart = parts[1].substring(0, maxDecimals);
        cleaned = parts[0] + '.' + decimalPart;
    }

    // Remove leading zeros but keep one zero before decimal
    if (cleaned.length > 1 && cleaned[0] === '0' && cleaned[1] !== '.') {
        cleaned = cleaned.substring(1);
    }

    // Ensure the value doesn't start with a decimal point
    if (cleaned.startsWith('.')) {
        cleaned = '0' + cleaned;
    }

    return cleaned;
}
