import { useState, useEffect } from 'react';

import { BaseBackground } from '../base-background';
import { ProviderTheme } from '../provider-theme';
import { FormPanel } from '../form-panel';
import { BaseTypography } from '../base-typography';
import { BaseRow } from '../base-row';
import { BaseCol } from '../base-col';
import { FormTokenWrap } from '../form-token-wrap';
import { FormInput } from '../form-input';
import { FormSelectToken } from '../form-select-token';
import { useGetPrice } from '../../service/get-price';
import { useConvertToken } from '../../service/convert-token';
import { IPriceData } from '../../mock-data/price';

const Form = () => {
  const { getPrice, priceData, isLoading: isLoadingPriceData } = useGetPrice();
  const [fromToken, setFromToken] = useState<IPriceData | null>(null);
  const [toToken, setToToken] = useState<IPriceData | null>(null);
  const [inputToken, setInputToken] = useState<string>('');

  const { calculateOutputToken, isLoading: isLoadingConvertToken } =
    useConvertToken({
      inputToken,
      fromToken: fromToken?.price || 0,
      toToken: toToken?.price || 0,
    });

  useEffect(() => {
    getPrice();
  }, []);

  return (
    <FormPanel>
      <BaseTypography type="heading">{'Token Exchange'}</BaseTypography>
      <BaseRow>
        <BaseCol>
          <BaseTypography type="text">{'From'}</BaseTypography>
          <FormTokenWrap
            input={<FormInput value={inputToken} onChange={setInputToken} />}
            tokenSelect={
              <FormSelectToken
                priceData={priceData}
                isLoading={isLoadingPriceData}
                onChange={setFromToken}
              />
            }
          />
        </BaseCol>
        <BaseCol>
          <BaseTypography type="text">{'To'}</BaseTypography>
          <FormTokenWrap
            input={
              <FormInput
                isLoading={isLoadingConvertToken}
                value={calculateOutputToken.toString()}
                readonly
              />
            }
            tokenSelect={
              <FormSelectToken
                priceData={priceData}
                isLoading={isLoadingPriceData}
                onChange={setToToken}
              />
            }
          />
        </BaseCol>
      </BaseRow>
    </FormPanel>
  );
};

export const App = () => {
  return (
    <ProviderTheme>
      <BaseBackground />
      <Form />
    </ProviderTheme>
  );
};
