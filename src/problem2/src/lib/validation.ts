import type { SwapState, ValidationResult, ValidationErrors } from "../types";

const MAX_AMOUNT = 1e15;

export function validate(state: SwapState): ValidationResult {
  const errors: ValidationErrors = {};

  if (!state.fromToken) {
    errors.fromToken = "Select a token to swap from";
  }
  if (!state.toToken) {
    errors.toToken = "Select a token to receive";
  }
  if (
    state.fromToken &&
    state.toToken &&
    state.fromToken.symbol === state.toToken.symbol
  ) {
    errors.pair = "Cannot swap a token for itself";
  }

  // The "driving" amount is whichever side the user last typed in
  const driverRaw =
    state.lastEdited === "from" ? state.fromAmount : state.toAmount;
  const driverNum = parseFloat(driverRaw);

  if (
    driverRaw.trim() === "" ||
    !Number.isFinite(driverNum) ||
    driverNum <= 0
  ) {
    errors.fromAmount = "Enter an amount greater than 0";
  } else if (driverNum > MAX_AMOUNT) {
    errors.fromAmount = "Amount is too large";
  }

  // firstError follows display priority: pair > tokens > amount
  const order: (keyof ValidationErrors)[] = [
    "pair",
    "fromToken",
    "toToken",
    "fromAmount",
  ];
  const firstKey = order.find((k) => errors[k]);
  const firstError = firstKey ? errors[firstKey]! : null;

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    firstError,
  };
}
