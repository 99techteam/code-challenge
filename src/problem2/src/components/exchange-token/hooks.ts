import { walletService, useExchangeWallet } from "@api";
import { useToast } from "@contexts";
import {
  exchangeSchema,
  type ExchangeFormData,
  type TokenPriceType,
} from "@types";
import { ERROR_MESSAGES } from "@common";
import { DECIMAL_PRECISION, DECIMAL_MULTIPLIER } from "@common/configs";
import { useCallback, useState } from "react";

type TokenForm = Partial<Omit<ExchangeFormData, "fromAmount" | "toAmount">>;
type AmountForm = {
  fromAmount: string | number;
  toAmount: string | number;
};

type FormError = Partial<Record<keyof ExchangeFormData, string>>;

const tokenFormDefaultValue: TokenForm = {
  fromToken: "",
  toToken: "",
};

const amountFormDefaultValue: AmountForm = {
  fromAmount: "",
  toAmount: "",
};

const keyAmountExchange: Record<keyof AmountForm, keyof AmountForm> = {
  fromAmount: "toAmount",
  toAmount: "fromAmount",
};

const keyTokenExchange: Record<keyof TokenForm, keyof TokenForm> = {
  fromToken: "toToken",
  toToken: "fromToken",
};

export const useExchangeForm = (
  prices: Record<string, TokenPriceType>,
  formCallback?: () => void,
) => {
  const { mutate: exchangeWallet, isPending } = useExchangeWallet();
  const { showSuccess, showError } = useToast();

  const [tokenForm, setTokenForm] = useState<TokenForm>(tokenFormDefaultValue);
  const [amountForm, setAmountForm] = useState<AmountForm>(
    amountFormDefaultValue,
  );
  const [formError, setFormError] = useState<FormError | undefined>(undefined);

  const { fromToken, toToken } = tokenForm;
  const { fromAmount, toAmount } = amountForm;
  const ballance = walletService.getBalance(fromToken || "");

  const calculateAmount = useCallback(
    (from: number, fromTkn: string, toTkn: string): number => {
      const fromPrice = prices[fromTkn];
      const toPrice = prices[toTkn];
      if (!fromPrice || !toPrice || toPrice.price === 0 || from <= 0) return 0;
      const priceRate =
        (fromPrice.price / toPrice.price) * DECIMAL_MULTIPLIER;
      return parseFloat(
        ((from * Number(priceRate)) / DECIMAL_MULTIPLIER).toFixed(
          DECIMAL_PRECISION,
        ),
      );
    },
    [prices],
  );

  const validateField = useCallback(
    (field: keyof ExchangeFormData, value: string | number) => {
      // Validate single field using field-level schema
      const fieldSchema = exchangeSchema.shape[field];
      const result = fieldSchema.safeParse(value);

      const message = !result.success
        ? result.error.issues[0].message
        : undefined;

      // Clear error if valid
      setFormError((prev) => ({
        ...prev,
        [field]: message,
      }));
      return result.success;
    },
    [],
  );

  const handleAmountChange = useCallback(
    (field: keyof AmountForm, value: number | string) => {
      const hasTokens = fromToken && toToken;
      const numValue = Number(value);
      
      // Validate input value
      validateField(field, numValue);
      
      // If no tokens selected, just update the field
      if (!hasTokens) {
        setAmountForm((prev) => ({ ...prev, [field]: value }));
        return;
      }
      
      // Calculate the other amount
      const otherField = keyAmountExchange[field];
      const newAmount = calculateAmount(numValue, fromToken, toToken);
      
      // Validate calculated amount OUTSIDE setState
      validateField(otherField, newAmount);
      
      // Update both amounts
      setAmountForm((prev) => ({
        ...prev,
        [field]: value,
        [otherField]: newAmount,
      }));
    },
    [calculateAmount, fromToken, toToken, validateField],
  );

  const handleTokenChange = useCallback(
    (field: keyof TokenForm, token?: string | null) => {
      validateField(field, token ?? "");
      
      // Capture computed values from state update
      let computedFromToken: string | undefined;
      let computedToToken: string | undefined;
      
      setTokenForm((prev: TokenForm) => {
        const otherToken = prev[keyTokenExchange[field]];
        computedFromToken = field === "fromToken" ? (token ?? "") : otherToken;
        computedToToken = field === "toToken" ? (token ?? "") : otherToken;
        
        return {
          ...prev,
          [field]: token ?? "",
        };
      });
      
      // Update amountForm separately using captured values
      setAmountForm((amtPrev) => {
        const formNum = Number(amtPrev.fromAmount);
        const willRecalculate =
          computedFromToken && computedToToken && amtPrev.fromAmount && formNum > 0;

        if (!token) {
          return { ...amtPrev, toAmount: 0 };
        } else if (willRecalculate) {
          const newToAmount = calculateAmount(formNum, computedFromToken!, computedToToken!);
          // Validate OUTSIDE setState by scheduling after
          queueMicrotask(() => validateField("toAmount", newToAmount));
          return { ...amtPrev, toAmount: newToAmount };
        }
        return amtPrev;
      });
    },
    [calculateAmount, validateField],
  );

  const swapTokens = useCallback(() => {
    setTokenForm((prev) => ({
      fromToken: prev.toToken,
      toToken: prev.fromToken,
    }));
    setAmountForm((prev) => ({
      fromAmount: prev.toAmount,
      toAmount: prev.fromAmount,
    }));
    setFormError((prev) => {
      if (!prev) return undefined;
      return {
        fromToken: prev.toToken,
        toToken: prev.fromToken,
        fromAmount: prev.toAmount,
        toAmount: prev.fromAmount,
      };
    });
  }, []);

  const handleAllToken = useCallback(() => {
    handleAmountChange("fromAmount", ballance);
  }, [ballance, handleAmountChange]);

  const resetForm = useCallback(() => {
    setTokenForm(tokenFormDefaultValue);
    setAmountForm(amountFormDefaultValue);
    setFormError(undefined);
  }, []);

  const validateForm = useCallback(
    (data: Partial<ExchangeFormData>) => {
      setFormError(undefined);
      const result = exchangeSchema.safeParse(data);
      if (!result.success) {
        const errors: FormError = {} as FormError;
        result.error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof ExchangeFormData;
          errors[field] = issue.message;
        });
        setFormError(errors);
        return false;
      } else if (Number(data.fromAmount) > ballance) {
        const errors: FormError = {} as FormError;
        errors.fromAmount = ERROR_MESSAGES.VALIDATE.INSUFFICIENT_BALANCE;
        setFormError(errors);
        return false;
      }
      return true;
    },
    [ballance],
  );

  const handleSubmit = (data: Partial<ExchangeFormData>) => {
    const result = validateForm(data);
    if (!result) {
      return;
    }
    exchangeWallet(
      {
        fromToken: data.fromToken || "",
        toToken: data.toToken || "",
        fromAmount: Number(data.fromAmount) || 0,
        toAmount: Number(data.toAmount) || 0,
      },
      {
        onSuccess: () => {
          showSuccess(ERROR_MESSAGES.SWAP.SUCCESS);
          formCallback?.();
        },
        onError: (error: Error) => {
          showError(error.message || ERROR_MESSAGES.SWAP.FAILED);
        },
      },
    );
  };

  return {
    fromAmount,
    toAmount,
    fromToken,
    toToken,
    ballance,
    isPending,
    handleTokenChange,
    resetForm,
    handleSubmit,
    formError,
    swapTokens,
    handleAllToken,
    handleAmountChange,
  };
};
