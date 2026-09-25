import { useState } from 'react';

export default function TokenIcon({
  symbol,
  size = 32,
}: {
  symbol: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className="token-icon"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {failed ? (
        <span>{symbol.slice(0, 2)}</span>
      ) : (
        <img
          src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${encodeURIComponent(symbol)}.svg`}
          width={size}
          height={size}
          alt=""
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}
