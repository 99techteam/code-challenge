import { useState } from 'react'
import { ChevronDown, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { Token } from '@/types/swap'

interface TokenSelectorProps {
  selected: Token | null
  onSelect: (token: Token) => void
  tokens: Token[]
  disabledToken?: Token | null
  error?: string
}

export function TokenSelector({ selected, onSelect, tokens, disabledToken, error }: TokenSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = tokens.filter(t =>
    t.symbol.toLowerCase().includes(search.toLowerCase())
  )

  function handleSelect(token: Token) {
    onSelect(token)
    setOpen(false)
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen)
    if (!isOpen) setSearch('')
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={`flex items-center gap-2 px-3 py-2 h-auto rounded-lg hover:bg-muted/50 ${error ? 'border border-destructive' : ''}`}
        >
          {selected ? (
            <>
              <TokenIcon token={selected} size={24} />
              <span className="font-semibold text-sm">{selected.symbol}</span>
            </>
          ) : (
            <span className="text-muted-foreground text-sm">Select token</span>
          )}
          <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="p-3 border-b border-border">
          <Input
            autoFocus
            placeholder="Search tokens..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8"
          />
        </div>
        <div className="max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No tokens found</div>
          ) : (
            filtered.map(token => {
              const isDisabled = disabledToken?.symbol === token.symbol
              return (
                <button
                  key={token.symbol}
                  onClick={() => !isDisabled && handleSelect(token)}
                  disabled={isDisabled}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    isDisabled
                      ? 'opacity-40 cursor-not-allowed'
                      : 'hover:bg-muted/60 cursor-pointer'
                  } ${selected?.symbol === token.symbol ? 'bg-muted/40' : ''}`}
                >
                  <TokenIcon token={token} size={28} />
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-sm">{token.symbol}</span>
                    <span className="text-xs text-muted-foreground">
                      ${token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </span>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function TokenIcon({ token, size }: { token: Token; size: number }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return <Coins className="text-muted-foreground shrink-0" style={{ width: size, height: size }} />
  }

  return (
    <img
      src={token.iconUrl}
      alt={token.symbol}
      width={size}
      height={size}
      className="rounded-full shrink-0 object-contain"
      onError={() => setFailed(true)}
    />
  )
}
