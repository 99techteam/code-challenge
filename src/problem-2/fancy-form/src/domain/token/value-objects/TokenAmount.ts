// ── Value Object ──────────────────────────────────────────────────────────────
// Encapsulates amount conversion logic – no side effects.

import type { Token } from "../entities/Token";

export interface TokenAmount {
  readonly raw: string;
  readonly token: Token;
}

export const TokenAmount = {
  of: (raw: string, token: Token): TokenAmount => ({ raw, token }),

  numeric: (ta: TokenAmount): number => parseFloat(ta.raw) || 0,

  isValid: (ta: TokenAmount): boolean =>
    !!ta.raw && !isNaN(Number(ta.raw)) && parseFloat(ta.raw) > 0,

  usdValue: (ta: TokenAmount): number | null =>
    ta.token.price ? TokenAmount.numeric(ta) * ta.token.price : null,

  convertTo: (ta: TokenAmount, targetToken: Token): string | null => {
    if (!ta.token.price || !targetToken.price || !ta.raw || isNaN(Number(ta.raw))) return null;
    return ((TokenAmount.numeric(ta) * ta.token.price) / targetToken.price).toFixed(6);
  },
};