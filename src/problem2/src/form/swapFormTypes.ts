import type { FormErrors, ValidateForm } from "./formTypes";

export type SwapFormValues = {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
};

/** Convenience alias shared with callers (e.g. App). */
export type FormValues = SwapFormValues;

/** True when live form matches a prior successful-submit snapshot (all four fields compared as strings). */
export function doSwapValuesMatchSnapshot(a: FormValues, b: FormValues): boolean {
  return (
    a.fromToken === b.fromToken &&
    a.toToken === b.toToken &&
    a.fromAmount === b.fromAmount &&
    a.toAmount === b.toAmount
  );
}

export type SwapFormErrors = FormErrors<SwapFormValues>;

export type ValidateSwapForm = ValidateForm<SwapFormValues>;
