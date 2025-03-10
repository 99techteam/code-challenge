import { useCallback, useEffect, useState } from "react";
import "./App.css";
import CurrenciesSelect from "./components/custom/CurrenciesSelect";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Controller, useForm } from "react-hook-form";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Button } from "./components/ui/button";
import { Currency } from "./types";

type CurrencyFormType = {
  receiveCurrency: string | null;
  sendCurrency: string | null;
  amountToSend: number | null;
  amountToreceive: number | null;
};

function App() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const currencyForm = useForm<CurrencyFormType>({
    defaultValues: {
      receiveCurrency: null,
      sendCurrency: null,
      amountToSend: 0,
      amountToreceive: 0,
    },
  });
  const { watch } = currencyForm;

  const findCurrencyById = useCallback(
    (id: string) => {
      return currencies.find((c) => c.id === id);
    },
    [currencies]
  );

  const fetchCurrencies = useCallback(async () => {
    try {
      const res = await fetch("https://interview.switcheo.com/prices.json", {
        method: "GET",
      });
      const data = (await res.json()) || [];
      const currencies = data.map(
        (it: Currency) => ({ ...it, id: Math.random().toString() } as Currency)
      );
      setCurrencies(currencies);
    } catch (error) {
      console.error({ error });
    }
  }, []);

  const handleSwap = useCallback(() => {
    const { sendCurrency, receiveCurrency } = currencyForm.getValues();
    if (sendCurrency && receiveCurrency) {
      currencyForm.setValue("sendCurrency", receiveCurrency);
      currencyForm.setValue("receiveCurrency", sendCurrency);
    }
  }, [currencyForm]);

  useEffect(() => {
    const { unsubscribe } = watch((data, { name }) => {
      const { sendCurrency, amountToSend, receiveCurrency } = data;
      if (
        name === "sendCurrency" ||
        name === "amountToSend" ||
        name === "receiveCurrency"
      ) {
        if (sendCurrency && amountToSend && receiveCurrency) {
          const sendCurrencyData = findCurrencyById(sendCurrency);
          const receiveCurrencyData = findCurrencyById(receiveCurrency);

          if (sendCurrencyData && receiveCurrencyData) {
            const amountToreceive =
              (Number(sendCurrencyData.price) /
                Number(receiveCurrencyData.price)) *
              amountToSend;
            currencyForm.setValue("amountToreceive", amountToreceive);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [watch, findCurrencyById, currencyForm]);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  return (
    <Card className="w-[600px]">
      <CardHeader>
        <CardTitle>Currency Swap</CardTitle>
        <CardDescription>
          Please select the currencies and swap.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-start gap-4">
          <Label htmlFor="email">Amount To Send</Label>
          <div className="flex items-end gap-2">
            <Controller
              control={currencyForm.control}
              name="amountToSend"
              render={({ field }) => (
                <Input
                  type="number"
                  placeholder="Enter amount..."
                  value={field.value || ""}
                  onChange={field.onChange}
                  className="py-0"
                />
              )}
            />
            <Controller
              control={currencyForm.control}
              name="sendCurrency"
              render={({ field }) => (
                <CurrenciesSelect
                  currencies={currencies}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select currency"
                />
              )}
            />
          </div>

          <Label htmlFor="email">Amount To Receive</Label>
          <div className="flex items-center gap-2">
            <Controller
              control={currencyForm.control}
              name="amountToreceive"
              render={({ field }) => (
                <Input
                  type="number"
                  disabled
                  placeholder="Received amount"
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              control={currencyForm.control}
              name="receiveCurrency"
              render={({ field }) => (
                <CurrenciesSelect
                  currencies={currencies}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select currency"
                />
              )}
            />
          </div>

          <Button onClick={handleSwap} className="cursor-pointer mt-2">
            Confirm Swap
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default App;
