import { Box, Flex, Heading, Image, Text } from "@chakra-ui/react";

export function Header() {
  return (
    <Flex w="full" align="center" gap="4">
      <Box
        h="12"
        w="12"
        flexShrink={0}
        overflow="hidden"
        borderRadius="swap-md"
        border="swap-def"
        bg="#ffffff"
        boxShadow="0 8px 24px rgba(147, 51, 234, 0.12)"
      >
        <Image
          display="block"
          h="full"
          w="full"
          fit="cover"
          src="https://avatars.githubusercontent.com/u/122012061?s=200&v=4"
          alt="99TECH"
          decoding="async"
        />
      </Box>
      <Box>
        <Heading
          as="h1"
          m="0"
          fontSize="1.65rem"
          fontWeight="bold"
          letterSpacing="-0.03em"
        >
          Swap
        </Heading>
        <Text m="0" mt="0.2rem" fontSize="0.95rem" color="#404040">
          Exchange assets at live reference rates
        </Text>
      </Box>
    </Flex>
  );
}
