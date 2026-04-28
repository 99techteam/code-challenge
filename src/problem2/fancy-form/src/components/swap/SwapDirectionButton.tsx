import { motion } from 'framer-motion';
import { useState } from 'react';
import { ArrowDown } from 'lucide-react';

interface SwapDirectionButtonProps {
  onFlip: () => void;
  disabled?: boolean;
}

export function SwapDirectionButton({ onFlip, disabled = false }: SwapDirectionButtonProps) {
  const [rotation, setRotation] = useState(0);

  const handleClick = () => {
    if (disabled) return;
    setRotation((prev) => prev + 180);
    onFlip();
  };

  return (
    <div className="relative z-10 flex justify-center -my-3">
      <motion.button
        id="swap-direction-button"
        type="button"
        onClick={handleClick}
        disabled={disabled}
        animate={{ rotate: rotation }}
        whileHover={disabled ? {} : { scale: 1.1 }}
        whileTap={disabled ? {} : { scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="flex h-11 w-11 items-center justify-center rounded-2xl border-4 border-white/60 bg-white/90 text-slate-900 shadow-xl shadow-slate-900/5 backdrop-blur-xl transition-colors duration-300 hover:border-white hover:bg-white dark:border-[#0f172a]/80 dark:bg-[#1e293b]/90 dark:text-white dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] dark:hover:border-slate-700 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Swap token direction"
      >
        <ArrowDown className="h-5 w-5" strokeWidth={2.5} />
      </motion.button>
    </div>
  );
}
