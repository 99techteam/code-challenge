import { useState } from 'react'

interface TokenIconProps {
  symbol: string
  iconUrl: string
  size?: number
  className?: string
}

/**
 * Renders a token's remote SVG icon, gracefully falling back to a generated
 * monogram badge when the image is missing or fails to load.
 */
export function TokenIcon({ symbol, iconUrl, size = 28, className = '' }: TokenIconProps) {
  const [failed, setFailed] = useState(false)
  const dimension = { width: size, height: size }

  if (failed) {
    // Deterministic hue from the symbol for a stable, distinct placeholder.
    let hash = 0
    for (let i = 0; i < symbol.length; i++) hash = symbol.charCodeAt(i) + ((hash << 5) - hash)
    const hue = Math.abs(hash) % 360
    return (
      <span
        aria-hidden
        className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${className}`}
        style={{
          ...dimension,
          fontSize: size * 0.4,
          background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 40) % 360} 70% 45%))`,
        }}
      >
        {symbol.slice(0, 2).toUpperCase()}
      </span>
    )
  }

  return (
    <img
      src={iconUrl}
      alt={`${symbol} icon`}
      loading="lazy"
      width={size}
      height={size}
      className={`shrink-0 rounded-full bg-white/5 ${className}`}
      style={dimension}
      onError={() => setFailed(true)}
    />
  )
}
