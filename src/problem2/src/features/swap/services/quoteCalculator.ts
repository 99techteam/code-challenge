import type { Token } from "@/data/tokens"

export const parseSwapAmount = (amount: string) => {
  const parsedAmount = Number(amount)
  return Number.isFinite(parsedAmount) ? parsedAmount : 0
}

export const calculateReceiveAmount = ({
  amount,
  fromToken,
  toToken,
}: {
  amount: string
  fromToken: Token | null
  toToken: Token | null
}) => {
  const parsedAmount = parseSwapAmount(amount)

  if (!fromToken || !toToken || parsedAmount <= 0) {
    return ""
  }

  return ((parsedAmount * fromToken.price) / toToken.price).toFixed(6)
}

export const calculateExchangeRate = (
  fromToken: Token | null,
  toToken: Token | null,
) => {
  if (!fromToken || !toToken) {
    return null
  }

  return fromToken.price / toToken.price
}

export const calculateNotionalValue = (
  amount: string,
  fromToken: Token | null,
) => {
  const parsedAmount = parseSwapAmount(amount)

  if (!fromToken || parsedAmount <= 0) {
    return 0
  }

  return parsedAmount * fromToken.price
}
