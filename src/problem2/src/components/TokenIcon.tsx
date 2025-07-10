import { useState, useEffect } from "react";
import { cn } from "@/utils/cn";

const tokenIcons = import.meta.glob("../assets/tokens/*.svg", {
  query: "?url",
  import: "default",
  eager: true,
});

interface TokenIconProps {
  iconPath: string;
  symbol: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function TokenIcon({
  iconPath,
  symbol,
  className,
  size = "md",
}: TokenIconProps) {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  useEffect(() => {
    try {
      setHasError(false);

      const filename = iconPath.split("/").pop() || "";
      const modulePath = `../assets/tokens/${filename}`;

      if (tokenIcons[modulePath]) {
        setImageSrc(tokenIcons[modulePath] as string);
      } else {
        const defaultPath = "../assets/tokens/Token.svg";
        if (tokenIcons[defaultPath]) {
          setImageSrc(tokenIcons[defaultPath] as string);
        } else {
          throw new Error(`No icon found for ${symbol}`);
        }
      }
    } catch (error) {
      console.warn(`Failed to load icon for ${symbol}:`, error);
      setHasError(true);
    }
  }, [iconPath, symbol]);

  if (hasError && !imageSrc) {
    return (
      <div
        className={cn(
          "rounded-full bg-gray-600 flex items-center justify-center text-white font-medium text-xs",
          sizeClasses[size],
          className
        )}
      >
        {symbol.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={symbol}
      className={cn("object-contain", sizeClasses[size], className)}
      onError={() => {
        setHasError(true);
        setImageSrc("");
      }}
    />
  );
}
