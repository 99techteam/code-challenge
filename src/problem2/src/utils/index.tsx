import { DECIMAL, LOWEST_PRIORITY, TokenMap } from '@/constants'
import type { Prices, RawPrices } from '@/types'
import BigNumber from 'bignumber.js'

const transformPrices = (prices: RawPrices) => {
  return prices.reduce((acc, price) => {
    acc[price.currency.toLowerCase()] = price.price.toString()
    return acc
  }, {} as Prices)
}

const getPriority = (token: string) => {
  return TokenMap[token]?.priority ?? LOWEST_PRIORITY
}

const sortTokens = (tokens: string[]) => {
  return tokens.sort((a, b) => getPriority(a) - getPriority(b))
}

export { transformPrices, sortTokens, getPriority }

export const getBigNumber = (value: string) => {
  return new BigNumber(value)
}

export const toDecimal = (value: BigNumber) => {
  return new BigNumber(value).decimalPlaces(DECIMAL)
}
