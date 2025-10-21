import { useState } from 'react';
import { PRICE_DATA, IPriceData } from '../mock-data/price';

export const useGetPrice = () => {
  const [priceData, setPriceData] = useState<IPriceData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getPrice = async () => {
    setIsLoading(true);

    return await new Promise(resolve => {
      setTimeout(() => {
        setPriceData(PRICE_DATA);
        setIsLoading(false);
        resolve(true);
      }, 2000);
    });
  };

  return { getPrice, priceData, isLoading };
};
