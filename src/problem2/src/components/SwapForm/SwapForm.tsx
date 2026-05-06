import { useCallback, useEffect, useMemo } from "react";
import { Button } from "../Button/Button";
import SwapDetails from "../SwapDetails/SwapDetails";
import TokenSelectField from "../TokenSelectField/TokenSelectField";
import { SwapFormProvider, useSwapForm } from "../../form/SwapFormContext";
import {
  type FormValues,
  type SwapFormErrors,
  type SwapFormValues,
  type ValidateSwapForm,
  doSwapValuesMatchSnapshot,
} from "../../form/swapFormTypes";
import { formatAmount } from "../../lib/format";

export type { FormValues } from "../../form/swapFormTypes";

const EMPTY_VALUES: SwapFormValues = {
  fromToken: "",
  toToken: "",
  fromAmount: "",
  toAmount: "",
};

const validateSwap: ValidateSwapForm = (values) => {
  const errors: SwapFormErrors = {};

  if (!values.fromAmount) {
    errors.fromAmount = "Enter an amount to swap.";
  } else if (Number.isNaN(Number(values.fromAmount)) || Number(values.fromAmount) <= 0) {
    errors.fromAmount = "Amount must be greater than 0.";
  }

  if (values.fromToken === values.toToken) {
    errors.fromAmount = "Please select two different tokens.";
  }

  return errors;
};

type Props = {
  tokenPrices: Map<string, number>;
  loadError: string;
  onSubmit: (values: FormValues) => Promise<{ success: boolean }>;
  initialValues?: FormValues;
  submitInProgress: boolean;
  onClearSubmitFeedback: () => void;
};

type InnerProps = Omit<Props, "onSubmit" | "initialValues" | "onClearSubmitFeedback">;

const panelClass =
  "rounded-[1.15rem] border border-slate-200/85 bg-gradient-to-b from-white to-slate-50/98 p-[1rem_1.05rem] shadow-[0_10px_30px_-18px_rgba(15,23,42,0.18)] ring-1 ring-white/70 transition-[border-color,box-shadow] duration-500 dark:border-slate-600/90 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 dark:shadow-[0_14px_40px_-12px_rgba(0,0,0,0.52)] dark:ring-slate-700/85";

const SwapFormFields = ({
  tokenPrices,
  loadError,
  submitInProgress,
}: InnerProps) => {
  const { values, handleSubmit, setValues, setFieldValue, isValid, lastSubmittedValues } = useSwapForm();

  const submitMatchesLastSuccess = useMemo(
    () =>
      lastSubmittedValues !== null &&
      doSwapValuesMatchSnapshot(values, lastSubmittedValues),
    [lastSubmittedValues, values],
  );

  const tokenSymbols = useMemo(() => [...tokenPrices.keys()], [tokenPrices]);

  const fromPrice = tokenPrices.get(values.fromToken);
  const toPrice = tokenPrices.get(values.toToken);

  const canComputeQuote =
    typeof fromPrice === "number" &&
    typeof toPrice === "number" &&
    Number(values.fromAmount) > 0 &&
    values.fromToken !== values.toToken &&
    !loadError;

  const computedToAmount = useMemo(() => {
    if (
      !canComputeQuote ||
      typeof fromPrice !== "number" ||
      typeof toPrice !== "number"
    ) {
      return "";
    }
    const convertedAmount = (Number(values.fromAmount) * fromPrice) / toPrice;
    return formatAmount(convertedAmount, 8);
  }, [canComputeQuote, values.fromAmount, fromPrice, toPrice]);

  useEffect(() => {
    if (computedToAmount === values.toAmount) {
      return;
    }
    setFieldValue("toAmount", computedToAmount, { notify: false });
  }, [computedToAmount, values.toAmount, setFieldValue]);

  const exchangeRateText = useMemo(() => {
    if (!canComputeQuote || typeof fromPrice !== "number" || typeof toPrice !== "number") {
      return "Rate: —";
    }
    return `Rate: 1 ${values.fromToken} = ${formatAmount(fromPrice / toPrice, 8)} ${values.toToken}`;
  }, [canComputeQuote, fromPrice, values.fromToken, toPrice, values.toToken]);

  const networkFeeText = useMemo(() => {
    if (!canComputeQuote) {
      return "Estimated network fee: —";
    }
    return `Estimated network fee: ${formatAmount(Number(values.fromAmount) * 0.0025, 6)} ${values.fromToken}`;
  }, [canComputeQuote, values.fromAmount, values.fromToken]);

  const flipTokens = useCallback(() => {
    setValues({ fromToken: values.toToken, toToken: values.fromToken });
  }, [values.toToken, values.fromToken, setValues]);

  return (
    <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
      <div className={panelClass}>
        <TokenSelectField
          id="from-token"
          ariaLabel="From token"
          disabled={submitInProgress}
          symbols={tokenSymbols}
          tokenField="fromToken"
          amountField="fromAmount"
          label="You pay"
        />
      </div>

      <div className="relative flex justify-center py-0.5">
        <span
          className="pointer-events-none absolute left-0 right-0 top-1/2 z-0 h-px bg-gradient-to-r from-transparent via-slate-300/95 to-transparent dark:via-slate-600"
          aria-hidden
        />
        <Button
          variant="iconRound"
          className="relative z-[1] shadow-md"
          aria-label="Flip tokens"
          onClick={flipTokens}
          title="Swap direction"
        >
          ⇅
        </Button>
      </div>

      <div className={panelClass}>
        <TokenSelectField
          id="to-token"
          ariaLabel="To token"
          disabled={submitInProgress}
          symbols={tokenSymbols}
          tokenField="toToken"
          amountField="toAmount"
          label="You receive"
          amountReadOnly
        />
      </div>

      <SwapDetails exchangeRateText={exchangeRateText} networkFeeText={networkFeeText} />

      <Button
        variant="primary"
        type="submit"
        inProgress={submitInProgress}
        ready={submitMatchesLastSuccess}
        disabled={!isValid}
        aria-label={
          submitMatchesLastSuccess && !submitInProgress ?
            "These values match your last submitted swap. Submit again to send another confirmation."
            : undefined
        }
      >
        {
          submitInProgress || submitMatchesLastSuccess ? "" : "Confirm swap"
        }
      </Button>
    </form>
  );
};

const SwapForm = (props: Props) => {
  const { initialValues, onSubmit, onClearSubmitFeedback, ...rest } = props;

  const mergedInitial = initialValues ?? EMPTY_VALUES;

  return (
    <SwapFormProvider
      initialValues={mergedInitial}
      validate={validateSwap}
      onSubmit={onSubmit}
      onValuesChange={onClearSubmitFeedback}
    >
      <SwapFormFields {...rest} />
    </SwapFormProvider>
  );
};

export default SwapForm;
