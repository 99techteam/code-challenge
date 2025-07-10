import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SwapButtonProps {
  onClick: () => void;
}

export function SwapButton({ onClick }: SwapButtonProps) {
  return (
    <div className="flex justify-center -my-3 relative z-10">
      <Button
        onClick={onClick}
        variant="ghost"
        size="icon"
        className="text-white rounded-full border-4 border-gray-800 transition-all duration-200 bg-gray-700 hover:bg-gray-600 hover:scale-110 shadow-lg"
      >
        <ArrowUpDown className="h-4 w-4" />
      </Button>
    </div>
  );
}
