import { formatUnits } from "ethers"

export const toTokenAmount = (amount?: string | number | null, decimals = 18): string => {
  if (!amount) return "0"

  try {
    let amountStr = amount.toString()

    if (amountStr.toLowerCase().includes('e')) {
      amountStr = Number(amount).toLocaleString('fullwide', { useGrouping: false })
    }

    let [integer, fraction = ""] = amountStr.split(".")

    fraction = fraction.padEnd(decimals, "0").slice(0, decimals)

    return BigInt(`${integer}${fraction}`).toString()
  } catch (error) {
    console.error("Invalid amount", error)
    return "0"
  }
}

export const getToAmount = (amount?: string | bigint | null, decimals = 18): number => {
  if (!amount) return 0

  try {
    const formattedStr = formatUnits(amount.toString(), decimals)

    return parseFloat(formattedStr)
  } catch (error) {
    console.error("Invalid amount", error)
    return 0
  }
}
