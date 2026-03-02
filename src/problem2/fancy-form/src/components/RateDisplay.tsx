import type { Token } from '@/types/swap'

interface RateDisplayProps {
  fromToken: Token | null
  toToken: Token | null
  exchangeRate: number | null
}

export function RateDisplay({ fromToken, toToken, exchangeRate }: RateDisplayProps) {
  if (!fromToken || !toToken || exchangeRate === null) return null

  return (
    <div className="flex items-center justify-center text-sm text-muted-foreground py-1">
      <span>
        1 {fromToken.symbol} ={' '}
        <span className="text-foreground font-medium">
          {String(parseFloat(exchangeRate.toFixed(6)))} {toToken.symbol}
        </span>
      </span>
    </div>
  )
}
