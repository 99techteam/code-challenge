import type { Dispatch, SetStateAction } from 'react'
import { cn } from '../../utils/formatters/cn'

type AmountInputProps = {
  value: string
  onChangeValue?: Dispatch<SetStateAction<string>>
  className?: string
  disabled?: boolean
}

const normalizeAmount = (v: string): string => {
  // Default to "0" if empty
  if (v === '') return '0'

  // Auto prefix leading dot with 0
  if (v.startsWith('.')) {
    return v === '.0' ? '0.' : '0' + v
  }

  // Remove leading zeros for integers (keep decimals)
  if (/^\d+$/.test(v)) {
    return String(Number(v))
  }

  // Only allow digits + optional single decimal
  if (/^\d*\.?\d*$/.test(v)) {
    return v
  }

  // Invalid input, ignore
  return ''
}

const AmountInput = ({ value, onChangeValue, className, disabled }: AmountInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalizedValue = normalizeAmount(e.target.value)
    if (normalizedValue !== '') onChangeValue?.(normalizedValue)
  }

  return (
    <input
      type='text'
      className={cn(
        'w-full text-left text-2xl leading-relaxed font-bold focus:outline-none',
        className
      )}
      value={value}
      onChange={handleChange}
      disabled={disabled}
    />
  )
}

export default AmountInput
