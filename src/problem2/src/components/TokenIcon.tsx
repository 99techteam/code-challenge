import { useState } from 'react'
import { TOKEN_ICON_BASE } from '../configs'

interface TokenIconProps {
  currency: string
  size?: number
  className?: string
}

export function TokenIcon({ currency, size = 24, className }: TokenIconProps) {
  const [failedFor, setFailedFor] = useState('')
  const failed = failedFor !== '' && failedFor === currency

  const wrapperStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  }

  if (!currency || failed) {
    return (
      <span
        className={className}
        style={{
          ...wrapperStyle,
          background: 'rgba(0,0,0,0.15)',
          color: 'rgba(0,0,0,0.45)',
          fontSize: Math.max(10, size * 0.45),
          fontWeight: 600,
        }}
        aria-hidden
      >
        {currency ? currency.charAt(0) : ''}
      </span>
    )
  }

  return (
    <img
      src={`${TOKEN_ICON_BASE}/${currency}.svg`}
      alt=""
      width={size}
      height={size}
      className={className}
      style={wrapperStyle}
      onError={() => setFailedFor(currency)}
      loading="lazy"
    />
  )
}
