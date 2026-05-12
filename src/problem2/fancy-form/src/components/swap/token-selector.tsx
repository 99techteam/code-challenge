import { useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Token } from "../../types";
import { TokenIcon } from "./token-icon";
import { cn } from "../../utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTokenContext } from "../../provider/token-prices-provider";
import { formatNumber } from "../../utils/format";

interface TokenSelectorProps {
  value: Token;
  onChange: (token: Token) => void;
  excludeSymbol?: string;
  label?: string;
}

export function TokenSelector({
  value,
  onChange,
  excludeSymbol,
  label,
}: TokenSelectorProps) {
  const { tokens } = useTokenContext();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredTokens = tokens?.filter(
    (t) =>
      t.symbol !== excludeSymbol &&
      (t.symbol.toLowerCase().includes(search.toLowerCase()) ||
        t.name.toLowerCase().includes(search.toLowerCase())),
  );

  const handleSelect = (token: Token) => {
    onChange(token);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="relative">
      {label && (
        <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
          {label}
        </p>
      )}

      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/80 border border-border/50",
          "hover:bg-secondary hover:border-border transition-all duration-200",
          "focus:outline-none focus:ring-0 outline-none min-w-[120px]",
        )}
      >
        <TokenIcon token={value} size="sm" />
        <span className="font-semibold text-sm text-foreground">
          {value?.symbol}
        </span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => {
                setOpen(false);
                setSearch("");
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={cn(
                "absolute right-0 top-full mt-2 z-50 w-72",
                "bg-card border border-border rounded-2xl shadow-2xl shadow-gray-300/60",
                "overflow-hidden",
              )}
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <h3 className="font-semibold text-sm text-foreground">
                  Select Token
                </h3>
                <button
                  onClick={() => {
                    setOpen(false);
                    setSearch("");
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-4 pb-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary border border-border/50">
                  <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tokens..."
                    className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
                  />
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto pb-2">
                {filteredTokens.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-6">
                    No tokens found
                  </p>
                ) : (
                  filteredTokens?.map((token) => (
                    <button
                      key={token?.symbol}
                      onClick={() => handleSelect(token)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left",
                        "hover:bg-secondary/70",
                        token?.symbol === value?.symbol && "bg-primary/10",
                      )}
                    >
                      <TokenIcon token={token} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {token?.symbol}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {token.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-foreground">
                          {formatNumber(token?.balance ?? 0, { decimals: 4 })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          $
                          {formatNumber(
                            (token?.balance ?? 0) * (token?.price ?? 0),
                            { decimals: 2 },
                          )}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
