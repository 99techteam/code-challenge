import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { amountToInputString, parseAmountInput } from "@/lib/amountInput";
import { getMockBalance, pickDefaultPair } from "@/lib/mockBalance";
import {
  convertAmount,
  fetchTokenPrices,
  formatTokenAmount,
  type TokenPrice,
} from "@/lib/prices";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownUpIcon,
  CheckIcon,
  CircleAlertIcon,
  Loader2Icon,
  SearchIcon,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import TokenIcon from "./TokenIcon";

const amountFieldClass =
  "h-12 min-h-12 w-full min-w-0 rounded-xl border border-input bg-transparent px-3 py-0 font-mono text-lg tabular-nums transition-colors outline-none dark:bg-input/30";

const SUBMIT_DELAY_MS = 1800;

const formatUsdPrice = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: n > 0 && n < 0.0001 ? "scientific" : "standard",
    maximumFractionDigits: n >= 1 ? 4 : 8,
  }).format(n);

const tokenSelectTriggerClass = cn(
  "flex min-h-12 h-12 w-full min-w-0 max-w-full items-center justify-between gap-2 rounded-lg border-0 bg-transparent px-2.5 py-0 shadow-none transition-colors",
  "hover:bg-muted/35 data-[state=open]:bg-muted/45",
  "focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-0 focus-visible:outline-none",
  "data-placeholder:text-muted-foreground",
  "[&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:text-left [&_[data-slot=select-value]]:font-semibold [&_[data-slot=select-value]]:text-base [&_[data-slot=select-value]]:tracking-tight [&_[data-slot=select-value]]:leading-none",
  "[&>svg:last-of-type]:size-4 [&>svg:last-of-type]:shrink-0 [&>svg:last-of-type]:text-muted-foreground [&>svg:last-of-type]:transition-transform data-[state=open]:[&>svg:last-of-type]:rotate-180",
);

const tokenSelectContentClass =
  "max-h-[min(22rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] rounded-xl border border-border/90 bg-popover p-0 shadow-2xl shadow-black/40";

interface TokenSelectBlockProps {
  id: string;
  ariaLabel: string;
  value: string;
  tokens: TokenPrice[];
  onValueChange: (v: string) => void;
}

const TokenSelectBlock = ({
  id,
  ariaLabel,
  value,
  tokens,
  onValueChange,
}: TokenSelectBlockProps) => {
  const [tokenQuery, setTokenQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredTokens = useMemo(() => {
    const q = tokenQuery.trim().toLowerCase();
    if (q === "") {
      return tokens;
    }
    return tokens.filter((t) => t.currency.toLowerCase().includes(q));
  }, [tokens, tokenQuery]);

  return (
    <div className="min-w-0 flex-1">
      <Select
        value={value}
        onValueChange={onValueChange}
        onOpenChange={(open) => {
          if (open) {
            queueMicrotask(() => {
              searchInputRef.current?.focus();
            });
          } else {
            setTokenQuery("");
          }
        }}
      >
        <SelectTrigger id={id} aria-label={ariaLabel} className={tokenSelectTriggerClass}>
          {value ? (
            <TokenIcon currency={value} className="size-8 shrink-0" />
          ) : (
            <span className="size-8 shrink-0 rounded-full bg-muted/50" aria-hidden />
          )}
          <SelectValue placeholder="Token" />
        </SelectTrigger>
        <SelectContent
          position="popper"
          sideOffset={8}
          align="start"
          className={tokenSelectContentClass}
        >
          <div className="sticky top-0 z-10 border-b border-border/80 bg-popover px-2 pb-2 pt-2">
            <div className="relative">
              <SearchIcon
                className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="Search symbol…"
                value={tokenQuery}
                autoComplete="off"
                spellCheck={false}
                aria-label="Filter tokens"
                className="h-9 pl-9 text-sm"
                onChange={(e) => {
                  setTokenQuery(e.target.value);
                }}
                onKeyDown={(e) => {
                  e.stopPropagation();
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
              />
            </div>
          </div>
          <div className="p-1.5 pt-1">
            {filteredTokens.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                No token matches &quot;{tokenQuery.trim()}&quot;
              </div>
            ) : (
              filteredTokens.map((t) => (
                <SelectItem
                  key={t.currency}
                  value={t.currency}
                  textValue={t.currency}
                  textLabel={t.currency}
                  className="cursor-pointer rounded-lg py-2.5 pr-10 pl-2 text-left data-highlighted:bg-primary/12 data-[state=checked]:bg-primary/15"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <TokenIcon currency={t.currency} className="size-8 shrink-0" />
                    <span className="flex min-w-0 flex-col gap-0.5 leading-tight">
                      <span className="font-semibold tracking-tight">{t.currency}</span>
                      <span className="truncate font-mono text-xs text-muted-foreground tabular-nums">
                        {formatUsdPrice(t.price)}
                      </span>
                    </span>
                  </span>
                </SelectItem>
              ))
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
};

const SwapForm = () => {
  const [tokens, setTokens] = useState<TokenPrice[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [fromCurrency, setFromCurrency] = useState("");
  const [toCurrency, setToCurrency] = useState("");
  const [amountIn, setAmountIn] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoadingPrices(true);
      setLoadError(null);
      try {
        const list = await fetchTokenPrices();
        if (!cancelled) {
          const pair = pickDefaultPair(list);
          setTokens(list);
          setFromCurrency(pair.from);
          setToCurrency(pair.to);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Failed to load prices");
        }
      } finally {
        if (!cancelled) {
          setLoadingPrices(false);
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const priceByCurrency = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of tokens) {
      m.set(t.currency, t.price);
    }
    return m;
  }, [tokens]);

  const fromPrice = fromCurrency ? (priceByCurrency.get(fromCurrency) ?? 0) : 0;
  const toPrice = toCurrency ? (priceByCurrency.get(toCurrency) ?? 0) : 0;

  const parsedIn = useMemo(() => parseAmountInput(amountIn), [amountIn]);
  const numericIn = parsedIn.kind === "ok" ? parsedIn.value : 0;
  const balanceFrom = fromCurrency ? getMockBalance(fromCurrency) : 0;

  const amountOut = useMemo(() => {
    if (
      parsedIn.kind !== "ok" ||
      fromPrice <= 0 ||
      toPrice <= 0 ||
      fromCurrency === toCurrency
    ) {
      return 0;
    }
    return convertAmount(numericIn, fromPrice, toPrice);
  }, [
    fromCurrency,
    fromPrice,
    numericIn,
    parsedIn.kind,
    toCurrency,
    toPrice,
  ]);

  const sameToken = fromCurrency !== "" && fromCurrency === toCurrency;
  const exceedsBalance =
    parsedIn.kind === "ok" && numericIn > balanceFrom + 1e-12;

  const validationMessage = useMemo(() => {
    if (sameToken) {
      return "Choose two different assets";
    }
    if (parsedIn.kind === "invalid") {
      return parsedIn.message;
    }
    if (exceedsBalance) {
      return `Demo balance is ${formatTokenAmount(balanceFrom)} ${fromCurrency}`;
    }
    return null;
  }, [
    amountIn,
    balanceFrom,
    exceedsBalance,
    fromCurrency,
    parsedIn,
    sameToken,
  ]);

  const rate =
    fromPrice > 0 && toPrice > 0 && fromCurrency && toCurrency && !sameToken
      ? fromPrice / toPrice
      : null;

  const canSubmit =
    !loadingPrices &&
    tokens.length >= 2 &&
    !sameToken &&
    parsedIn.kind === "ok" &&
    numericIn > 0 &&
    !exceedsBalance &&
    Number.isFinite(amountOut) &&
    amountOut > 0 &&
    !submitting;

  const flip = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmountIn(amountToInputString(amountOut));
    setSuccessMessage(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      return;
    }
    setSuccessMessage(null);
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setSuccessMessage(
        `Swap queued (demo): ${formatTokenAmount(numericIn, 6)} ${fromCurrency} → ${formatTokenAmount(amountOut, 6)} ${toCurrency}`,
      );
      setAmountIn("");
    }, SUBMIT_DELAY_MS);
  };

  if (loadingPrices && tokens.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex min-h-[420px] w-full max-w-md flex-col items-center justify-center gap-4 rounded-3xl border border-border/60 bg-card/80 p-10 shadow-card backdrop-blur-md"
        role="status"
        aria-live="polite"
      >
        <Loader2Icon className="size-10 animate-spin text-primary" aria-hidden />
        <p className="text-center text-sm text-muted-foreground">
          Loading market prices…
        </p>
      </motion.div>
    );
  }

  if (loadError || tokens.length < 2) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex w-full max-w-md flex-col gap-3 rounded-3xl border border-destructive/30 bg-destructive/10 p-8 shadow-card backdrop-blur-md"
        role="alert"
      >
        <div className="flex items-start gap-3">
          <CircleAlertIcon
            className="mt-0.5 size-5 shrink-0 text-destructive"
            aria-hidden
          />
          <div>
            <p className="font-semibold text-foreground">Could not load swap data</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {loadError ?? "Need at least two priced tokens."}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="mt-2 w-full sm:w-auto"
          onClick={() => {
            setLoadError(null);
            setLoadingPrices(true);
            fetchTokenPrices()
              .then((list) => {
                const pair = pickDefaultPair(list);
                setTokens(list);
                setFromCurrency(pair.from);
                setToCurrency(pair.to);
              })
              .catch((err: unknown) => {
                setLoadError(err instanceof Error ? err.message : "Request failed");
              })
              .finally(() => {
                setLoadingPrices(false);
              });
          }}
        >
          Retry
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md"
    >
      <Card className="relative overflow-hidden border-border/80 bg-card/95 shadow-glow backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 bg-grid-fade opacity-90" />
        <form onSubmit={handleSubmit} className="relative">
          <CardHeader className="space-y-1 pb-2">
            <p className="font-mono text-xs font-medium uppercase tracking-widest text-primary">
              Cross-asset
            </p>
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Swap
            </CardTitle>
            <CardDescription>
              Live rates from the interview feed. Confirm simulates a short delay.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-2">
            <motion.div
              layout
              className="space-y-3 rounded-2xl border border-border/60 bg-secondary/30 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label className="text-foreground/80">You pay</Label>
                <span className="font-mono text-xs text-muted-foreground">
                  Demo:{" "}
                  <span className="text-primary">
                    {fromCurrency ? formatTokenAmount(balanceFrom, 6) : "—"}{" "}
                    {fromCurrency || ""}
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-center sm:gap-3">
                <div className="min-h-12 min-w-0 rounded-xl border border-border/50 bg-background/40 p-1.5">
                  <TokenSelectBlock
                    id="swap-from"
                    ariaLabel="Asset to send"
                    value={fromCurrency}
                    tokens={tokens}
                    onValueChange={(v) => {
                      setFromCurrency(v);
                      setSuccessMessage(null);
                    }}
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <Label htmlFor="swap-amount-in" className="sr-only">
                    Amount to send
                  </Label>
                  <Input
                    id="swap-amount-in"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0.00"
                    className={cn(
                      amountFieldClass,
                      "text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                      validationMessage &&
                        (parsedIn.kind === "invalid" || exceedsBalance || sameToken)
                        ? "border-destructive/50 ring-destructive/20 aria-invalid:border-destructive"
                        : "",
                    )}
                    value={amountIn}
                    onChange={(e) => {
                      setAmountIn(e.target.value);
                      setSuccessMessage(null);
                    }}
                    aria-invalid={
                      parsedIn.kind === "invalid" || exceedsBalance || sameToken
                        ? true
                        : undefined
                    }
                    aria-describedby="swap-amount-error"
                  />
                </div>
              </div>
              <p
                id="swap-amount-error"
                className="min-h-[1.25rem] text-sm text-destructive"
              >
                {validationMessage ?? ""}
              </p>
            </motion.div>

            <div className="relative flex justify-center py-1">
              <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-border to-transparent" />
              <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                <Button
                  type="button"
                  size="icon-lg"
                  variant="secondary"
                  className="relative z-10 rounded-full border border-border shadow-lg ring-4 ring-card"
                  onClick={flip}
                  aria-label="Reverse swap direction"
                >
                  <ArrowDownUpIcon className="size-5 text-primary" aria-hidden />
                </Button>
              </motion.div>
            </div>

            <motion.div
              layout
              className="space-y-3 rounded-2xl border border-border/60 bg-secondary/20 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <Label className="text-foreground/80">You receive</Label>
                <span className="text-xs text-muted-foreground">Estimated</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-center sm:gap-3">
                <div className="min-h-12 min-w-0 rounded-xl border border-border/50 bg-background/40 p-1.5">
                  <TokenSelectBlock
                    id="swap-to"
                    ariaLabel="Asset to receive"
                    value={toCurrency}
                    tokens={tokens}
                    onValueChange={(v) => {
                      setToCurrency(v);
                      setSuccessMessage(null);
                    }}
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <Label htmlFor="swap-amount-out" className="sr-only">
                    Amount to receive
                  </Label>
                  <output
                    id="swap-amount-out"
                    htmlFor="swap-amount-in"
                    className={cn(
                      amountFieldClass,
                      "flex items-center text-primary",
                    )}
                  >
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={
                          parsedIn.kind === "ok" && numericIn > 0 && !sameToken
                            ? formatTokenAmount(amountOut, 8)
                            : "dash"
                        }
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="block min-w-0 truncate"
                      >
                        {parsedIn.kind === "ok" && numericIn > 0 && !sameToken
                          ? formatTokenAmount(amountOut, 8)
                          : "—"}
                      </motion.span>
                    </AnimatePresence>
                  </output>
                </div>
              </div>
              {rate !== null && (
                <p className="font-mono text-xs text-muted-foreground">
                  1 {fromCurrency} ≈ {formatTokenAmount(rate, 8)} {toCurrency}
                </p>
              )}
            </motion.div>

            <Button
              type="submit"
              disabled={!canSubmit}
              aria-busy={submitting}
              className="h-12 w-full rounded-2xl text-sm font-semibold uppercase tracking-wide"
            >
              {submitting ? (
                <>
                  <Loader2Icon className="size-5 animate-spin" aria-hidden />
                  Confirming…
                </>
              ) : (
                "Confirm swap"
              )}
            </Button>

            <AnimatePresence>
              {successMessage ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div
                    className="flex items-start gap-3 rounded-2xl border border-primary/35 bg-primary/10 p-4 text-sm text-primary"
                    role="status"
                    aria-live="polite"
                  >
                    <CheckIcon className="mt-0.5 size-5 shrink-0" aria-hidden />
                    <span>{successMessage}</span>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </CardContent>
        </form>
      </Card>
    </motion.div>
  );
};

export default SwapForm;
