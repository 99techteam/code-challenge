import { memo, useState } from "react";

const ICON_BASE = "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/";

// Price symbols that differ in case from the icon file names.
const ICON_FILE: Record<string, string> = {
  STLUNA: "stLUNA",
  STEVMOS: "stEVMOS",
  RATOM: "rATOM",
  STATOM: "stATOM",
  STOSMO: "stOSMO",
};

interface Props {
  symbol: string;
  size?: number;
}

function TokenIcon({ symbol, size = 28 }: Props) {
  const [failedFor, setFailedFor] = useState<string>();
  const style = { width: size, height: size };

  if (failedFor === symbol) {
    return (
      <span className="icon icon-fallback" style={{ ...style, fontSize: size * 0.42 }} aria-hidden="true">
        {symbol.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    <img
      className="icon"
      style={style}
      src={`${ICON_BASE}${ICON_FILE[symbol] ?? symbol}.svg`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailedFor(symbol)}
    />
  );
}

export default memo(TokenIcon);
