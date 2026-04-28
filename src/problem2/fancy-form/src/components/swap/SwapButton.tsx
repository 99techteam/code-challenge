import { SwapStatus } from '@/types/swap';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

interface SwapButtonProps {
  label: string;
  canSwap: boolean;
  status: SwapStatus;
  onSwap: () => void;
}

export function SwapButton({ label, canSwap, status, onSwap }: SwapButtonProps) {
  const isProcessing = status === SwapStatus.PROCESSING;
  const isSuccess = status === SwapStatus.SUCCESS;

  return (
    <Button
      id="swap-execute-button"
      type="button"
      onClick={onSwap}
      disabled={!canSwap || isProcessing}
      size="lg"
      className={`relative mt-1 flex w-full items-center justify-center gap-2 rounded-[1.25rem] py-6 text-base font-bold transition-all duration-300 sm:text-lg ${
        isSuccess
          ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30'
          : canSwap && !isProcessing
            ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:shadow-slate-900/30 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 dark:shadow-white/10 active:scale-[0.98]'
            : 'bg-white/50 text-slate-400 dark:bg-[#0f1d32] dark:text-slate-600 border border-white/20'
      }`}
    >
      {isProcessing && <Spinner size="sm" className="border-white border-t-transparent" />}
      {isSuccess && <CheckCircle2 className="h-5 w-5" />}
      {label}
    </Button>
  );
}
