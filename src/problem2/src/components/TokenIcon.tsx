import { useState } from "react";

interface TokenIconProps {
  currency: string;
  size?: number;
}

export function TokenIcon({ currency, size = 28 }: TokenIconProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className="token-icon token-icon--fallback"
        style={{ width: size, height: size, fontSize: size * 0.4 }}
        aria-hidden="true"
      >
        {currency.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      className="token-icon"
      src={`/tokens/${currency}.svg`}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      onError={() => setFailed(true)}
    />
  );
}
