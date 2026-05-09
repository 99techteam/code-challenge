import { Text } from "@chakra-ui/react";

export function Footer() {
  return (
    <Text w="full" textAlign="center" fontSize="0.78rem" lineHeight="1.45" color="#737373">
      Prices load from a public JSON file. No assets move; confirm runs a short wait then shows a status message.
    </Text>
  );
}
