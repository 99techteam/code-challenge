import React, { useState } from "react";

export function TokenIcon({ src, symbol, className = "", priority = false }) {
  const [imageError, setImageError] = useState(false);
  const showFallback = !src || imageError;

  return (
    <span className={`token-icon ${className}`} title={symbol}>
      {showFallback ? (
        <span className="token-icon-fallback">{symbol?.slice(0, 1) ?? "?"}</span>
      ) : (
        <img
          src={src}
          alt=""
          width={24}
          height={24}
          loading="eager"
          fetchPriority={priority ? "high" : "auto"}
          onError={() => setImageError(true)}
        />
      )}
    </span>
  );
}
