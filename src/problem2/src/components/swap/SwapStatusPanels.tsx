import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { formatAmount } from "@/lib/format"
import type { Token } from "@/types/token"

export function SkeletonForm() {
  return (
    <div className="flex animate-pulse flex-col gap-2">
      <div className="h-[112px] rounded-2xl bg-muted/60" />
      <div className="my-[-14px] flex justify-center">
        <div className="h-10 w-10 rounded-full bg-muted/60" />
      </div>
      <div className="h-[112px] rounded-2xl bg-muted/60" />
      <div className="mt-2 h-9 rounded-xl bg-muted/50" />
      <div className="mt-2 h-12 rounded-xl bg-muted/60" />
    </div>
  )
}

export function ErrorPanel({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-10 text-center sm:px-6">
      <h2 className="text-base font-semibold text-foreground">
        Couldn&apos;t load token prices
      </h2>
      <p className="max-w-xs text-xs text-muted-foreground">{message}</p>
      <Button
        type="button"
        onClick={onRetry}
        variant="outline"
        size="lg"
        className="mt-1"
      >
        <HugeiconsIcon icon={RefreshIcon} size={14} />
        Retry
      </Button>
    </div>
  )
}

export function SuccessPanel({
  from,
  to,
  amountFrom,
  amountTo,
  onReset,
}: {
  from: Token
  to: Token
  amountFrom: number
  amountTo: number
  onReset: () => void
}) {
  return (
    <div className="animate-in fade-in zoom-in-95 flex flex-col items-center gap-4 rounded-2xl border border-border bg-card/60 px-4 py-8 text-center duration-300 sm:px-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={32} />
      </div>
      <div>
        <h2 className="text-base font-semibold">Swap complete</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Your simulated trade was confirmed.
        </p>
      </div>
      <div className="grid w-full grid-cols-1 items-center gap-3 rounded-xl bg-muted/40 p-3 text-xs sm:grid-cols-[1fr_auto_1fr] sm:gap-3">
        <div className="flex min-w-0 flex-col">
          <span className="text-muted-foreground">Sent</span>
          <span className="mt-1 w-full truncate text-sm font-semibold tabular-nums">
            {formatAmount(amountFrom)} {from.symbol}
          </span>
        </div>
        <div className="hidden text-muted-foreground sm:block">→</div>
        <div className="flex min-w-0 flex-col sm:items-end">
          <span className="text-muted-foreground sm:text-right">Received</span>
          <span className="mt-1 w-full truncate text-sm font-semibold tabular-nums sm:text-right">
            {formatAmount(amountTo)} {to.symbol}
          </span>
        </div>
      </div>
      <Button
        type="button"
        onClick={onReset}
        size="lg"
        className="w-full rounded-xl"
      >
        Make another swap
      </Button>
    </div>
  )
}
