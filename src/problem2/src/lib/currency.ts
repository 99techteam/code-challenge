import { Decimal } from "decimal.js"

export const toUSD = (amount?: string | null): number => {
  if (!amount || Number.isNaN(parseFloat(amount))) return 0

  return new Decimal(amount).times(1000).toNumber()
}