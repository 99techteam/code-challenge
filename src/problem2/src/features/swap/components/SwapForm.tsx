import type { Token } from "@/data/tokens"
import { SwitchButton } from "./SwitchButton"
import { TokenAmountField } from "./TokenAmountField"

interface SwapFormProps {
  fromToken: Token | null
  toToken: Token | null
  fromAmount: string
  toAmount: string
  onFromTokenChange: (token: Token | null) => void
  onToTokenChange: (token: Token | null) => void
  onFromAmountChange: (amount: string) => void
  onSwitchTokens: () => void
}

export function SwapForm({
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  onFromTokenChange,
  onToTokenChange,
  onFromAmountChange,
  onSwitchTokens,
}: SwapFormProps) {
  return (
    <div className="swap-panel__form">
      <TokenAmountField
        label="You pay"
        selectedToken={fromToken}
        onTokenSelect={onFromTokenChange}
        amount={fromAmount}
        onAmountChange={onFromAmountChange}
      />

      <SwitchButton onClick={onSwitchTokens} />

      <TokenAmountField
        label="You receive"
        selectedToken={toToken}
        onTokenSelect={onToTokenChange}
        amount={toAmount}
        isReadOnly
      />
    </div>
  )
}
