import { useState, useEffect } from 'react';
import useCurrencyModel from '../models/CurrencyModel';

const DEFAULT_VALUE = "0.0000000";

export function useSwapViewModel() {
  const {
    getAllCurrencies,
    calculateExchangeRate,
    convertAmount
  } = useCurrencyModel();
  
  const defaultFromCurrency = {
    currency: "XTZ",
    price: 1,
    image: `/src/images/ETH.svg`, 
  };
  
  const defaultToCurrency = {
    currency: "Ctez",
    price: 1,
    image: `/src/images/stATOM.svg`,
  };

  const [fromValue, setFromValue] = useState(DEFAULT_VALUE);
  const [toValue, setToValue] = useState(DEFAULT_VALUE);
  const [fromCurrency, setFromCurrency] = useState(defaultFromCurrency);
  const [toCurrency, setToCurrency] = useState(defaultToCurrency);
  const [errors, setErrors] = useState({});  const [isConnecting, setIsConnecting] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  
  useEffect(() => {
    setCurrencies(getAllCurrencies());
  }, [getAllCurrencies]);    const validateInput = (value) => {
    // Check for empty value
    if (!value || value === DEFAULT_VALUE) {
      return "Please enter an amount";
    }
    
 
    
    // Check if value is a valid positive number
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return "Please enter a valid number";
    } 
    
    if (numValue <= 0) {
      return "Please enter a positive number";
    }
    
    return null;
  };

  useEffect(() => {
    if (fromValue && !isNaN(parseFloat(fromValue)) && parseFloat(fromValue) > 0) {
      const calculatedValue = convertAmount(fromValue, fromCurrency, toCurrency);
      setToValue(calculatedValue);
      
      if (errors.fromValue || errors.toValue) {
        setErrors({});
      }
    } else if (fromValue === DEFAULT_VALUE) {
      setToValue(DEFAULT_VALUE);
    }
  }, [fromValue, fromCurrency, toCurrency, errors]);

  const handleSwap = () => {
    const tempCurrency = fromCurrency;
    const tempValue = fromValue;

    setFromCurrency(toCurrency);
    setToCurrency(tempCurrency);
    setFromValue(toValue);
    setToValue(tempValue);
  };

  const validateFields = () => {
    const error = validateInput(fromValue);
    if (error) {
      setErrors({ fromValue: error });
      return false;
    }
    return true;
  };

  const handleConnectWallet = () => {
    if (!validateFields()) {
      return;
    }

    setIsConnecting(true);

    setTimeout(() => {
      setIsConnecting(false);
      alert("Swap successfully");
    }, 1500);
  };

  return {
    fromValue,
    setFromValue,
    toValue,
    setToValue,
    fromCurrency,
    setFromCurrency,
    toCurrency,
    setToCurrency,
    currencies,
    errors,
    isConnecting,
    handleSwap,
    handleConnectWallet,
    calculateExchangeRate
  };
}

export default useSwapViewModel;