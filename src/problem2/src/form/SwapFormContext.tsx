import { createFormContext } from "./createFormContext";
import type { SwapFormValues } from "./swapFormTypes";

const swapForm = createFormContext<SwapFormValues>();

/** Swap-token form instance of the generic form context API. */
export const SwapFormProvider = swapForm.FormProvider;

export const useSwapForm = swapForm.useForm;

export const useSwapFormField = swapForm.useFormField;

export { createFormContext } from "./createFormContext";
export type { FormErrors, ValidateForm } from "./formTypes";
