import { ChevronDown, Inbox, Loader2, SearchIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { TokenIcon } from "@/components/TokenIcon"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Separator } from "@/components/ui/separator"
import { useTokensQuery } from "@/services/token/token.query"
import type { TToken } from "@/services/token/token.type"

interface TokenSelectProps {
  selectedToken?: TToken
  onSelect?: (token: TToken) => void
  label?: string
}

export const TokenSelect = ({
  selectedToken,
  onSelect,
  label = "Select token"
}: TokenSelectProps) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const { data: tokens = [], isLoading, error } = useTokensQuery()

  const filteredTokens = useMemo(() => {
    return tokens.filter(
      t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.symbol.toLowerCase().includes(search.toLowerCase())
    )
  }, [tokens, search])

  const handleSelect = (token: TToken) => {
    onSelect?.(token)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="shrink-0 flex items-center gap-2 pl-3 pr-4 py-2 bg-white/40 hover:bg-white/80 border border-white/60 shadow-sm rounded-2xl backdrop-blur-md transition-all duration-200 hover:shadow-md group/token self-center"
        >
          {selectedToken ? (
            <>
              <TokenIcon token={selectedToken} />
              <span className="text-lg font-bold text-neutral-800">{selectedToken.symbol}</span>
            </>
          ) : (
            <span className="text-sm font-semibold text-neutral-600">{label}</span>
          )}

          <ChevronDown className="text-neutral-500 text-[20px] group-hover/token:rotate-180" />
        </button>
      </DialogTrigger>

      <DialogContent
        className="bg-[#F2F2F7] min-w-lg shadow-soft-xl rounded-4xl border border-white/50 animate-[pulse-slow_0.5s_ease-out_1]">
        <DialogHeader>
          <DialogTitle>Select a token</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <InputGroup
            className="h-11 rounded-lg !bg-white shadow-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-0 transition-all font-normal">
            <InputGroupInput
              placeholder="Search name or paste address"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>

          <div className="shrink-0 flex gap-2 flex-wrap">
            {tokens.slice(0, 5).map(token => (
              <button
                key={`chip-${token.address}`}
                type="button"
                onClick={() => handleSelect(token)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/5 bg-white shadow-sm hover:bg-gray-50 transition-all cursor-pointer group"
              >
                <TokenIcon token={token} size="sm" />
                <span className="text-[13px] font-semibold text-neutral-900">{token.symbol}</span>
              </button>
            ))}
          </div>

          <Separator />

          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin text-neutral-400" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4">Failed to load tokens</div>
          ) : (
            <TokenList tokens={filteredTokens} onSelect={handleSelect} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

type TTokenListProps = {
  tokens?: (TToken & { balance?: string })[]
  onSelect: (token: TToken) => void
}

const TokenList = ({ tokens, onSelect }: TTokenListProps) => {
  if (!tokens || tokens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-neutral-400">
        <Inbox />
        <p>No tokens found</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto max-h-[400px] custom-scrollbar p-2 space-y-2">
      {tokens.map(token => (
        <TokenItem token={token} key={token.address} onSelect={() => onSelect(token)} />
      ))}
    </div>
  )
}

const TokenItem = ({ token, onSelect }: { token: TToken & { balance?: string }; onSelect: () => void }) => {
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: <explanation>
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <div
      key={token.address}
      onClick={onSelect}
      className={`flex items-center justify-between p-2 rounded-[18px] cursor-pointer hover:bg-black/5 transition-colors`}
    >
      <div className="flex items-center gap-3">
        <TokenIcon token={token} size="lg" />

        <div className="flex flex-col gap-0.5">
          <span className="text-[16px] font-semibold text-neutral-900 leading-tight">
            {token.name}
          </span>

          <span className="text-[13px] font-normal text-neutral-500">{token.symbol}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-0.5">
        <span className="text-[16px] font-normal text-neutral-900">
          {token.balance !== "-" ? token.balance : ""}
        </span>
      </div>
    </div>
  )
}
