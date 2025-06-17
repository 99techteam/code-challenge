import axios from "axios";
import type { Price } from "types/price";
import { uniqWith, isEqual } from "lodash";
import { getFileNames } from "./getFileNames";

export const getPrices = async () => {
  const response = await axios.get<Omit<Price, "icon">[]>(
    `${import.meta.env.VITE_BASE_URL_PRICE}/prices.json`
  );
  const fileNames = await getFileNames();
  return uniqWith(
    response.data.map((price) => {
      const fileName = fileNames.find(f => f.toLowerCase() === price.currency.toLowerCase());
      return {
        ...price,
        icon: `${import.meta.env.VITE_BASE_URL_ICON}/${fileName}.svg`,
      } as Price;
    }),
    isEqual
  );
};
