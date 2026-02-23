import React from "react";
import { SwapCard } from "@/components/swap";

export const SwapPage: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-8 lg:py-16">
      <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl md:text-5xl font-bold text-text-primary mb-3">Swap Tokens</h1>
        <p className="text-text-secondary text-lg">Trade tokens in an instant</p>
      </div>
      <SwapCard />
    </div>
  );
};
