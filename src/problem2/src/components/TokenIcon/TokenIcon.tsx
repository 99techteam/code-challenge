import { useEffect, useState } from "react";
import { getTokenIconUrl } from "../../lib/tokenIcon";

type Props = {
  symbol: string;
};

export function TokenIcon({ symbol }: Props) {
  const [hidden, setHidden] = useState(false);
  const [sourceIndex, setSourceIndex] = useState(0);
  const iconSources = [...new Set([symbol, symbol.toUpperCase(), symbol.toLowerCase()])].map(
    (tokenSymbol) => getTokenIconUrl(tokenSymbol),
  );

  useEffect(() => {
    setHidden(false);
    setSourceIndex(0);
  }, [symbol]);

  if (!symbol) {
    return null;
  }

  return (
    <img
      className="block h-[1.25rem] w-[1.25rem] rounded-full object-cover shadow-sm ring-[1.5px] ring-white/90 ring-offset-0 sm:h-[1.35rem] sm:w-[1.35rem]"
      src={iconSources[sourceIndex]}
      alt={hidden ? "" : `${symbol} icon`}
      style={{ display: hidden ? "none" : "block" }}
      onError={() => {
        if (sourceIndex < iconSources.length - 1) {
          setSourceIndex((previous) => previous + 1);
          return;
        }
        setHidden(true);
      }}
    />
  );
}
