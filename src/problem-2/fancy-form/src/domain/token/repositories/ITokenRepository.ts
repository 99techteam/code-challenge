// ── Repository Interface (Port) ───────────────────────────────────────────────
// The domain declares WHAT it needs; infrastructure provides HOW.

import type { Token } from "../entities/Token";

export interface ITokenRepository {
  fetchAll(): Promise<Token[]>;
}