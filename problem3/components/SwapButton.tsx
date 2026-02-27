"use client";

import React from 'react';
import { ArrowDownUp } from 'lucide-react';

interface SwapButtonProps {
  onClick: () => void;
}

export default function SwapButton({ onClick }: SwapButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-2.5 bg-white dark:bg-gray-800 border-[6px] border-[#f8fafc] dark:border-[#020817] rounded-2xl hover:text-blue-600 text-gray-500 dark:text-gray-400 hover:rotate-180 hover:scale-110 active:scale-95 transition-all duration-300 shadow-sm z-10 relative"
      aria-label="Swap tokens"
    >
      <ArrowDownUp className="w-5 h-5" />
    </button>
  );
}
