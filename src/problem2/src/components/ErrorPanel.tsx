import { Box, Text } from "@chakra-ui/react";
import { Button } from "../ui";

export type ErrorPanelProps = {
  title: string;
  detail: string;
  onRetry: () => void;
};

export function ErrorPanel({ title, detail, onRetry }: ErrorPanelProps) {
  return (
    <Box
      as="section"
      id="error-panel"
      borderRadius="swap-lg"
      border="swap-def"
      bg="#ffffff"
      p="2rem 1.5rem"
      textAlign="center"
      boxShadow="swap-lg"
      role="alert"
    >
      <Text mb="0.35rem" color="#dc2626" id="error-title">
        {title}
      </Text>
      <Text mb="1.25rem" fontSize="0.9rem" color="#404040" id="error-detail">
        {detail}
      </Text>
      <Button variant="secondary" id="retry-btn" onClick={onRetry}>
        Try again
      </Button>
    </Box>
  );
}
