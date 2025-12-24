/**
 * Sanitize numeric input for Amount fields
 * - Remove non-numeric characters except decimal point
 * - Remove leading zeros (but keep "0" and decimals like "0.5")
 * - Return sanitized string
 */
export function sanitizeNumericInput(value: string): string {
  if (!value) return "0";

  // Remove all characters except digits and dot
  let sanitized = value.replace(/[^0-9.]/g, "");

  // Only keep first decimal point
  const parts = sanitized.split(".");
  if (parts.length > 2) {
    sanitized = parts[0] + "." + parts.slice(1).join("");
  }

  // Remove leading zeros before first digit (except single "0" or decimal like "0.5")
  sanitized = sanitized.replace(/^0+(?=\d)/, "");

  // Default to "0" if empty
  if (sanitized === "") sanitized = "0";

  return sanitized;
}
