import SwapCurrencyCpn from "./components/SwapCurrencyCpn";
import LoadingSpin from "./components/LoadingSpin";
import { useTokens } from "./hooks/useTokens";

function App() {
  const { tokens, isLoading, error } = useTokens();
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 font-sans">
      {isLoading ? (
        <LoadingSpin description="Loading Tokens...." />
      ) : error ? (
        <p>There is a problem when loading data, please try again later.</p>
      ) : (
        <div className="w-full max-w-lg">
          {" "}
          <SwapCurrencyCpn tokens={tokens} />
        </div>
      )}
      <footer className="text-center mt-8 text-gray-500 text-sm">
        <p>
          Token data from{" "}
          <a
            href="https://interview.switcheo.com/prices.json"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Switcheo API
          </a>
          .
        </p>
      </footer>
    </main>
  );
}

export default App;
