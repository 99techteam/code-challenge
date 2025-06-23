import { ChakraProvider } from "@chakra-ui/react";
import { SwapForm } from "./components/CurrencySwapForm";
import { validateEnv } from "./config/env";

// Validate environment variables on app startup
validateEnv();

function App() {
  return (
    <ChakraProvider>
      <SwapForm />
    </ChakraProvider>
  );
}

export default App;
