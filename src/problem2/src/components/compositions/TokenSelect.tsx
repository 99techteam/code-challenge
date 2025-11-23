import { useEffect, useRef, useState } from 'react'
import { cn } from '../../utils/formatters/cn'
import type { Token } from '../../utils/types'
import ChevronDown from '../shared/icons/chevron-down'

type TokenSelectProps = {
  token: Token
  onChangeToken?: (token: Token) => void
  tokens: Token[]
  className?: string
}

const TokenSelect = ({
  token: selectedToken,
  onChangeToken,
  tokens: tokenList,
  className
}: TokenSelectProps) => {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={wrapperRef} className={cn('relative inline-block w-full', className)}>
      <button
        type='button'
        className='flex w-full cursor-pointer items-center justify-between rounded-full bg-[#102233] px-4 py-2 text-white'
        onClick={() => setOpen(prev => !prev)}
      >
        <div className='mr-1 flex items-center gap-2'>
          <img
            src={selectedToken.icon}
            alt={selectedToken.symbol}
            className='size-5 rounded-full'
          />
          <span>{selectedToken.symbol}</span>
        </div>

        <ChevronDown
          className={cn(
            'size-5 text-[#94a3b8] transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <ul className='absolute z-20 mt-1 w-full overflow-hidden rounded-2xl bg-[#102233] text-white shadow-lg'>
          {tokenList.map(token => (
            <li
              key={token.value}
              className='flex cursor-pointer items-center gap-2 px-4 py-2 transition-colors hover:bg-[#0b1826]'
              onClick={() => {
                onChangeToken?.(token)
                setOpen(false)
              }}
            >
              <img src={token.icon} alt={token.symbol} className='size-5' />
              {token.symbol}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default TokenSelect
