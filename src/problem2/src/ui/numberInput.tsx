import { Input } from "@chakra-ui/react";
import React from "react";
import { type InputHTMLAttributes } from "react";

export type NumberInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "color"
>;

export const NumberInput: React.FC<NumberInputProps> = (props) => {
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const target = e.target as HTMLInputElement;
      const { value, selectionStart, selectionEnd } = target;

      if (e.metaKey || e.ctrlKey) return;

      if (e.key.length > 1) return;

      const futureValue =
        value.substring(0, selectionStart ?? 0) +
        e.key +
        value.substring(selectionEnd ?? 0);

      const pattern = /^[0-9]*(\.[0-9]*)?$/;

      if (!pattern.test(futureValue)) {
        e.preventDefault();
      }
    },
    []
  );

  return (
    <Input
      unstyled
      pattern="[0-9]*(.[0-9]+)?"
      flex="1 1 0"
      minW="0"
      maxW="full"
      minH="0"
      py="0.4rem"
      textAlign="right"
      fontFamily={`"JetBrains Mono", ui-monospace, monospace`}
      fontWeight="medium"
      fontVariantNumeric="tabular-nums"
      color="#000000"
      outline="none"
      css={{
        fontSize: "1.15rem",
        "@media (max-width: 420px)": {
          fontSize: "1.05rem",
        },
      }}
      _placeholder={{ color: "rgba(115, 115, 115, 0.65)" }}
      {...props}
      onKeyDown={handleKeyDown}
    />
  );
};
