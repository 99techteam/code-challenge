import { Box, Text, Spinner } from "@chakra-ui/react";

export function LoadPanel() {
  return (
    <Box
      as="section"
      id="load-panel"
      borderRadius="swap-lg"
      border="swap-def"
      bg="#ffffff"
      p="2rem 1.5rem"
      textAlign="center"
      boxShadow="swap-lg"
    >
      <Spinner
        size="xl"
        width="2.5rem"
        height="2.5rem"
        borderWidth="3px"
        borderColor="rgba(147, 51, 234, 0.2)"
        borderTopColor="#9333ea"
        animationDuration="0.85s"
        mx="auto"
        aria-hidden
      />
      <Text mt="1rem" mb="0.25rem" fontWeight="semibold" color="#000000">
        Loading markets…
      </Text>
      <Text m="0" fontSize="0.9rem" color="#737373">
        Fetching price data
      </Text>
    </Box>
  );
}
