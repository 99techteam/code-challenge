import { type Dispatch, type SetStateAction } from 'react'
import { cn } from '../../utils/formatters/cn'
import { convertToDollar } from '../../utils/formatters/converter'
import { TokenCardType, type Token } from '../../utils/types'
import EqualApproximately from '../shared/icons/equal-approximately'
import AmountInput from './AmountInput'
import TokenSelect from './TokenSelect'

type TokenCardProps = {
  type: TokenCardType
  token: Token
  onChangeToken?: Dispatch<SetStateAction<Token>>
  amount: string
  onChangeAmount?: Dispatch<SetStateAction<string>>
  tokens: Token[]
  className?: string
  disabled?: boolean
}

const TokenCard = ({
  type,
  token: selectedToken,
  onChangeToken,
  amount = '0',
  onChangeAmount,
  tokens: tokenList,
  className,
  disabled
}: TokenCardProps) => {
  return (
    <div
      className={cn(
        'mt-3 rounded-xl border border-[rgba(255,255,255,0.02)] bg-linear-to-b from-white/1 to-white/0.5 p-4',
        className
      )}
    >
      <div className='mb-2 flex justify-between'>
        <p className='font-mono text-xs tracking-wide text-[#94a3b8]/40'>{type}</p>
        {type === TokenCardType.BUY && (
          <p className={cn('mr-2.5 text-right text-xs text-[#94a3b8]', { 'opacity-70': disabled })}>
            <EqualApproximately className='mb-0.5 inline-block size-3' />
            {convertToDollar((selectedToken?.price ?? 0) * Number(amount))}
          </p>
        )}
      </div>
      <div className='flex items-center justify-between gap-3'>
        <AmountInput
          value={amount}
          onChangeValue={onChangeAmount}
          className={cn('text-left', { 'opacity-70': disabled })}
          disabled={disabled}
        />
        <TokenSelect
          token={selectedToken}
          onChangeToken={onChangeToken}
          tokens={tokenList}
          className='max-w-fit'
        />
      </div>
    </div>
  )
}

export default TokenCard
