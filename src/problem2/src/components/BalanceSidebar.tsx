import { Wallet } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TokenIcon } from "@/components/TokenIcon";
import { type Token } from "@/services";

interface BalanceSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokens: Token[];
}

export function BalanceSidebar({
  open,
  onOpenChange,
  tokens,
}: BalanceSidebarProps) {
  const getTotalValue = () => {
    return tokens.reduce((total, token) => {
      const balance = parseFloat(token.balance) || 0;
      return total + balance * token.priceUsd;
    }, 0);
  };

  const formatValue = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance) || 0;
    if (num === 0) return "0";
    if (num < 0.0001) return "< 0.0001";
    return num.toLocaleString("en-US", { maximumFractionDigits: 6 });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-80 bg-gray-900 border-gray-600 flex flex-col shadow-2xl"
      >
        <SheetHeader className="border-b border-gray-600 pb-4 flex-shrink-0">
          <SheetTitle className="flex items-center gap-2 text-gray-100">
            <Wallet className="h-5 w-5" />
            Your Balances
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col mt-6">
          {/* Total Portfolio Value */}
          <div className="bg-gray-800/80 rounded-xl p-4 mb-6 flex-shrink-0 border border-gray-600 shadow-lg">
            <p className="text-sm text-gray-300 mb-1">Total Portfolio Value</p>
            <p className="text-2xl font-bold text-white">
              {formatValue(getTotalValue())}
            </p>
          </div>

          {/* Token List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-500 hover:scrollbar-thumb-gray-400">
            <div className="space-y-3 pr-2">
              <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
                Assets
              </h3>

              {tokens.map((token) => {
                const balance = parseFloat(token.balance) || 0;
                const totalValue = balance * token.priceUsd;

                return (
                  <div
                    key={token.symbol}
                    className="bg-gray-800/70 rounded-lg p-4 border border-gray-600/70 shadow-md transition-all duration-200 hover:bg-gray-700/80 hover:border-gray-500 hover:shadow-lg cursor-pointer transform hover:translate-x-1"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden border border-gray-500">
                          <TokenIcon
                            iconPath={token.icon}
                            symbol={token.symbol}
                            size="md"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {token.symbol}
                          </p>
                          <p className="text-xs text-gray-300">{token.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-white">
                          {formatBalance(token.balance)}
                        </p>
                        <p className="text-xs text-gray-300">
                          {formatValue(totalValue)}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Price</span>
                      <span className="text-gray-200">
                        {formatValue(token.priceUsd)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
