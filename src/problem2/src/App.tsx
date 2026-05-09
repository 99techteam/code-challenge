import { Box, Container } from "@chakra-ui/react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ErrorPanel } from "./components/ErrorPanel";
import { Footer } from "./components/Footer";
import { Form } from "./components/form";
import { Header } from "./components/Header";
import { LoadPanel } from "./components/LoadPanel";
import { PRICES_URL } from "./consts";
import { useFetch } from "./hooks/useFetch";
import type { TFormValues, TPrice } from "./models";

const shellMaxW = { base: "min(440px, 100%)", md: "min(600px, 100%)" };

export const App = () => {
  const { invoke, data, error, loading } = useFetch<TPrice[]>();
  const methods = useForm<TFormValues>({
    defaultValues: {
      from: undefined,
      to: undefined,
      amountIn: "",
      data: [],
      isSubmitting: false,
    },
    values: {
      data: [
        ...new Map(
          data
            ?.toSorted((a, b) => Number(b.date) - Number(a.date))
            .map?.((x) => [x.currency, { ...x, date: Date.parse(x.date) }]) ??
            []
        ).values(),
      ],
      from: (data ?? [])?.[0]?.currency,
      to: (data ?? [])?.[1]?.currency,
      amountIn: "",
      isSubmitting: false,
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    invoke(PRICES_URL);
  }, []);

  return (
    <FormProvider {...methods}>
      <Container
        minH="100vh"
        w="full"
        minW="360px"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="7"
        color="swap.ink"
        fontFamily="body"
        colorScheme="light"
        maxW="full"
        bg="white"
      >
        <Box w="full" maxW={shellMaxW}>
          <Header />
        </Box>

        <Box position="relative" w="full" maxW={shellMaxW}>
          {loading && <LoadPanel />}
          {!!error && (
            <ErrorPanel
              title="Error"
              detail="Couldn't load the prices"
              onRetry={() => invoke(PRICES_URL)}
            />
          )}
          {!loading && !Boolean(error) && <Form />}
        </Box>

        <Box w="full" maxW={shellMaxW}>
          <Footer />
        </Box>
      </Container>
    </FormProvider>
  );
};
