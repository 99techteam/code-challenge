import { ChakraProvider } from "@chakra-ui/react";
import { SwapForm } from "./components/SwapForm";

function App() {
  return (
    <ChakraProvider>
      <SwapForm />
    </ChakraProvider>
  );
}

export default App;
