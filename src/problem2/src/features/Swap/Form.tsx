import NumberFlow from "@number-flow/react"
import { ArrowRight, Loader2 } from "lucide-react"
import { Fragment } from "react"
import { toast } from "sonner"
import { TokenSelect } from "@/components/TokenSelect"
import { Label } from "@/components/ui/label"
import { SwitcherSeparator } from "@/features/Swap/SwitcherSeparator"
import { toUSD } from "@/lib/currency"
import { getToAmount } from "@/lib/number"
import { cn } from "@/lib/utils"
import type { TPriceQuote, TTrade } from "@/services/price/price.type"
import { useSwapMutation } from "@/services/swap/swap.service"
import { useWalletStore } from "@/services/wallet/wallet.service"

type TSwapFormProps = {
  quote?: TPriceQuote | null
  isLoading?: boolean
  trade?: TTrade
  onTrade: (trade?: TTrade) => void
  onSwitcher?: () => void
}

// TODO: use Tanstack Form
export const SwapForm = ({
  quote,
  isLoading,
  trade,
  onTrade: handleTrade,
  onSwitcher: handleSwitcher
}: TSwapFormProps) => {
  const { isConnected } = useWalletStore()

  const { mutate: swap, isPending: isSwapping } = useSwapMutation()

  const handleSwap = async () => {
    if (!quote) return

    swap(quote, {
      onSuccess: () => {
        handleTrade(undefined)
        toast.success("Transaction Successful ??", {
          description: `Swapped ${trade?.fromAmount} ${trade?.fromToken?.symbol} for ${toAmount} ${trade?.toToken?.symbol}`
        })
      },
      onError: () => {
        toast.error("Swap failed! ??")
      }
    })
  }

  const toAmount = getToAmount(quote?.buyAmount, trade?.toToken?.decimals)

  const validTrade = Object.values(trade || {}).every(Boolean)

  const disable = !isConnected || !validTrade || isSwapping || isLoading

  return (
    <Fragment>
      <div className="relative group/pay p-6 pb-4 transition-all duration-300 hover:bg-white/30 rounded-3xl">
        <div className="flex justify-between items-start mb-2">
          <Label className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase">
            You Pay
          </Label>

          {isConnected && trade?.fromToken && (
            <span className="text-xs text-neutral-500 font-medium">
              Balance: {trade?.fromToken?.balance}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <input
            className="w-full bg-transparent border-none p-0 text-5xl sm:text-6xl font-light text-neutral-900 placeholder-neutral-300 focus:outline-none focus:ring-0 leading-none tracking-tight transition-all duration-300 focus:scale-[1.02] origin-left"
            placeholder="0"
            type="number"
            value={trade?.fromAmount}
            onChange={e => handleTrade({ ...trade, fromAmount: e.target.value })}
          />

          <TokenSelect
            selectedToken={trade?.fromToken}
            onSelect={fromToken => handleTrade({ ...trade, fromToken })}
          />
        </div>

        <NumberFlow
          value={toUSD(trade?.fromAmount)}
          animated={false}
          locales="en-US"
          prefix="≈ "
          format={{ style: "currency", currency: "USD" }}
          className="text-sm font-medium text-neutral-400 tracking-tight"
        />
      </div>

      <SwitcherSeparator onClick={handleSwitcher} />

      <div
        className="relative group/receive p-6 pt-4 rounded-b-3xl transition-all duration-300 hover:bg-white/30 rounded-t-3xl">
        <div className="flex justify-between items-start mb-2">
          <Label className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase">
            You Receive
          </Label>
        </div>

        <div className="flex items-center justify-between gap-4 relative">
          <NumberFlow
            value={toAmount}
            className={cn(
              "w-full bg-transparent border-none p-0 text-5xl sm:text-6xl font-light text-neutral-400 focus:ring-0 leading-none tracking-tight cursor-default transition-opacity",
              isLoading && "opacity-30"
            )}
          />

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-start z-10">
              <Loader2 className="animate-spin text-neutral-600 w-8 h-8" />
            </div>
          )}

          <TokenSelect
            selectedToken={trade?.toToken}
            onSelect={toToken => handleTrade({ ...trade, toToken })}
          />
        </div>
      </div>

      <div className="px-6 pt-2 pb-4">
        <button
          type="button"
          onClick={handleSwap}
          disabled={disable}
          className={cn(
            "relative w-full overflow-hidden h-14 rounded-2xl font-bold text-lg tracking-wide shadow-lg group hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3",
            !isConnected
              ? "bg-blue-600 text-white"
              : !validTrade
                ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                : "bg-neutral-900 text-white"
          )}
        >
          {isSwapping ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              {!isConnected
                ? "Connect Wallet To Swap"
                : !trade?.fromAmount
                  ? "Enter Amount"
                  : "Swap"}
              {isConnected && !!trade?.fromAmount && (
                <ArrowRight className="text-primary group-hover:translate-x-1 transition-transform" />
              )}
            </>
          )}
        </button>
      </div>
    </Fragment>
  )
}
