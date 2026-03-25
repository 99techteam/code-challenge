import { useEffect, useState } from "react";

import { getTokens } from "@/apis";
import type { IToken } from "@/types";
import { compareByCurrency, parseToken, uniqueLatestByCurrency } from "@/utils";

export function useTokens() {
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState<IToken[]>([]);

  useEffect(() => {
    async function fetchTokens() {
      setIsLoading(true);

      const tokens = await getTokens();

      const validTokens = tokens.filter(({ price }) => price && price > 0)
      const uniqueTokens = uniqueLatestByCurrency(validTokens);

      setTokens(uniqueTokens.map(parseToken).sort(compareByCurrency));

      setIsLoading(false);
    }

    fetchTokens();
  }, []);

  return {
    data: tokens,
    isLoading,
  }
}
