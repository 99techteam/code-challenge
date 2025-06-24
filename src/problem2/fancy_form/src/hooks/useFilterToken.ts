import { SortOption } from "@/enums";
import type { Token } from "@/types";
import { useMemo } from "react";

interface UseFilteredTokensProps {
  listToken: Token[];
  searchQuery: string;
  sortOption: SortOption;
}

export const useFilteredTokens = ({
  listToken,
  searchQuery,
  sortOption,
}: UseFilteredTokensProps): Token[] => {
  return useMemo(() => {
    if (!listToken) return [];

    // Filter tokens by search query
    const filtered = listToken.filter((token) =>
      token.currency.toLowerCase().includes(searchQuery.toLowerCase())
    );
    // Remove duplicates by currency (keep first occurrence)
    const uniqueMap = new Map<string, Token>();
    for (const token of filtered) {
      if (!uniqueMap.has(token.currency)) {
        uniqueMap.set(token.currency, token);
      }
    }
    const uniqueTokens = Array.from(uniqueMap.values());
    // Sort tokens based on selected option
    switch (sortOption) {
      case SortOption.AZ:
        return [...uniqueTokens].sort((a, b) =>
          a.currency.localeCompare(b.currency)
        );
      case SortOption.ZA:
        return [...uniqueTokens].sort((a, b) =>
          b.currency.localeCompare(a.currency)
        );
      case SortOption.Newest:
        return [...uniqueTokens].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      case SortOption.Oldest:
        return [...uniqueTokens].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      case SortOption.Default:
      default:
        return uniqueTokens;
    }
  }, [listToken, searchQuery, sortOption]);
};
