import { MAX_UI_DECIMALS } from '../../utils/constants'
import { cn } from '../../utils/formatters/cn'
import { limitDecimals } from '../../utils/formatters/converter'
import type { Token } from '../../utils/types'
import EqualApproximately from '../shared/icons/equal-approximately'

type ExchangeRateProps = {
  rate: number
  fromToken: Token
  toToken: Token
  className?: string
}

const ExchangeRate = ({ rate, fromToken, toToken, className }: ExchangeRateProps) => {
  const formattedRate = limitDecimals(rate, MAX_UI_DECIMALS)

  const approx = <EqualApproximately className='mb-0.5 inline-block size-3' />

  return (
    <p className={cn('w-full items-center text-right text-sm text-[#94a3b8]', className)}>
      1 {fromToken.symbol} {approx} {formattedRate} {toToken.symbol}
    </p>
  )
}

export default ExchangeRate
