import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toaster, toast } from "sonner";

import {
  formatNumber,
  formatRate,
  formatTokenAmount,
  formatUsd,
  sanitizeNumericInput,
} from "./utils";

import { MAX_INPUT_VALUE, PRICE_URL } from "@constants";
import { useTokenPrices } from "@hooks/useTokenPrices";
import SwapPanel from "@components/SwapPanel";
import SwapSummary from "@components/SwapSummary";
import SwapModal from "@components/SwapModal";

const formSchema = z.object({
  amount: z
    .string()
    .min(1, "Please enter an amount")
    .refine((value) => !Number.isNaN(Number(value)), {
      message: "Amount must be a valid number",
    })
    .refine((value) => Number(value) > 0, {
      message: "Amount must be greater than 0",
    })
    .refine((value) => Number(value) <= MAX_INPUT_VALUE, {
      message: `Amount must be less than or equal to ${MAX_INPUT_VALUE.toLocaleString()}`,
    }),
});

type FormValues = z.infer<typeof formSchema>;

export default function App() {
  const { tokens, loading } = useTokenPrices();

  const [fromToken, setFromToken] = useState("ETH");
  const [toToken, setToToken] = useState("USDC");
  const [amountInput, setAmountInput] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [isProcessingSwap, setIsProcessingSwap] = useState(false);

  const warnedMaxRef = useRef(false);

  const {
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { amount: "" },
    mode: "onChange",
  });

  const resolvedFromToken = useMemo(() => {
    return tokens.find((token) => token.currency === fromToken)?.currency
      ? fromToken
      : tokens.find((token) => token.currency === "ETH")?.currency ??
          tokens[0]?.currency ??
          "";
  }, [tokens, fromToken]);

  const resolvedToToken = useMemo(() => {
    return tokens.find((token) => token.currency === toToken)?.currency
      ? toToken
      : tokens.find((token) => token.currency === "USDC")?.currency ??
          tokens.find((token) => token.currency !== resolvedFromToken)
            ?.currency ??
          tokens[0]?.currency ??
          "";
  }, [tokens, toToken, resolvedFromToken]);

  const fromTokenData = useMemo(
    () => tokens.find((token) => token.currency === resolvedFromToken),
    [tokens, resolvedFromToken]
  );

  const toTokenData = useMemo(
    () => tokens.find((token) => token.currency === resolvedToToken),
    [tokens, resolvedToToken]
  );

  const numericAmount = useMemo(() => {
    const parsed = Number(amountInput);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [amountInput]);

  const rate = useMemo(() => {
    if (!fromTokenData || !toTokenData) return 0;
    return fromTokenData.price / toTokenData.price;
  }, [fromTokenData, toTokenData]);

  const outputAmount = useMemo(() => {
    if (!amountInput || numericAmount <= 0 || !rate) return 0;
    return numericAmount * rate;
  }, [amountInput, numericAmount, rate]);

  const availableFromTokens = useMemo(
    () => tokens.filter((token) => token.currency !== resolvedToToken),
    [tokens, resolvedToToken]
  );

  const availableToTokens = useMemo(
    () => tokens.filter((token) => token.currency !== resolvedFromToken),
    [tokens, resolvedFromToken]
  );

  const handleAmountChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const rawValue = event.target.value;
    const sanitized = sanitizeNumericInput(rawValue);

    if (
      rawValue !== sanitized &&
      Number(sanitized) >= MAX_INPUT_VALUE &&
      !warnedMaxRef.current
    ) {
      toast.warning(`Maximum amount is ${formatNumber(MAX_INPUT_VALUE)}`);
      warnedMaxRef.current = true;
    }

    if (Number(sanitized) < MAX_INPUT_VALUE) {
      warnedMaxRef.current = false;
    }

    setAmountInput(sanitized);
    setValue("amount", sanitized, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    await trigger("amount");
  };

  const handleAmountBlur = async () => {
    if (!amountInput) return;

    const normalized = sanitizeNumericInput(amountInput);
    setAmountInput(normalized);
    setValue("amount", normalized, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    await trigger("amount");
  };

  const handleSwapDirection = () => {
    if (resolvedFromToken === resolvedToToken) {
      toast.warning("Tokens are already the same");
      return;
    }

    setFromToken(resolvedToToken);
    setToToken(resolvedFromToken);
    toast.success("Swap direction updated");
  };

  const onSubmit = async () => {
    if (resolvedFromToken === resolvedToToken) {
      toast.error("From token and to token must be different");
      return;
    }

    if (!fromTokenData || !toTokenData) {
      toast.error("Please select valid tokens");
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleConfirmSwap = async () => {
    setIsProcessingSwap(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1600));
      setIsConfirmModalOpen(false);
      setIsCompletedModalOpen(true);
      toast.success("Swap completed successfully");
    } catch {
      toast.error("Swap failed. Please try again.");
    } finally {
      setIsProcessingSwap(false);
    }
  };

  const handleCloseCompletedModal = () => {
    setAmountInput("");
    reset({ amount: "" });
    warnedMaxRef.current = false;
    setIsCompletedModalOpen(false);
  };

  return (
    <>
      <Toaster richColors position="top-right" />

      <div className="page">
        <div className="swap-card">
          <div className="swap-header">
            <div>
              <p className="eyebrow">Fancy Form</p>
              <h1>Currency Swap</h1>
            </div>
            <div className="status-pill">
              {loading ? "Loading..." : "Live prices"}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="swap-form">
            <SwapPanel
              title="Amount to send"
              usdHint={
                fromTokenData && amountInput
                  ? formatUsd(numericAmount * fromTokenData.price)
                  : "$0.00"
              }
              helperText={`Max ${formatNumber(MAX_INPUT_VALUE)}.`}
              errorText={errors.amount?.message}
              inputValue={amountInput}
              onInputChange={handleAmountChange}
              onInputBlur={handleAmountBlur}
              tokens={availableFromTokens}
              selectedToken={resolvedFromToken}
              onTokenChange={setFromToken}
              hasError={!!errors.amount}
            />

            <div className="swap-action-row">
              <button
                type="button"
                className="swap-icon-button"
                onClick={handleSwapDirection}
                aria-label="Swap token direction"
              >
                ⇅
              </button>
            </div>

            <SwapPanel
              title="Amount to receive"
              usdHint={
                toTokenData && outputAmount
                  ? formatUsd(outputAmount * toTokenData.price)
                  : "$0.00"
              }
              helperText="Estimated amount based on latest available prices"
              inputValue={outputAmount ? formatTokenAmount(outputAmount) : ""}
              readOnly
              tokens={availableToTokens}
              selectedToken={resolvedToToken}
              onTokenChange={setToToken}
            />

            <SwapSummary
              fromToken={resolvedFromToken}
              toToken={resolvedToToken}
              rateText={rate ? formatRate(rate) : "0"}
              priceUrl={PRICE_URL}
            />

            <button
              type="submit"
              className="submit-button"
              disabled={
                loading ||
                isSubmitting ||
                !amountInput ||
                !!errors.amount ||
                resolvedFromToken === resolvedToToken
              }
            >
              {loading ? "Loading prices..." : "Confirm Swap"}
            </button>

            {resolvedFromToken === resolvedToToken && (
              <p className="error-text center">
                Please choose two different tokens
              </p>
            )}
          </form>
        </div>
      </div>

      {isConfirmModalOpen && (
        <SwapModal
          eyebrow="Review swap"
          title="Confirm your swap"
          rows={[
            {
              label: "You pay",
              value: `${formatTokenAmount(
                Number(amountInput || 0)
              )} ${resolvedFromToken}`,
            },
            {
              label: "You receive",
              value: `${formatTokenAmount(outputAmount)} ${resolvedToToken}`,
            },
            {
              label: "Rate",
              value: `1 ${resolvedFromToken} = ${
                rate ? formatRate(rate) : "0"
              } ${resolvedToToken}`,
            },
            {
              label: "Estimated value",
              value: fromTokenData
                ? formatUsd(Number(amountInput || 0) * fromTokenData.price)
                : "$0.00",
            },
          ]}
          primaryText={isProcessingSwap ? "Processing..." : "Confirm Swap"}
          secondaryText="Cancel"
          onPrimaryClick={handleConfirmSwap}
          onSecondaryClick={() => setIsConfirmModalOpen(false)}
          primaryDisabled={isProcessingSwap}
          secondaryDisabled={isProcessingSwap}
        />
      )}

      {isCompletedModalOpen && (
        <SwapModal
          eyebrow="Completed"
          title="Swap completed"
          description="Your swap has been successfully simulated."
          rows={[
            {
              label: "Swapped",
              value: `${formatTokenAmount(
                Number(amountInput || 0)
              )} ${resolvedFromToken}`,
            },
            {
              label: "Received",
              value: `${formatTokenAmount(outputAmount)} ${resolvedToToken}`,
            },
          ]}
          primaryText="Done"
          onPrimaryClick={handleCloseCompletedModal}
          completed
        />
      )}
    </>
  );
}
