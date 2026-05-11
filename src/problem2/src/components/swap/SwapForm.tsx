import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDataTransferVerticalIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { TokenAmountField } from "@/components/swap/TokenAmountField"
import {
  ErrorPanel,
  SkeletonForm,
  SuccessPanel,
} from "@/components/swap/SwapStatusPanels"
import { useSwapForm } from "@/hooks/useSwapForm"
import { useTokens } from "@/hooks/useTokens"
import { formatAmount } from "@/lib/format"
import { cn } from "@/lib/utils"

type SwapFormProps = {
  defaultFrom?: string
  defaultTo?: string
}

export function SwapForm({
  defaultFrom = "ETH",
  defaultTo = "USDC",
}: SwapFormProps) {
  const { tokens, isLoading, error, reload } = useTokens()
  const form = useSwapForm({ tokens, defaultFrom, defaultTo })

  if (error) {
    return <ErrorPanel message={error} onRetry={reload} />
  }

  if (isLoading || !form.fromToken || !form.toToken) {
    return <SkeletonForm />
  }

  if (form.status.kind === "success") {
    return (
      <SuccessPanel
        from={form.status.from}
        to={form.status.to}
        amountFrom={form.status.amountFrom}
        amountTo={form.status.amountTo}
        onReset={form.reset}
      />
    )
  }

  const { fromToken, toToken, parsedAmount, swapPulse } = form
  const isSubmitting = form.status.kind === "submitting"
  const fromUsd =
    Number.isFinite(parsedAmount) && parsedAmount > 0
      ? parsedAmount * fromToken.price
      : null

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.submit()
      }}
      className="relative flex flex-col gap-2"
      noValidate
    >
      <TokenAmountField
        label="You pay"
        amount={form.amount}
        token={fromToken}
        tokens={tokens}
        disabledSymbol={toToken.symbol}
        onAmountChange={form.setAmount}
        onTokenChange={form.selectFrom}
        error={form.showAmountError ? form.amountError : null}
        usdValue={fromUsd}
      />

      <div className="relative my-[-14px] flex justify-center">
        <button
          type="button"
          onClick={form.swapDirection}
          aria-label="Swap direction"
          className={cn(
            "relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition-all",
            "hover:rotate-180 hover:border-ring/40 hover:bg-muted active:scale-95",
            swapPulse && "rotate-180"
          )}
        >
          <HugeiconsIcon icon={ArrowDataTransferVerticalIcon} size={18} />
        </button>
      </div>

      <TokenAmountField
        label="You receive"
        amount={form.toAmount > 0 ? formatAmount(form.toAmount) : ""}
        token={toToken}
        tokens={tokens}
        disabledSymbol={fromToken.symbol}
        onTokenChange={form.selectTo}
        readOnlyAmount
        usdValue={form.toAmount > 0 ? form.toAmount * toToken.price : null}
        error={form.pairError}
      />

      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <span>Rate</span>
        <span className="text-right font-medium tabular-nums text-foreground">
          {form.rate
            ? `1 ${fromToken.symbol} ≈ ${formatAmount(form.rate)} ${toToken.symbol}`
            : "—"}
        </span>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={!form.canSubmit}
        className={cn(
          "mt-2 h-12 w-full rounded-xl text-sm font-semibold",
          "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        {isSubmitting ? (
          <>
            <HugeiconsIcon
              icon={Loading03Icon}
              size={18}
              className="animate-spin"
            />
            Confirming swap…
          </>
        ) : form.touched && form.amountError ? (
          form.amountError
        ) : form.pairError ? (
          form.pairError
        ) : (
          "Swap"
        )}
      </Button>
    </form>
  )
}
