/**
 * Formats a number to display with maximum 12 digits total (including decimals)
 * @param value - The number to format
 * @param maxDigits - Maximum total digits to display (default: 12)
 * @returns Formatted string
 */
export const formatNumberWithMaxDigits = (value: number, maxDigits: number = 12): string => {
  if (value === 0) return "0";
  if (!isFinite(value)) return "∞";
  
  const absValue = Math.abs(value);
  
  // Handle very small numbers
  if (absValue < 0.000001 && absValue > 0) {
    return value.toExponential(Math.max(2, maxDigits - 4));
  }
  
  // Handle very large numbers - use scientific notation if integer part exceeds maxDigits
  const integerPart = Math.floor(absValue);
  const integerDigits = integerPart.toString().length;
  
  // If the integer part has more digits than our limit, use scientific notation
  if (integerDigits > maxDigits) {
    const exponent = integerDigits - 1;
    const mantissa = value / Math.pow(10, exponent);
    const mantissaDigits = maxDigits - exponent.toString().length - 2; // Reserve space for "e+" or "e-"
    
    return mantissa.toExponential(Math.max(1, mantissaDigits));
  }
  
  // For numbers that fit within our digit limit
  if (integerDigits >= maxDigits) {
    // Show integer only if it exactly fits
    return Math.round(value).toLocaleString();
  }
  
  // Calculate remaining digits for decimal places
  const remainingDigits = maxDigits - integerDigits;
  const decimalPlaces = Math.min(remainingDigits, 8);
  
  return value.toLocaleString(undefined, {
    maximumFractionDigits: decimalPlaces,
    minimumFractionDigits: 0,
  });
};

/**
 * Alternative: Format with compact notation (K, M, B, T, etc.)
 * @param value - The number to format
 * @param maxDigits - Maximum digits before switching to compact notation
 * @returns Formatted string with suffix
 */
export const formatNumberCompact = (value: number, maxDigits: number = 12): string => {
  if (value === 0) return "0";
  if (!isFinite(value)) return "∞";
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  
  // Define suffixes for large numbers
  const suffixes = [
    { value: 1e42, suffix: "Td" }, // Tredecillion
    { value: 1e39, suffix: "Dd" }, // Duodecillion  
    { value: 1e36, suffix: "Ud" }, // Undecillion
    { value: 1e33, suffix: "Dc" }, // Decillion
    { value: 1e30, suffix: "N" },  // Nonillion
    { value: 1e27, suffix: "O" },  // Octillion
    { value: 1e24, suffix: "Sp" }, // Septillion
    { value: 1e21, suffix: "Sx" }, // Sextillion
    { value: 1e18, suffix: "Qi" }, // Quintillion
    { value: 1e15, suffix: "Q" },  // Quadrillion
    { value: 1e12, suffix: "T" },  // Trillion
    { value: 1e9,  suffix: "B" },  // Billion
    { value: 1e6,  suffix: "M" },  // Million
    { value: 1e3,  suffix: "K" },  // Thousand
  ];
  
  // Check if we need compact notation
  const integerDigits = Math.floor(absValue).toString().length;
  
  if (integerDigits <= maxDigits) {
    // Use regular formatting for smaller numbers
    return formatNumberWithMaxDigits(value, maxDigits);
  }
  
  // Find appropriate suffix
  for (const { value: threshold, suffix } of suffixes) {
    if (absValue >= threshold) {
      const scaledValue = absValue / threshold;
      const availableDigits = maxDigits - suffix.length;
      
      if (scaledValue >= 1000) {
        // If scaled value is still too large, continue to next suffix
        continue;
      }
      
      const decimalPlaces = Math.max(0, availableDigits - Math.floor(scaledValue).toString().length);
      const formatted = scaledValue.toFixed(Math.min(decimalPlaces, 2));
      
      return `${sign}${formatted}${suffix}`;
    }
  }
  
  // Fallback to scientific notation for extremely large numbers
  return value.toExponential(2);
};

/**
 * Formats currency amount for display
 * @param amount - The amount to format
 * @param currency - The currency symbol (optional)
 * @returns Formatted string
 */
export const formatCurrencyAmount = (amount: number, currency?: string): string => {
  const formattedAmount = formatNumberWithMaxDigits(amount);
  return currency ? `${formattedAmount} ${currency}` : formattedAmount;
};
