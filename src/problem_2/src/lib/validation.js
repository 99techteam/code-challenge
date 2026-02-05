/**
 * Validation utilities for form inputs
 */

/**
 * Validate if a value is a positive number
 * @param {string|number} value - Value to validate
 * @returns {boolean} True if valid positive number
 */
export function isValidPositiveNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return false;
  }
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num > 0 && isFinite(num);
}

/**
 * Validate if a value is a non-negative number
 * @param {string|number} value - Value to validate
 * @returns {boolean} True if valid non-negative number
 */
export function isValidNonNegativeNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return false;
  }
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num >= 0 && isFinite(num);
}

/**
 * Format number to display with appropriate decimal places
 * @param {number|string} value - Number to format
 * @param {number} decimals - Number of decimal places (default: 6)
 * @returns {string} Formatted number string
 */
export function formatNumber(value, decimals = 6) {
  // Handle null, undefined, empty string, or invalid values
  if (value === null || value === undefined || value === '') {
    return '0';
  }
  
  // Convert to number if it's a string
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  
  // Check if conversion resulted in a valid number
  if (isNaN(num) || !isFinite(num)) {
    return '0';
  }
  
  // Handle zero
  if (num === 0) {
    return '0';
  }
  
  // Handle very small numbers
  if (Math.abs(num) < 0.000001) {
    return num.toExponential(2);
  }
  
  // Format the number
  return parseFloat(num.toFixed(decimals)).toString();
}
