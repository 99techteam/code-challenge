import type { Token } from "@/data/tokens"
import {
  fallbackTokenIconUrl,
  getTokenIconUrl,
} from "@/shared/assets/tokenIcons"
import { formatTokenPrice } from "@/shared/lib/formatters"

interface TokenOptionProps {
  token: Token
}

export function TokenOption({ token }: TokenOptionProps) {
  return (
    <>
      <img
        src={getTokenIconUrl(token.currency)}
        alt=""
        width={24}
        height={24}
        className="token-icon"
        onError={(event) => {
          const image = event.currentTarget
          if (image.src.endsWith("/Token.svg")) {
            return
          }

          image.src = fallbackTokenIconUrl
        }}
      />
      <span className="token-picker__name">{token.currency}</span>
      <span className="token-picker__price">{formatTokenPrice(token.price)}</span>
    </>
  )
}
