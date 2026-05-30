import { useState } from 'react';
import { iconUrl } from '../tokenIcon';

interface Props {
  symbol: string;
  size?: number;
}

// Renders the Switcheo SVG icon for a token, falling back to a coloured
// letter avatar if the network request fails (not every symbol in the
// price feed has an icon in the repo).
export function TokenIcon({ symbol, size = 28 }: Props) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    const hue = symbolHue(symbol);
    return (
      <span
        className="token-fallback"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.42,
          background: `hsl(${hue} 60% 32%)`,
          color: `hsl(${hue} 90% 85%)`,
        }}
      >
        {symbol.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={iconUrl(symbol)}
      alt={`${symbol} icon`}
      width={size}
      height={size}
      className="token-icon"
      onError={() => setErrored(true)}
    />
  );
}

const symbolHue = (symbol: string): number => {
  let h = 0;
  for (let i = 0; i < symbol.length; i++) {
    h = (h * 31 + symbol.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 360;
};
