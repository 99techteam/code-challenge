import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { ArrowUpDownIcon } from "lucide-react";
import { Button } from "./components/ui/button";
import { Loading } from "./components/app/loading";
import { getCurrency } from "./service/price";
import { useQuery } from "@tanstack/react-query";
import { CurrencyField } from "./components/app/currency-field";
import { useCurrencySwapStore } from "./store/currency-swap";
import { useEffect } from "react";
import type { CurrencyPrice } from "./types";

function CrossCurrencySwapFrom() {
  const fromCurrency = useCurrencySwapStore((state) => state.fromCurrency);
  const toCurrency = useCurrencySwapStore((state) => state.toCurrency);
  const updateFromCurrency = useCurrencySwapStore(
    (state) => state.updateFromCurrency
  );
  const updateToCurrency = useCurrencySwapStore(
    (state) => state.updateToCurrency
  );
  const swapCurrencies = useCurrencySwapStore((state) => state.swapCurrencies);

  const query = useQuery({ queryKey: ["currencies"], queryFn: getCurrency });

  // Initialize currencies when data is loaded
  useEffect(() => {
    if (
      query.isSuccess &&
      query.data &&
      query.data.length > 0 &&
      !fromCurrency &&
      !toCurrency
    ) {
      updateFromCurrency({
        currency: query.data[0].currency,
        amount: 1,
        price: query.data[0].price,
      });

      updateToCurrency({
        currency: query.data[1].currency,
        amount: query.data[1].price / query.data[0].price,
        price: query.data[1].price,
      });
    }
  }, [
    query.data,
    query.isSuccess,
    fromCurrency,
    toCurrency,
    updateFromCurrency,
    updateToCurrency,
  ]);

  const handleFromCurrencyChange = (value: CurrencyPrice) => {
    updateFromCurrency(value);

    if (toCurrency) {
      // Calculate the equivalent amount in the "to" currency
      const exchangeRate = value.price / toCurrency.price;
      updateToCurrency({
        ...toCurrency,
        amount: value.amount * exchangeRate,
      });
    }
  };

  const handleToCurrencyChange = (value: CurrencyPrice) => {
    updateToCurrency(value);

    if (fromCurrency) {
      // Calculate the equivalent amount in the "from" currency
      const exchangeRate = value.price / fromCurrency.price;
      updateFromCurrency({
        ...fromCurrency,
        amount: value.amount * exchangeRate,
      });
    }
  };

  const handleSwap = () => {
    if (fromCurrency && toCurrency) {
      swapCurrencies();
    }
  };

  if (query.isPending) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading className="w-8 h-8" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Error: {query.error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {query.isSuccess && fromCurrency && toCurrency && (
        <>
          <div className="gap-2 flex items-center">
            <CurrencyField
              initData={query.data}
              currency={fromCurrency.currency}
              amount={fromCurrency.amount}
              onChange={handleFromCurrencyChange}
            />
          </div>

          <div className="gap-2 flex items-center mt-2">
            <Button
              type="button"
              className="w-14 h-14 rounded-full p-0 flex items-center justify-center hover:rotate-180 transition-transform duration-300"
              variant="default"
              onClick={handleSwap}
            >
              <ArrowUpDownIcon width={32} height={32} />
            </Button>
            {/* Exchange Rate Display */}
            <div className="text-center text-sm text-gray-600">
              1 {fromCurrency.currency} ={" "}
              {(fromCurrency.price / toCurrency.price).toFixed(6)}{" "}
              {toCurrency.currency}
            </div>
          </div>

          <div className="gap-2 flex items-center">
            <CurrencyField
              initData={query.data}
              currency={toCurrency.currency}
              amount={toCurrency.amount}
              onChange={handleToCurrencyChange}
            />
          </div>
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-b from-slate-500 to-slate-800 ">
      <Card className="w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center">
            Cross Currency Swap
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full h-48">
          <CrossCurrencySwapFrom />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
