import { useState, useEffect } from 'react';
import { PRICE_DATA, IPriceData } from '../mock-data/price';

interface UseConvertTokenProps {
  inputToken: string | number;
  fromToken: string | number;
  toToken: string | number;
}

export const useConvertToken = ({
  inputToken,
  fromToken,
  toToken,
}: UseConvertTokenProps) => {
  const [calculateOutputToken, setCalculateOutputToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (
      inputToken &&
      fromToken &&
      toToken &&
      Number(inputToken) > 0 &&
      Number(fromToken) > 0 &&
      Number(toToken) > 0 &&
      inputToken !== ''
    ) {
      setIsLoading(true);

      setTimeout(() => {
        setCalculateOutputToken(
          (
            (Number(inputToken) * Number(fromToken)) /
            Number(toToken)
          ).toString()
        );
        setIsLoading(false);
      }, 1500);
    }
  }, [inputToken, fromToken, toToken]);

  return { calculateOutputToken, isLoading };
};
