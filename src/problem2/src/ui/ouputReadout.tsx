import { Box } from "@chakra-ui/react";

export const OutputReadout: React.FC<React.PropsWithChildren> = ({
  children,
}) => (
  <Box
    display="flex"
    minW="0"
    alignItems="center"
    borderRadius="swap-def"
    border="1px solid rgba(147, 51, 234, 0.2)"
    bg="rgba(192, 132, 252, 0.18)"
    px="0.65rem"
    py="0.35rem"
  >
    <Box
      as="output"
      aria-live="polite"
      minH="0"
      minW="0"
      maxW="full"
      flex="1 1 0"
      overflowX="auto"
      overflowY="hidden"
      whiteSpace="nowrap"
      border="none"
      bg="transparent"
      py="0.4rem"
      textAlign="right"
      fontFamily={`"JetBrains Mono", ui-monospace, monospace`}
      fontWeight="medium"
      fontVariantNumeric="tabular-nums"
      color="#000000"
      css={{
        fontSize: "1.15rem",
        "@media (max-width: 420px)": {
          fontSize: "1.05rem",
        },
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(147, 51, 234, 0.42) transparent",
      }}
    >
      {children}
    </Box>
  </Box>
);
