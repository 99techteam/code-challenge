import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, Search01Icon } from "@hugeicons/core-free-icons"
import { Popover } from "radix-ui"
import { useEffect, useMemo, useRef, useState } from "react"

import { TokenIcon } from "@/components/swap/TokenIcon"
import { cn } from "@/lib/utils"
import type { Token } from "@/types/token"

type TokenSelectProps = {
  value: Token | null
  onChange: (token: Token) => void
  tokens: Token[]
  disabledSymbol?: string
  placeholder?: string
}

export function TokenSelect({
  value,
  onChange,
  tokens,
  disabledSymbol,
  placeholder = "Select token",
}: TokenSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tokens
    return tokens.filter((t) => t.symbol.toLowerCase().includes(q))
  }, [tokens, query])

  // Scroll the active option into view when navigating with the keyboard.
  useEffect(() => {
    if (!open) return
    const node = listRef.current?.querySelector<HTMLLIElement>(
      `[data-index="${activeIndex}"]`
    )
    node?.scrollIntoView({ block: "nearest" })
  }, [activeIndex, open])

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) {
      setQuery("")
      setActiveIndex(0)
      // Focus the search input after the popover mounts.
      window.setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  const selectAt = (index: number) => {
    const token = filtered[index]
    if (!token) return
    if (token.symbol === disabledSymbol) return
    onChange(token)
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(0, i - 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      selectAt(activeIndex)
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger
        className={cn(
          "group inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-2 pr-3 text-sm font-medium transition-all",
          "hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
          "data-[state=open]:bg-muted/60"
        )}
      >
        {value ? (
          <>
            <TokenIcon token={value} size={26} />
            <span className="tracking-wide">{value.symbol}</span>
          </>
        ) : (
          <span className="px-1 text-muted-foreground">{placeholder}</span>
        )}
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={16}
          className="text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className={cn(
            "z-50 w-[300px] origin-[var(--radix-popover-content-transform-origin)] rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
          )}
        >
          <div className="relative mb-2">
            <HugeiconsIcon
              icon={Search01Icon}
              size={16}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActiveIndex(0)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search token"
              className={cn(
                "h-9 w-full rounded-lg border border-border bg-background pr-3 pl-9 text-sm",
                "placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-none"
              )}
            />
          </div>
          <ul
            ref={listRef}
            role="listbox"
            className="max-h-72 overflow-y-auto"
          >
            {filtered.length === 0 && (
              <li className="px-3 py-6 text-center text-xs text-muted-foreground">
                No tokens match &ldquo;{query}&rdquo;
              </li>
            )}
            {filtered.map((token, index) => {
              const isActive = index === activeIndex
              const isSelected = value?.symbol === token.symbol
              const isDisabled = token.symbol === disabledSymbol
              return (
                <li
                  key={token.symbol}
                  role="option"
                  data-index={index}
                  aria-selected={isSelected}
                  aria-disabled={isDisabled}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectAt(index)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-2",
                    isActive && !isDisabled && "bg-muted",
                    isDisabled &&
                      "cursor-not-allowed opacity-40 hover:bg-transparent"
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <TokenIcon token={token} size={28} />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">
                        {token.symbol}
                      </span>
                      <span className="truncate text-[11px] text-muted-foreground">
                        $
                        {token.price.toLocaleString("en-US", {
                          maximumFractionDigits: 6,
                        })}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-semibold tracking-wide text-primary uppercase">
                      Selected
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
