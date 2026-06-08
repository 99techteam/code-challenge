import type { Currency } from '@/types/currency';

/**
 * Format text to return the number text value
 * @param value - the text
 * @returns - formatted number
 */
export function sanitizeNumericInput(value: string): string {
  let val = value.replace(/[^0-9.]/g, '');

  const dotIndex = val.indexOf('.');
  if (dotIndex !== -1) {
    val = val.slice(0, dotIndex + 1) + val.slice(dotIndex + 1).replace(/\./g, '');
  }

  val = val.replace(/^0+(\d)/, '$1');

  const [intPart, decPart] = val.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
}

/**
 * Filter the currency list to create new list has unique currency name
 * If many currency has the same name, takes the one having the latest edit.
 * @param data - currency list - the list has duplicated currency name
 * @returns - the currency list with unique name
 */
export function sanitizeCurrencies(data: Currency[]): Currency[] {
  const map = new Map<string, Currency>();
  for (const item of data) {
    const existing = map.get(item.currency);
    if (!existing || new Date(item.date) > new Date(existing.date)) {
      map.set(item.currency, item);
    }
  }
  return Array.from(map.values());
}

/**
 * Computes the converted amount between two currencies using their USD prices.
 * Formula: amount × (sourcePrice / destinationPrice)
 * @param amount - The input amount to convert
 * @param sourcePrice - The USD price of the source currency
 * @param destinationPrice - The USD price of the destination currency
 * @returns Formatted converted amount string, or empty string if any value is invalid
 */
export function computeAmount(
  amount: number,
  sourcePrice: number,
  destinationPrice: number
): string {
  if (amount <= 0 || sourcePrice <= 0 || destinationPrice <= 0) return '';
  return sanitizeNumericInput(
    parseFloat((amount * (sourcePrice / destinationPrice)).toFixed(8)).toString()
  );
}
