import { TokenPrices } from './token'
import { FormErrors } from './form'

export interface CurrencySwapFormProps {
  prices: TokenPrices
  pricesLoading: boolean
}

export interface TokenSelectorProps {
  tokens: string[]
  selectedToken: string
  onTokenChange: (token: string) => void
  error?: string
  disabled?: boolean
}

export interface AmountInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  placeholder?: string
}

export interface SwapButtonProps {
  isSubmitting: boolean
  disabled: boolean
}

export interface TokenImageProps {
  symbol: string
}

export interface ErrorMessageProps {
  message?: string
  className?: string
}

export type { FormErrors }

