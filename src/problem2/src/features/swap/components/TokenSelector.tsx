import { useState } from "react"

import type { Token } from "@/data/tokens"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/ui/combobox"
import {
  findTokenByCurrency,
  tokens,
} from "@/features/swap/services/tokenRepository"
import { TokenOption } from "./TokenOption"

interface TokenSelectorProps {
  label: string
  selectedToken: Token | null
  onTokenSelect: (token: Token | null) => void
  isReadOnly?: boolean
}

export function TokenSelector({
  label,
  selectedToken,
  onTokenSelect,
  isReadOnly,
}: TokenSelectorProps) {
  const [inputValue, setInputValue] = useState(selectedToken?.currency ?? "")

  const handleValueChange = (value: string | null) => {
    const nextValue = value ?? ""
    setInputValue(nextValue)

    const exactMatch = findTokenByCurrency(nextValue)
    if (exactMatch) {
      onTokenSelect(exactMatch)
      return
    }

    if (nextValue === "") {
      onTokenSelect(null)
    }
  }

  return (
    <Combobox value={inputValue} onValueChange={handleValueChange}>
      <ComboboxInput
        placeholder="Token"
        showClear={!!selectedToken && !isReadOnly}
        className="token-picker"
        aria-label={`${label} token`}
      />
      <ComboboxContent className="token-picker__content">
        <ComboboxList>
          <ComboboxEmpty>No token found</ComboboxEmpty>
          {tokens.map((token) => (
            <ComboboxItem
              key={token.currency}
              value={token.currency}
              className="token-picker__item"
            >
              <TokenOption token={token} />
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
