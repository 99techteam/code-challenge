import { parseAmount } from "./format"

export type AmountValidation = {
  /** Parsed numeric value (NaN if unparseable). */
  parsed: number
  /** Human-readable error, or null when the amount is valid. */
  error: string | null
}

/**
 * Validates a user-entered amount string and returns the parsed number and
 * a specific error message tailored to each failure mode.
 *
 * Order matters: we want negatives reported as negatives (not as "not a
 * number") so users get an actionable hint.
 */
export function validateAmount(raw: string): AmountValidation {
  const trimmed = raw.trim()

  if (!trimmed) {
    return { parsed: NaN, error: "Enter an amount" }
  }

  // Explicit negative-number detection so the error is precise even though
  // the input filter normally prevents typing a `-` character.
  if (trimmed.startsWith("-")) {
    return { parsed: NaN, error: "Amount must be a positive number" }
  }

  const parsed = parseAmount(trimmed)

  if (Number.isNaN(parsed)) {
    return { parsed, error: "Amount must be a number" }
  }

  if (parsed < 0) {
    return { parsed, error: "Amount must be a positive number" }
  }

  if (parsed <= 0) {
    return { parsed, error: "Amount must be greater than 0" }
  }

  return { parsed, error: null }
}

/**
 * Allow only digits, optionally followed by a single decimal point and more
 * digits. Used to filter input as the user types so invalid characters never
 * reach state. Matches the empty string (so users can clear the field).
 */
const DECIMAL_INPUT_PATTERN = /^\d*\.?\d*$/

/**
 * Returns the next safe value for the amount input, rejecting anything that
 * isn't a partial decimal number. If the new value is invalid the previous
 * value is preserved so React doesn't accept the rejected keystroke.
 */
export function sanitizeAmountInput(next: string, previous: string): string {
  // Normalise an empty/whitespace value to "".
  if (!next) return ""

  // Accept comma as a decimal separator on locales where the keyboard inserts
  // one — convert to a dot before validation.
  const normalised = next.replace(",", ".")

  if (!DECIMAL_INPUT_PATTERN.test(normalised)) {
    return previous
  }

  return normalised
}
