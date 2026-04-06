import { useState, useEffect } from "react";
import { getTokenIconUrl } from "@/constant";

interface TokenIconProps {
  symbol: string;
  size?: "sm" | "md" | "lg";
}

export default function TokenIcon({ symbol, size = "md" }: TokenIconProps) {
  const [imageError, setImageError] = useState(false);

  const iconUrl = getTokenIconUrl(symbol);

  useEffect(() => {
    console.log(`🖼️ Loading icon for ${symbol}:`, iconUrl);
  }, [symbol, iconUrl]);

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  if (imageError) {
    console.warn(`⚠️ Icon failed to load for ${symbol}, showing fallback`);
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
      >
        {symbol.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={iconUrl}
      alt={symbol}
      className={`${sizeClasses[size]} rounded-full flex-shrink-0 object-cover`}
      onError={() => {
        console.error(`❌ Failed to load SVG for ${symbol} from:`, iconUrl);
        setImageError(true);
      }}
    />
  );
}
