import { CURRENCY_ENDPOINTS } from "@/enum/endpoints";
import axiosConfig from "../index";
import type { ICurrency } from "@/interfaces/currency";

export const getCurrencyPrice = async (): Promise<ICurrency[]> => {
  return await axiosConfig.get(CURRENCY_ENDPOINTS.PRICE);
};
