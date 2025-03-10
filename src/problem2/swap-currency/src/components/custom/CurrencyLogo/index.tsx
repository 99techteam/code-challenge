import { useState } from "react";

export type CurrencyLogoProps = {
  currencyCode: string;
};

export default function CurrencyLogo(props: CurrencyLogoProps) {
  const { currencyCode } = props;
  const [loadingImgError, setLoadingImgError] = useState(false);

  const url = `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${currencyCode}.svg`;

  const handleError = () => {
    setLoadingImgError(true);
  };

  // TODO: use the fallback image incase having the error of loading image
  return loadingImgError ? null : <img src={url} onError={handleError} />;
}
