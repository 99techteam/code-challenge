import { useCallback, useEffect, useRef, useState } from 'react';

/** How long the panels take to slide back into place after a swap. */
const SETTLE_MS = 280;

type Phase = 'idle' | 'jump' | 'settle';

interface SwapAnimation {
  fromRef: React.RefObject<HTMLDivElement | null>;
  toRef: React.RefObject<HTMLDivElement | null>;
  /** Inline transform for the "From" panel. */
  fromStyle: React.CSSProperties;
  /** Inline transform for the "To" panel. */
  toStyle: React.CSSProperties;
  /** True while the panels are in flight, so they can be lifted above the card. */
  moving: boolean;
  /** Start the swap animation. Call it in the same handler as the state swap. */
  play: () => void;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * The cross-fade-free swap: a FLIP.
 *
 * React swaps the two panels' contents instantly. This measures both panels
 * first, offsets each one with no transition so its new contents start where
 * they just were, then releases both to zero on the next frame — so the eye
 * sees the two rows trade places rather than blink.
 */
export function useSwapAnimation(): SwapAnimation {
  const fromRef = useRef<HTMLDivElement | null>(null);
  const toRef = useRef<HTMLDivElement | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [offsets, setOffsets] = useState({ from: 0, to: 0 });

  const play = useCallback(() => {
    const fromEl = fromRef.current;
    const toEl = toRef.current;
    if (!fromEl || !toEl || prefersReducedMotion()) return;

    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();
    const travel = Math.round(toRect.top - fromRect.top);
    if (travel === 0) return;

    // The panels trade heights along with their contents, since an error
    // message travels with its amount. "From" keeps its top, so it starts one
    // slot down; "To" keeps its bottom, so it starts where "From" began.
    setOffsets({ from: travel, to: Math.round(fromRect.bottom - toRect.bottom) });
    setPhase('jump');
  }, []);

  useEffect(() => {
    if (phase !== 'jump') return;

    const frame = requestAnimationFrame(() => {
      setPhase('settle');
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'settle') return;

    const timer = setTimeout(() => {
      setPhase('idle');
    }, SETTLE_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [phase]);

  const transition =
    phase === 'jump' ? 'none' : `transform ${String(SETTLE_MS)}ms var(--ease-settle)`;

  return {
    fromRef,
    toRef,
    fromStyle: {
      transform: phase === 'jump' ? `translateY(${String(offsets.from)}px)` : 'translateY(0px)',
      transition,
    },
    toStyle: {
      transform: phase === 'jump' ? `translateY(${String(offsets.to)}px)` : 'translateY(0px)',
      transition,
    },
    moving: phase !== 'idle',
    play,
  };
}
