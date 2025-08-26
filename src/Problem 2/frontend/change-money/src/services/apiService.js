import axios from "axios";

const API_BASE_URL = "http://localhost:9000"; 

export const fetchCurrencies = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/currencies`);
  return response.data.currencies;
};

export const convertCurrency = async (variables) => {
  const response = await axios.get(`${API_BASE_URL}/api/convert`, {
    params: variables,
  });
  return response.data;
};
