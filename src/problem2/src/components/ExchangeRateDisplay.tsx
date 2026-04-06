interface ExchangeRateDisplayProps {
  fromSymbol?: string
  toSymbol?: string
  rate: number
  isLoading?: boolean
}

export default function ExchangeRateDisplay({
  fromSymbol,
  toSymbol,
  rate,
  isLoading = false,
}: ExchangeRateDisplayProps) {
  if (!fromSymbol || !toSymbol) {
    return null
  }

  return (
    <div className="text-sm text-slate-500 text-center">
      <span className="font-semibold">1 {fromSymbol}</span> ={' '}
      <span className="font-semibold">
        {isLoading ? '...' : rate.toLocaleString('en-US', {
          maximumFractionDigits: 6,
          minimumFractionDigits: 2,
        })}
      </span>{' '}
      <span className="font-semibold">{toSymbol}</span>
    </div>
  )
}
