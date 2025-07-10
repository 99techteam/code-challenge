import { useState, useEffect } from "react";
import { tokenService, type Token } from "@/services";
import { useToast } from "@/hooks/useToast";

export function useTokens() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [sellToken, setSellToken] = useState<Token | null>(null);
  const [buyToken, setBuyToken] = useState<Token | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadTokens = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const transformedTokens = await tokenService.getTokens();
        setTokens(transformedTokens);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load token data";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTokens();
  }, [toast]);

  return {
    tokens,
    setTokens,
    sellToken,
    setSellToken,
    buyToken,
    setBuyToken,
    isLoading,
    error,
  };
}
