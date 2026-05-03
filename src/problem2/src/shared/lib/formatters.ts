export const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
})

export const tokenAmountFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 6,
})

export const formatCurrency = (value: number) => currencyFormatter.format(value)

export const formatTokenAmount = (value: number) =>
  tokenAmountFormatter.format(value)

export const formatTokenPrice = (price: number) => {
  if (price >= 1) {
    return `$${price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
  }

  return `$${price.toLocaleString("en-US", { maximumSignificantDigits: 4 })}`
}
