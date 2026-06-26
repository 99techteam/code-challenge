import { useState } from 'react';

interface Props {
  symbol: string;
  src: string;
  size?: number;
  /** Eager-load above-the-fold icons (the Pay/Receive pills); leave the
   *  off-screen modal list lazy. Defaults to lazy. */
  priority?: boolean;
}

/**
 * Renders a token's SVG icon, falling back to a coloured monogram bubble if the
 * image is missing (not every symbol has an icon in the repo).
 */
export function TokenIcon({ symbol, src, size = 32, priority = false }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    // Deterministic hue from the symbol so the fallback is stable per token.
    const hue = [...symbol].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
    return (
      <span
        className="token-icon token-icon--fallback"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.4,
          background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${
            (hue + 40) % 360
          } 70% 45%))`,
        }}
        aria-hidden
      >
        {symbol.slice(0, 3)}
      </span>
    );
  }

  return (
    <img
      className="token-icon"
      src={src}
      alt={`${symbol} icon`}
      width={size}
      height={size}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
