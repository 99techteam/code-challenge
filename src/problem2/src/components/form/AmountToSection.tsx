import { Box, Field, Flex, Text } from "@chakra-ui/react";
import type React from "react";
import { COMMON_UI_STYLES } from "../../consts";
import { Select, OutputReadout } from "../../ui";
import { useFormContext } from "react-hook-form";
import type { TFormValues } from "../../models";
import { transformData } from "../../utils";
import { useSwapUI } from "../../hooks/useSwapUi";

export const AmountToSection: React.FC = () => {
  const { watch, setValue } = useFormContext<TFormValues>();
  const data = watch("data") ?? [];
  const selectList = transformData(data);
  const from = watch("from") as string;
  const to = watch("to") as string;
  const amountIn = watch("amountIn") as string;

  const { toPriceHint, outputAmount, pairRate } = useSwapUI(
    data,
    from,
    to,
    amountIn
  );

  return (
    <Box
      borderRadius="swap-md"
      border="swap-def"
      bg="#fafafa"
      p="0.85rem 0.9rem"
    >
      <Field.Root unstyled>
        <Flex
          mb="0.65rem"
          align="baseline"
          justify="space-between"
          gap="0.75rem"
        >
          <Field.Label
            fontSize="0.8rem"
            fontWeight="semibold"
            textTransform="uppercase"
            letterSpacing="0.06em"
            color="#404040"
          >
            You receive
          </Field.Label>
          <Field.HelperText
            as="span"
            fontSize="0.75rem"
            color="#737373"
            fontVariantNumeric="tabular-nums"
            aria-live="polite"
          >
            {toPriceHint}
          </Field.HelperText>
        </Flex>
        <Box css={COMMON_UI_STYLES.gridCss}>
          <Flex
            minH={0}
            minW={0}
            align="center"
            gap="0.45rem"
            borderRadius="swap-def"
            border="1px solid rgba(147, 51, 234, 0.12)"
            bg="rgba(192, 132, 252, 0.1)"
            p="0.35rem 0.4rem 0.35rem 0.35rem"
            _focusWithin={COMMON_UI_STYLES.focusWithinRing}
          >
            <Select
              value={to ? [to] : undefined}
              collection={selectList}
              onChange={(x) => setValue("to", x[0])}
            />
          </Flex>
          <OutputReadout>{outputAmount}</OutputReadout>
        </Box>
        <Box mt="0.55rem" minH="1.4rem">
          <Text
            as="p"
            m={0}
            fontSize="0.78rem"
            lineHeight="normal"
            color="#737373"
            fontVariantNumeric="tabular-nums"
            aria-live="polite"
          >
            {pairRate}
          </Text>
        </Box>
      </Field.Root>
    </Box>
  );
};
