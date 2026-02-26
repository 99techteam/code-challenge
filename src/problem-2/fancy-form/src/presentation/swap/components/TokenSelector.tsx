// ── Presentation Component: TokenSelector ────────────────────────────────────

import { useState } from "react";
import { Button } from "@/presentation/ui-toolkit/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/presentation/ui-toolkit/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/presentation/ui-toolkit/ui/popover";
import { ChevronDown } from "lucide-react";
import { cn } from "@/presentation/ui-toolkit/lib/utils";
import type { Token } from "../../../domain/token/entities/Token";
import { TokenIcon } from "./TokenIcon";

interface TokenSelectorProps {
  token: Token | null;
  tokens: Token[];
  onSelect: (t: Token) => void;
  imgErrors: Record<string, boolean>;
  setImgErrors: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export function TokenSelector({
  token,
  tokens,
  onSelect,
  imgErrors,
  setImgErrors,
}: TokenSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="min-w-[140px] justify-between gap-2 bg-slate-800/80 border-slate-700/50 hover:bg-sky-400/10 hover:border-sky-400/30 text-slate-200 h-12 px-3"
        >
          {token ? (
            <>
              <TokenIcon
                symbol={token.symbol}
                size={24}
                imgErrors={imgErrors}
                setImgErrors={setImgErrors}
              />
              <span className="font-semibold flex-1 text-left">
                {token.symbol}
              </span>
            </>
          ) : (
            <span className="flex-1 text-left text-slate-400">Select</span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[240px] p-0 bg-slate-900/97 border-slate-700/50 shadow-2xl"
        align="start"
      >
        <Command className="bg-transparent">
          <CommandInput
            placeholder="Search token…"
            className="text-slate-200 placeholder:text-slate-500 border-slate-700/50"
          />
          <CommandList>
            <CommandEmpty className="text-slate-500 text-sm py-6 text-center">
              No token found.
            </CommandEmpty>
            <CommandGroup>
              {tokens.map((t) => (
                <CommandItem
                  key={t.symbol}
                  value={t.symbol}
                  onSelect={() => {
                    onSelect(t);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer text-slate-300 hover:text-slate-100 aria-selected:bg-sky-400/10 aria-selected:text-sky-400",
                    t.symbol === token?.symbol && "text-sky-400 bg-sky-400/8",
                  )}
                >
                  <TokenIcon
                    symbol={t.symbol}
                    size={22}
                    imgErrors={imgErrors}
                    setImgErrors={setImgErrors}
                  />
                  <span className="font-semibold flex-1">{t.symbol}</span>
                  {t.price && (
                    <span className="text-xs text-slate-500">
                      $
                      {t.price < 0.01
                        ? t.price.toExponential(2)
                        : t.price.toLocaleString()}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
