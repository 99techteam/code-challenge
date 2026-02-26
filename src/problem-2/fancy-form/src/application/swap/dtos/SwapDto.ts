// ── Application DTOs ──────────────────────────────────────────────────────────

import type { Token } from "../../../domain/token/entities/Token";

export interface SwapRequestDto {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
}

export interface SwapResultDto {
  success: boolean;
  txHash?: string;
  error?: string;
}