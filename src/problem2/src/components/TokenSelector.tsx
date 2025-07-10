import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TokenIcon } from "@/components/TokenIcon";
import { cn } from "@/utils/cn";
import { type Token } from "@/services";

interface TokenSelectorProps {
  token: Token | null;
  tokens: Token[];
  onSelect: (token: Token) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
}

export function TokenSelector({
  token,
  tokens,
  onSelect,
  isOpen,
  onOpenChange,
  disabled = false,
}: TokenSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTokens = tokens.filter(
    (t) =>
      t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTokenSelect = (selectedToken: Token) => {
    onSelect(selectedToken);
    onOpenChange(false);
    setSearchQuery("");
  };

  return (
    <Dialog
      open={isOpen && !disabled}
      onOpenChange={disabled ? undefined : onOpenChange}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          disabled={disabled}
          className={cn(
            "flex items-center gap-2 p-2 rounded-lg transition-colors",
            disabled ? "cursor-not-allowed" : "hover:bg-gray-700/50"
          )}
        >
          {token ? (
            <div
              className={cn(
                "w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden",
                disabled && "opacity-70"
              )}
            >
              <TokenIcon
                iconPath={token.icon}
                symbol={token.symbol}
                size="md"
              />
            </div>
          ) : (
            ""
          )}

          <span
            className={cn("font-medium text-white", disabled && "opacity-70")}
          >
            {token ? token.symbol : "Select token"}
          </span>
          <ChevronDown
            className={cn("w-4 h-4 text-gray-300", disabled && "opacity-70")}
          />
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-sm shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-gray-100">Select a token</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-300" />
            <Input
              name="searchToken"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-700 border-gray-500 text-white placeholder:text-gray-300 focus-visible:ring-offset-0 focus-visible:ring-blue-400"
            />
          </div>

          <div className="h-64 overflow-y-auto overflow-x-hidden space-y-1 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-500 hover:scrollbar-thumb-gray-400">
            {filteredTokens.map((t) => (
              <Button
                key={t.symbol}
                variant="ghost"
                onClick={() => token?.symbol !== t.symbol && handleTokenSelect(t)}
                disabled={token?.symbol === t.symbol}
                className={cn(
                  "w-full justify-start p-4 rounded-lg transition-all duration-200 border border-transparent transform",
                  token?.symbol === t.symbol
                    ? "bg-gray-600 border-gray-500 cursor-default"
                    : "hover:bg-gray-600 hover:border-gray-500 hover:shadow-md hover:translate-x-0.5 hover:w-[calc(100%-2px)] cursor-pointer"
                )}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center overflow-hidden border border-gray-400">
                    <TokenIcon iconPath={t.icon} symbol={t.symbol} size="md" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{t.symbol}</div>
                    <div className="text-sm text-gray-400">{t.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{t.balance}</div>
                    <div className="text-xs text-gray-400">{t.value}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
