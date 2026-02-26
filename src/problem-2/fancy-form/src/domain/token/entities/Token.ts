// ── Domain Entity ─────────────────────────────────────────────────────────────
// Pure domain object – no framework / UI dependency.

export interface Token {
  readonly symbol: string;
  readonly name: string;
  readonly price: number | null;
}

export function isSameToken(a: Token, b: Token): boolean {
  return a.symbol === b.symbol;
}