import { Box, Field, Flex } from "@chakra-ui/react";
import type React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { COMMON_UI_STYLES } from "../../consts";
import { useSwapUI } from "../../hooks/useSwapUi";
import type { TFormValues } from "../../models";
import { NumberInput, Select } from "../../ui";
import { transformData } from "../../utils";

export const AmountFromSection: React.FC = () => {
  const {
    watch,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<TFormValues>();
  const data = watch("data") ?? [];
  const selectList = transformData(data);
  const from = watch("from") as string;
  const to = watch("to") as string;
  const amountIn = watch("amountIn") as string;
  const isSubmitting = watch("isSubmitting");

  const { fromPriceHint } = useSwapUI(data, from, to, amountIn);

  return (
    <Box
      borderRadius="swap-md"
      border="swap-def"
      bg="#fafafa"
      p="0.85rem 0.9rem"
    >
      <Field.Root invalid={!!errors.amountIn}>
        <Flex
          mb="0.65rem"
          align="baseline"
          justify="space-between"
          gap="0.75rem"
          w="full"
        >
          <Field.Label
            fontSize="0.8rem"
            fontWeight="semibold"
            textTransform="uppercase"
            letterSpacing="0.06em"
            color="#404040"
          >
            You pay
          </Field.Label>
          <Field.HelperText
            as="span"
            fontSize="0.75rem"
            color="#737373"
            fontVariantNumeric="tabular-nums"
            aria-live="polite"
          >
            {fromPriceHint}
          </Field.HelperText>
        </Flex>
        <Box css={COMMON_UI_STYLES.gridCss}>
          <Flex
            minH={0}
            minW={0}
            flex={1}
            align="center"
            gap="0.45rem"
            borderRadius="swap-def"
            border="1px solid rgba(147, 51, 234, 0.12)"
            bg="rgba(192, 132, 252, 0.1)"
            p="0.35rem 0.4rem 0.35rem 0.35rem"
            _focusWithin={COMMON_UI_STYLES.focusWithinRing}
          >
            <Select
              value={from ? [from] : undefined}
              collection={selectList}
              onChange={(x) => setValue("from", x[0])}
            />
          </Flex>
          <Field.Root display="flex" flexDirection="column" minW={0} flex={1}>
            <Flex
              minH={0}
              minW={0}
              align="center"
              borderRadius="swap-def"
              border="swap-def"
              bg="#ffffff"
              px="0.65rem"
              py="0.35rem"
              _focusWithin={COMMON_UI_STYLES.focusWithinRing}
              w="full"
            >
              <Field.Label srOnly>Amount to send</Field.Label>
              <Controller
                name="amountIn"
                control={control}
                rules={{
                  validate: {
                    min: (val: string) =>
                      !(val && +val > 0)
                        ? "Amount must be greater than zero"
                        : true,
                  },
                  required: {
                    value: true,
                    message: "Enter an amount to swap.",
                  },
                }}
                render={({ field }) => (
                  <NumberInput
                    autoComplete="off"
                    placeholder="0.0"
                    disabled={isSubmitting}
                    {...field}
                  />
                )}
              />
            </Flex>
          </Field.Root>
          <Field.ErrorText
            mt="0.45rem"
            fontSize="0.8rem"
            color="swap.danger"
            role="alert"
          >
            {errors.amountIn?.message ?? ""}
          </Field.ErrorText>
        </Box>
      </Field.Root>
    </Box>
  );
};
