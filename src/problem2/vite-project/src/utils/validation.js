export const validators = {
  isValidAmount(value) {
    const amount = parseFloat(value);
    if (isNaN(amount))
      return { valid: false, error: "Please enter a valid number" };
    if (amount <= 0)
      return { valid: false, error: "Amount must be greater than 0" };
    if (amount > 100) return { valid: false, error: "Insufficient balance" };
    return { valid: true, error: null };
  },

  sanitizeNumericInput(value) {
    let sanitized = value.replace(/[^0-9.]/g, "");
    const parts = sanitized.split(".");
    if (parts.length > 2) {
      sanitized = parts[0] + "." + parts.slice(1).join("");
    }
    return sanitized;
  },
};
