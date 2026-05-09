import { Box, Text } from "@chakra-ui/react";
import React, { useCallback } from "react";
import { useFormContext, type SubmitHandler } from "react-hook-form";
import type { TFormValues } from "../../models";
import { Button, toaster } from "../../ui";
import { FlipArrowsIcon } from "../../ui/icons";
import { AmountFromSection } from "./AmountFromSection";
import { AmountToSection } from "./AmountToSection";
import { formatAmount } from "../../utils";
import { useSwapUI } from "../../hooks/useSwapUi";

export const Form: React.FC = () => {
  const { watch, handleSubmit, setValues, setValue, clearErrors, resetField } =
    useFormContext<TFormValues>();
  const from = watch("from") as string;
  const to = watch("to") as string;
  const data = watch("data");
  const amountIn = watch("amountIn");
  const isSubmitting = watch("isSubmitting");
  const { rate } = useSwapUI(data, from, to, amountIn);

  const onSubmit: SubmitHandler<TFormValues> = async (data) => {
    setValue("isSubmitting", true);
    const recv =
      rate !== null && amountIn !== ""
        ? Number(amountIn) * Number(rate)
        : null;
    const recvStr = recv !== null ? formatAmount(recv) : "—";
    setTimeout(() => {
      toaster.create({
        type: "info",
        title: "Swap submitted",
        closable: true,
        description: `${formatAmount(Number(data.amountIn) ?? 0)} ${data.from} → ${recvStr} ${data.to}`,
      });
      resetField("amountIn");
      setValue("isSubmitting", false);
    }, 2000);
  };

  const onFlip = useCallback(() => {
    setValues({ from: to, to: from });
    clearErrors(["amountIn"]);
  }, [clearErrors, from, setValues, to]);

  return (
    <Box
      as="form"
      id="swap-form"
      display="flex"
      flexDirection="column"
      gap="1.1rem"
      borderRadius="swap-lg"
      border="swap-def"
      bg="white"
      p="1.35rem 1.25rem 1.5rem"
      boxShadow="swap-lg"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Box display="flex" flexDirection="column">
        <AmountFromSection />
        <Box
          position="relative"
          zIndex={1}
          my="-0.55rem"
          display="flex"
          justifyContent="center"
        >
          <Button
            type="button"
            variant="flip"
            aria-label="Swap pay and receive tokens"
            onClick={onFlip}
          >
            <FlipArrowsIcon />
          </Button>
        </Box>
        <AmountToSection />
      </Box>

      <Button
        variant="primary"
        type="submit"
        loading={isSubmitting}
        loadingText={
          <Text as="span" pl="2">
            Submiting...
          </Text>
        }
      >
        Confirm swap
      </Button>
    </Box>
  );
};
