import { useState } from 'react';

import { cn } from '@/lib/utils';
import { tokenMonogram } from '@/lib/tokens';

interface TokenIconProps {
  /** Ticker, used for the monogram fallback. */
  code: string;
  /** Remote artwork for this ticker. */
  src: string;
  className?: string;
}

/**
 * A token's artwork from the Switcheo icon repository.
 *
 * The repository does not cover every ticker the price feed quotes, and it is a
 * third-party host, so a failed load falls back to a monogram chip rather than
 * a broken image.
 */
export function TokenIcon({ code, src, className }: TokenIconProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === src;

  return (
    <span
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary font-mono text-[13px] text-foreground',
        className,
      )}
    >
      {failed ? (
        <span aria-hidden="true">{tokenMonogram(code)}</span>
      ) : (
        <img
          src={src}
          alt=""
          // Eager: these are ~2 KB SVGs and the two on the pills are the first
          // thing the eye lands on. Deferring them only buys a visible pop-in.
          decoding="async"
          className="size-full object-contain"
          onError={() => {
            setFailedSrc(src);
          }}
        />
      )}
    </span>
  );
}
