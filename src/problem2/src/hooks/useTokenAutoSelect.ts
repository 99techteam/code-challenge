import { useEffect } from 'react';
import type { EnrichedToken } from '@/types/swap';

export const useTokenAutoSelect = (
  tokens: EnrichedToken[],
  hasFromToken: boolean,
  hasToToken: boolean,
  onTokensSelected: (fromToken: EnrichedToken, toToken: EnrichedToken) => void
) => {
  useEffect(() => {
    if (tokens.length >= 2 && !hasFromToken && !hasToToken) {
      onTokensSelected(tokens[0], tokens[1]);
    }
  }, [tokens, hasFromToken, hasToToken, onTokensSelected]);
};