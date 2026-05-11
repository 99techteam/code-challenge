import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDataTransferVerticalIcon,
  CheckmarkCircle02Icon,
  Loading03Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { TokenAmountField } from "@/components/swap/TokenAmountField"
import { useTokens } from "@/hooks/useTokens"
import { formatAmount, parseAmount } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Token } from "@/types/token"

type SwapFormProps = {
  defaultFrom?: string
  defaultTo?: string
}

type Pair = { from: string; to: string }

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | {
      kind: "success"
      from: Token
      to: Token
      amountFrom: number
      amountTo: number
    }

export function SwapForm({
  defaultFrom = "ETH",
  defaultTo = "USDC",
}: SwapFormProps) {
  const { tokens, isLoading, error, reload } = useTokens()

  // The user's manually-selected pair, if any. When null we fall back to the
  // default pair derived from `tokens`. This keeps the pair fully derived
  // from data while still allowing user overrides without an effect.
  const [userPair, setUserPair] = useState<Pair | null>(null)
  const [amount, setAmount] = useState("")
  const [touched, setTouched] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: "idle" })
  const [swapPulse, setSwapPulse] = useState(false)

  const tokenMap = useMemo(
    () => new Map(tokens.map((t) => [t.symbol, t])),
    [tokens]
  )

  const defaultPair = useMemo<Pair | null>(() => {
    if (tokens.length === 0) return null
    const fallbackFrom =
      tokens.find((t) => t.symbol === defaultFrom) ?? tokens[0]
    const fallbackTo =
      tokens.find(
        (t) => t.symbol === defaultTo && t.symbol !== fallbackFrom.symbol
      ) ??
      tokens.find((t) => t.symbol !== fallbackFrom.symbol) ??
      tokens[0]
    return { from: fallbackFrom.symbol, to: fallbackTo.symbol }
  }, [tokens, defaultFrom, defaultTo])

  const pair = userPair ?? defaultPair
  const fromToken = pair ? tokenMap.get(pair.from) ?? null : null
  const toToken = pair ? tokenMap.get(pair.to) ?? null : null

  const parsed = parseAmount(amount)
  const amountError = computeAmountError(amount, parsed)
  const pairError =
    fromToken && toToken && fromToken.symbol === toToken.symbol
      ? "Pick two different tokens"
      : null

  const showAmountError = Boolean(touched && amountError)
  const rate =
    fromToken && toToken && fromToken.symbol !== toToken.symbol
      ? fromToken.price / toToken.price
      : null

  const toAmount =
    rate && Number.isFinite(parsed) && parsed > 0 ? parsed * rate : 0

  const canSubmit = Boolean(
    !isLoading &&
      !error &&
      fromToken &&
      toToken &&
      !amountError &&
      !pairError &&
      status.kind !== "submitting"
  )

  const handleSwapDirection = () => {
    if (!pair) return
    setUserPair({ from: pair.to, to: pair.from })
    if (toAmount > 0) {
      setAmount(stripTrailingZeros(toAmount.toFixed(8)))
    }
    setSwapPulse(true)
    window.setTimeout(() => setSwapPulse(false), 400)
  }

  const handleSelectFrom = (token: Token) => {
    if (!pair) return
    // If the user picks the same token already on the other side, swap them.
    if (token.symbol === pair.to) {
      setUserPair({ from: token.symbol, to: pair.from })
    } else {
      setUserPair({ from: token.symbol, to: pair.to })
    }
  }

  const handleSelectTo = (token: Token) => {
    if (!pair) return
    if (token.symbol === pair.from) {
      setUserPair({ from: pair.to, to: token.symbol })
    } else {
      setUserPair({ from: pair.from, to: token.symbol })
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setTouched(true)
    if (!canSubmit || !fromToken || !toToken) return

    setStatus({ kind: "submitting" })
    window.setTimeout(() => {
      setStatus({
        kind: "success",
        from: fromToken,
        to: toToken,
        amountFrom: parsed,
        amountTo: toAmount,
      })
    }, 1500)
  }

  const handleReset = () => {
    setStatus({ kind: "idle" })
    setAmount("")
    setTouched(false)
  }

  if (error) {
    return <ErrorPanel message={error} onRetry={reload} />
  }

  if (isLoading || !fromToken || !toToken) {
    return <SkeletonForm />
  }

  if (status.kind === "success") {
    return (
      <SuccessPanel
        from={status.from}
        to={status.to}
        amountFrom={status.amountFrom}
        amountTo={status.amountTo}
        onReset={handleReset}
      />
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex flex-col gap-2"
      noValidate
    >
      <TokenAmountField
        label="You pay"
        amount={amount}
        token={fromToken}
        tokens={tokens}
        disabledSymbol={toToken.symbol}
        onAmountChange={(next) => {
          setAmount(next)
          if (!touched) setTouched(true)
        }}
        onTokenChange={handleSelectFrom}
        error={showAmountError ? amountError : null}
        usdValue={parsed > 0 ? parsed * fromToken.price : null}
      />

      <div className="relative my-[-14px] flex justify-center">
        <button
          type="button"
          onClick={handleSwapDirection}
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
        amount={toAmount > 0 ? formatAmount(toAmount) : ""}
        token={toToken}
        tokens={tokens}
        disabledSymbol={fromToken.symbol}
        onTokenChange={handleSelectTo}
        readOnlyAmount
        usdValue={toAmount > 0 ? toAmount * toToken.price : null}
        error={pairError}
      />

      <div className="mt-2 flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <span>Rate</span>
        <span className="font-medium text-foreground">
          {rate
            ? `1 ${fromToken.symbol} ≈ ${formatAmount(rate)} ${toToken.symbol}`
            : "—"}
        </span>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={!canSubmit}
        className={cn(
          "mt-2 h-12 w-full rounded-xl text-sm font-semibold",
          "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        {status.kind === "submitting" ? (
          <>
            <HugeiconsIcon
              icon={Loading03Icon}
              size={18}
              className="animate-spin"
            />
            Confirming swap…
          </>
        ) : touched && amountError ? (
          amountError
        ) : pairError ? (
          pairError
        ) : (
          "Swap"
        )}
      </Button>
    </form>
  )
}

function computeAmountError(raw: string, parsed: number): string | null {
  if (!raw.trim()) return "Enter an amount"
  if (Number.isNaN(parsed)) return "Amount must be a number"
  if (parsed <= 0) return "Amount must be greater than 0"
  return null
}

function stripTrailingZeros(s: string): string {
  if (!s.includes(".")) return s
  return s.replace(/\.?0+$/, "")
}

function SkeletonForm() {
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

function ErrorPanel({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
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

function SuccessPanel({
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
    <div className="animate-in fade-in zoom-in-95 flex flex-col items-center gap-4 rounded-2xl border border-border bg-card/60 px-6 py-8 text-center duration-300">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={32} />
      </div>
      <div>
        <h2 className="text-base font-semibold">Swap complete</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Your simulated trade was confirmed.
        </p>
      </div>
      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl bg-muted/40 p-3 text-xs">
        <div className="flex flex-col items-start">
          <span className="text-muted-foreground">Sent</span>
          <span className="mt-1 text-sm font-semibold tabular-nums">
            {formatAmount(amountFrom)} {from.symbol}
          </span>
        </div>
        <div className="text-muted-foreground">→</div>
        <div className="flex flex-col items-end">
          <span className="text-muted-foreground">Received</span>
          <span className="mt-1 text-sm font-semibold tabular-nums">
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
