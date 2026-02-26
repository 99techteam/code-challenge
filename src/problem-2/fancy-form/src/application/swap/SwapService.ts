// ── Application Service ───────────────────────────────────────────────────────
// Orchestrates domain logic; coordinates use-cases.
// No UI imports allowed here.

import { isSameToken } from "../../domain/token/entities/Token";
import type { Token } from "../../domain/token/entities/Token";
import { TokenAmount } from "../../domain/token/value-objects/TokenAmount";
import type { SwapRequestDto, SwapResultDto } from "./dtos/SwapDto";

export class SwapService {
  /** Validate a swap request. Returns an error message or null. */
  validate(req: Partial<SwapRequestDto>): string | null {
    if (!req.fromToken || !req.toToken) return "Select tokens";
    if (!req.fromAmount || parseFloat(req.fromAmount) <= 0) return "Enter a valid amount";
    if (isSameToken(req.fromToken, req.toToken)) return "Select different tokens";
    if (!req.fromToken.price || !req.toToken.price) return "Price not available for selected token";
    return null;
  }

  /** Compute destination amount from source amount. */
  computeToAmount(fromAmount: string, from: Token | null, to: Token | null): string {
    if (!from || !to) return "";
    return TokenAmount.convertTo(TokenAmount.of(fromAmount, from), to) ?? "";
  }

  /** Compute source amount from destination amount. */
  computeFromAmount(toAmount: string, from: Token | null, to: Token | null): string {
    if (!from || !to) return "";
    return TokenAmount.convertTo(TokenAmount.of(toAmount, to), from) ?? "";
  }

  /** Exchange rate label, e.g. "1 ETH = 1800.00 USDC" */
  rateLabel(from: Token | null, to: Token | null): string | null {
    if (!from?.price || !to?.price) return null;
    return (from.price / to.price).toFixed(6);
  }

  /**
   * Execute the swap.
   * In a real app this would call a blockchain / DEX SDK.
   */
  async execute(_req: SwapRequestDto): Promise<SwapResultDto> {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 1800));
    return { success: true, txHash: "0xmock" };
  }
}

// Singleton – one instance shared across the presentation layer
export const swapService = new SwapService();