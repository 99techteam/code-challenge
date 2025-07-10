import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

interface SwapHeaderProps {
  isSwapping: boolean;
  onBalanceClick: () => void;
}

export function SwapHeader({ isSwapping, onBalanceClick }: SwapHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-white">Swap</h1>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          disabled={isSwapping}
          className={cn(
            "rounded-full border border-gray-600",
            isSwapping
              ? "text-gray-400/70 cursor-not-allowed"
              : "text-gray-300 hover:text-white hover:bg-gray-700 hover:border-gray-500"
          )}
          onClick={onBalanceClick}
        >
          <Wallet className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
