import { useId, useMemo } from "react"
import type { ChangeEvent } from "react"

import type { Token } from "@/data/tokens"
import { Input } from "@/shared/ui/input"
import { formatTokenPrice } from "@/shared/lib/formatters"
import { TokenSelector } from "./TokenSelector"

interface TokenAmountFieldProps {
  label: string
  selectedToken: Token | null
  onTokenSelect: (token: Token | null) => void
  amount: string
  onAmountChange?: (value: string) => void
  isReadOnly?: boolean
}

const sanitizeDecimalInput = (value: string) => value.replace(",", ".")

export function TokenAmountField({
  label,
  selectedToken,
  onTokenSelect,
  amount,
  onAmountChange,
  isReadOnly,
}: TokenAmountFieldProps) {
  const amountId = useId()
  const selectedPrice = useMemo(
    () => (selectedToken ? formatTokenPrice(selectedToken.price) : "Select token"),
    [selectedToken],
  )

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = sanitizeDecimalInput(event.target.value)
    if (/^\d*\.?\d*$/.test(nextValue)) {
      onAmountChange?.(nextValue)
    }
  }

  return (
    <div className="token-box">
      <div className="token-box__header">
        <label htmlFor={amountId}>{label}</label>
        <span>{selectedPrice}</span>
      </div>

      <div className="token-box__body">
        <Input
          id={amountId}
          type="text"
          inputMode="decimal"
          className="token-amount"
          placeholder="0.00"
          value={amount}
          onChange={onAmountChange ? handleAmountChange : undefined}
          readOnly={isReadOnly}
          aria-label={`${label} amount`}
        />

        <TokenSelector
          key={selectedToken?.currency ?? "empty"}
          label={label}
          selectedToken={selectedToken}
          onTokenSelect={onTokenSelect}
          isReadOnly={isReadOnly}
        />
      </div>
    </div>
  )
}
