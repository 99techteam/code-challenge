import { useState } from "react";

type Props = {
  symbol: string;
  src: string;
  size?: number;
  className?: string;
};

export function TokenIcon({ symbol, src, size = 28, className = "" }: Props) {
  const [failed, setFailed] = useState(false);
  const initial = symbol.slice(0, 1).toUpperCase();

  if (failed) {
    return (
      <span
        aria-label={symbol}
        className={`inline-flex items-center justify-center rounded-full bg-accent-gradient text-[10px] font-semibold text-white ${className}`}
        style={{ width: size, height: size }}
      >
        {initial}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={symbol}
      width={size}
      height={size}
      className={`rounded-full bg-white/5 ${className}`}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
