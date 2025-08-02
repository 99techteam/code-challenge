
import React, { useState, useEffect } from "react";
import UpDownArrow from '@/assets/icons/arrows/UpDownArrow';
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import './index.scss'
import Button from '@/components/button/Button';
import Input from '@/components/input/Input';
import httpClient from "@/services/httpClient";
import { Crypto } from "@/types/crypto";
import SelectCrypto from "@/components/select/SelectCrypto";
import { debounce } from "@/utils/mics";

const Home = () => { 
  const [pricesData, setPricesData] = useState<Crypto[]>(null);
  const [fromCurrency, setFromCurrency] = useState<Crypto | null>(null);
  const [toCurrency, setToCurrency] = useState<Crypto | null>(null);
  const [result, setResult] = useState<number>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = Yup.object().shape({
    amount: Yup.number()
      .typeError("Must be a number")
      .required("Please fill value")
      .min(0.000001, "Value must be greater than 0"),
  });

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await httpClient.get("/prices.json");
        const rawData: Crypto[] = response.data;
        const processedData = processPriceData(rawData);
        setPricesData(processedData);
        if (processedData.length > 1) {
          setFromCurrency(processedData[0]);
          setToCurrency(processedData[1]);
        }
      } catch (err) {
        console.error("Error fetching prices:", err);
      }
    };

    fetchPrices();
  }, []);
  
  const processPriceData = (data: Crypto[]): Crypto[] => {
    const tempMap: Record<string, Price> = {};

    data.forEach((item) => {
      const { currency, date, price } = item;
      if (!tempMap[currency]) {
        tempMap[currency] = item;
      } else {
        const existing = tempMap[currency];
        const currentDate = new Date(date);
        const existingDate = new Date(existing.date);

        if (currentDate > existingDate) {
          tempMap[currency] = item;
        } else if (
          currentDate.getTime() === existingDate.getTime() &&
          price > existing.price
        ) {
          tempMap[currency] = item;
        }
      }
    });

    return Object.values(tempMap);
  };

  const getFilteredDataForFrom = () => {
    if (!pricesData || !toCurrency) return pricesData || [];
    return pricesData.filter(
      (crypto) => crypto.currency !== toCurrency.currency
    );
  };

  const getFilteredDataForTo = () => {
    if (!pricesData || !fromCurrency) return pricesData || [];
    return pricesData.filter(
      (crypto) => crypto.currency !== fromCurrency.currency
    );
  };

  const calculateExchangeValue = (
    value: number,
    sourcePrice: number,
    targetPrice: number
  ): number => {
    return Number(((value * sourcePrice) / targetPrice).toFixed(6));
  };

  const handleSwitch = (
    setFieldValue: (field: string, value: string | number) => void,
    values: { amount: string; fromCrypto?: string; toCrypto?: string }
  ) => {
    const tempFrom = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(tempFrom);

    setFieldValue("fromCrypto", toCurrency?.currency || "");
    setFieldValue("toCrypto", tempFrom?.currency || "");

    const amountInput = parseFloat(values.amount);
    if (values.amount && !isNaN(amountInput) && toCurrency && tempFrom) {
      const newResult = calculateExchangeValue(
        amountInput,
        toCurrency.price,
        tempFrom.price
      );
      setResult(newResult);
    }
  };

  const calculateResult = (
    amount: number,
    from: Crypto | null,
    to: Crypto | null
  ) => {
    if (amount > 0 && from && to) {
      if (from.currency !== to.currency) {
        const newResult = calculateExchangeValue(amount, from.price, to.price);
        setResult(newResult);
      } else {
        setResult(amount);
      }
    } else {
      setResult(undefined);
    }
  };

  const debounceResult = debounce(
    (amount: string, from: Crypto | null, to: Crypto | null) => {
      const convertValue = parseFloat(amount);
      calculateResult(convertValue, from, to);
    },
    300
  );

  const handleCryptoChange = (
    crypto: Crypto,
    type: "from" | "to",
    setFieldValue: (field: string, value: string) => void,
    amount: string
  ) => {
    if (type === "from") {
      setFromCurrency(crypto);
      setFieldValue("fromCrypto", crypto.currency);
    } else {
      setToCurrency(crypto);
      setFieldValue("toCrypto", crypto.currency);
    }
    debounceResult(
      amount,
      type === "from" ? crypto : fromCurrency,
      type === "to" ? crypto : toCurrency
    );
  };

  const handleSubmit = async (values: { amount: string }) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const amount = parseFloat(values.amount);
    if (!isNaN(amount)) calculateResult(amount, fromCurrency, toCurrency);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-screen-xl  m-auto h-screen flex flex-col items-center mt-[4rem]">
      <div className="flex flex-col gap-[3rem]">
        <div className="top-content text-center">
          <div className="uppercase text-heading-xl font-medium ">
            Make <span className="boxed-style m-[1.5rem]">a swap</span> with us
          </div>
          <div className="text-grey-60 mt-2">
            Up to 100% of the trading fees are returned in Z token. The percentage of cashback depends on your farming level.
          </div>
        </div>

        <Formik
          initialValues={{
            amount: "",
            fromCrypto: fromCurrency?.currency || "",
            toCrypto: toCurrency?.currency || "",
          }}
          enableReinitialize={false}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          className="swap-form"
        >
          {({ setFieldValue, errors, touched, values }) => {
            return (
              <Form className="bg-blue-90 rounded-lg p-4 ">
                <div className="flex gap-4 w-full items-end ">
                  <div className="w-full">
                    <Field
                      as={Input}
                      allowClear={false}
                      type="number"
                      name="amount"
                      id="amount"
                      placeholder="0.0"
                      className="text-body-s font-medium p-2 min-h-[40px] border rounded-md border-grey-100"
                      classNames={{ inputWrapper: "w-full" }}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value;
                        setFieldValue("amount", value);
                        debounceResult(value, fromCurrency, toCurrency);
                      }}
                    />
                    {touched.amount && errors.amount && (
                      <div className="text-red-40 absolute b-0 l-0">
                        {errors.amount}
                      </div>
                    )}
                  </div>

                  <div className="flex w-full justify-end items-end gap-4">
                    {pricesData && (
                      <SelectCrypto
                        data={getFilteredDataForFrom()}
                        defaultValue={fromCurrency}
                        key={fromCurrency.currency}
                        onChange={(crypto) =>
                          handleCryptoChange(
                            crypto,
                            "from",
                            setFieldValue,
                            values.amount
                          )
                        }
                        title="From"
                      />
                    )}

                    <div
                      className="rotate-90 mb-2 mr-1"
                      onClick={() => handleSwitch(setFieldValue, values)}
                    >
                      <div className="w-fit boxed-style min-h-[18px] min-w-[18px] flex items-center justify-center cursor-pointer">
                        <span className="text-white flex items-center justify-center text-center">
                          <UpDownArrow size={18} />
                        </span>
                      </div>
                    </div>

                    {pricesData && (
                      <SelectCrypto
                        data={getFilteredDataForTo()}
                        defaultValue={toCurrency}
                        key={toCurrency.currency}
                        onChange={(crypto) =>
                          handleCryptoChange(
                            crypto,
                            "to",
                            setFieldValue,
                            values.amount
                          )
                        }
                        title="To"
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="font-bold text-body-m">
                    {result !== null ? result : "-"}
                  </div>
                  <Button
                    type="submit"
                    className="swap-button mt-4 !w-[165px] font-bold"
                    theme="primary"
                    disabled={!!errors.amount || isSubmitting}
                  >
                    {isSubmitting ? "Swapping..." : "Swap"}
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}

export default Home;
