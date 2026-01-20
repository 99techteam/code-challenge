import { Decimal } from "decimal.js"
import { Pencil } from "lucide-react"
import type { TToken } from "@/services/token/token.type"

interface DetailProps {
  price?: string
  gas?: string
  gasPrice?: string
  sellToken?: TToken
  buyToken?: TToken
  sellAmount?: string
}

const getExchangeRate = (rate?: string | null, sellToken?: TToken, buyToken?: TToken) => {
  if (!rate || !sellToken || !buyToken) return null

  const value = new Decimal(rate).toDecimalPlaces(4, Decimal.ROUND_DOWN).toString()

  return `1 ${sellToken.symbol} = ${value} ${buyToken.symbol}`
}

const getNetworkFee = (gas?: string, gasPrice?: string) => {
  if (!gas || !gasPrice) return null

  const gasVal = new Decimal(gas)
  const gasPriceVal = new Decimal(gasPrice)

  const ethCost = gasVal.times(gasPriceVal).div(1e18)
  return ethCost.times(3000).toDecimalPlaces(2, Decimal.ROUND_UP).toString()
}

const getGasWei = (gasPrice?: string) => {
  if (!gasPrice) return null
  return new Decimal(gasPrice).div(1e9).toFixed(0)
}

export const Detail = ({ price, gas, gasPrice, sellToken, buyToken }: DetailProps) => {
  return (
    <div className="grid grid-cols-2 gap-y-5 gap-x-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium tracking-wider text-neutral-400 uppercase">
            Exchange Rate
          </span>
          <div className="relative h-4 w-4">
            {/** biome-ignore lint/a11y/noSvgWithoutTitle: Decoration only */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 24 24">
              <circle
                className="text-neutral-200"
                cx="12"
                cy="12"
                fill="none"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              ></circle>
              <circle
                className="text-progress-cyan animate-progress-ring"
                cx="12"
                cy="12"
                fill="none"
                r="10"
                stroke="currentColor"
                strokeDasharray="62.83"
                strokeDashoffset="20"
                strokeLinecap="round"
                strokeWidth="3"
              ></circle>
            </svg>
          </div>
        </div>
        <span className="font-mono text-xs font-medium text-neutral-800 tracking-tight">
          {getExchangeRate(price, sellToken, buyToken) || "-"}
        </span>
      </div>
      <div className="flex flex-col items-end gap-1.5 text-right">
        <span className="text-[10px] font-medium tracking-wider text-neutral-400 uppercase">
          Price Impact
        </span>
        <span className="font-mono text-xs font-bold text-emerald-600 tracking-tight">~0.05%</span>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-medium tracking-wider text-neutral-400 uppercase">
          Slippage
        </span>
        <div className="flex items-center gap-1 group/edit cursor-pointer">
          <span className="font-mono text-xs font-medium text-neutral-800 tracking-tight">
            Auto (0.5%)
          </span>
          <Pencil
            className="material-symbols-outlined size-[10px] text-neutral-400 group-hover/edit:text-primary transition-colors" />
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 text-right">
        <div className="flex items-center gap-1.5">
          <span className="relative flex size-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full size-1.5 bg-primary"></span>
          </span>
          <span className="text-[10px] font-medium tracking-wider text-neutral-400 uppercase">
            Network Fee
          </span>
        </div>
        <span className="font-mono text-xs font-medium text-neutral-800 tracking-tight">
          ${getNetworkFee(gas, gasPrice) || "0.00"}{" "}
          <span className="text-neutral-400 font-normal">({getGasWei(gasPrice) || "0"} Gwei)</span>
        </span>
      </div>
    </div>
  )
}
