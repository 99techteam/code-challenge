import axios from 'axios';
import { TokenPricesSchema, type TokenPriceMap } from '@/schema/TokenPrice';
import { useQuery } from '@tanstack/react-query';

const PRICE_URL = 'https://interview.switcheo.com/prices.json';

export const fetchTokenPrices = async (): Promise<TokenPriceMap> => {
  const { data } = await axios.get(PRICE_URL);
  try {
    const parsedData = TokenPricesSchema.parse(data);
    const latestData: TokenPriceMap = {};
    parsedData.forEach((item) => {
      latestData[item.currency] = item.price;
    });
    return latestData;
  } catch (err) {
    console.error('Invalid API response:', err);
    throw new Error('Invalid API response');
  }
};

export const useGetTokenPrices = () => {
  return useQuery<TokenPriceMap>({
    queryKey: ['tokenPrices'],
    queryFn: fetchTokenPrices,
    staleTime: 1000 * 60,
  });
};
