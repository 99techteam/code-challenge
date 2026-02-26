// ── Presentation Component: TokenIcon ────────────────────────────────────────

const TOKEN_ICON_BASE =
  "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";

export const getTokenIcon = (symbol: string) => `${TOKEN_ICON_BASE}/${symbol}.svg`;

interface TokenIconProps {
  symbol: string;
  size?: number;
  imgErrors: Record<string, boolean>;
  setImgErrors: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export function TokenIcon({ symbol, size = 28, imgErrors, setImgErrors }: TokenIconProps) {
  if (imgErrors[symbol]) {
    return (
      <div
        className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
        style={{
          width: size,
          height: size,
          background: `hsl(${(symbol.charCodeAt(0) * 37) % 360}, 65%, 55%)`,
          fontSize: size * 0.38,
        }}
      >
        {symbol[0]}
      </div>
    );
  }

  return (
    <img
      src={getTokenIcon(symbol)}
      alt={symbol}
      width={size}
      height={size}
      className="rounded-full flex-shrink-0 object-contain"
      onError={() => setImgErrors((p) => ({ ...p, [symbol]: true }))}
    />
  );
}