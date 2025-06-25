import { useState, useEffect } from 'react';
import { DATA } from "../data";

const useCurrency = () => {
  const [currencyData, setCurrencyData] = useState({});
  const [currencyOptions, setCurrencyOptions] = useState([]);
  
  useEffect(() => {
    const processedData = processCurrencyData();
    setCurrencyData(processedData);
    setCurrencyOptions(Object.values(processedData));
  }, []);
  
  const processCurrencyData = () => {
    return DATA.reduce((acc, item) => {
      if (!acc[item.currency]) {
        acc[item.currency] = {
          currency: item.currency,
          price: item.price,
          image: `/src/images/${item.currency}.svg`,
        };
      }
      return acc;
    }, {});
  };
  
  const calculateExchangeRate = (fromCurrency, toCurrency) => {
    return toCurrency.price / fromCurrency.price;
  };
  
  const convertAmount = (amount, fromCurrency, toCurrency) => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return "0.0000000";
    }

    const rate = calculateExchangeRate(fromCurrency, toCurrency);
    return (parseFloat(amount) * rate).toFixed(7);
  };
  
  const getCurrencyBySymbol = (symbol) => {
    return currencyData[symbol] || null;
  };
  
  const getAllCurrencies = () => {
    return currencyOptions;
  };
  
  return {
    currencyData,
    currencyOptions,
    calculateExchangeRate,
    convertAmount,
    getCurrencyBySymbol,
    getAllCurrencies
  };
};

export default useCurrency;