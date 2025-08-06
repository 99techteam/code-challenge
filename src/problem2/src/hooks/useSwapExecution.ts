import { useState } from 'react';
import { useToast } from '@/hooks/useToast';
import type { SwapFormData } from '@/types/swap';

export const useSwapExecution = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const executeSwap = async (
    formData: SwapFormData,
    validationError: string | null,
    onSuccess: () => void
  ) => {
    if (validationError) {
      toast({
        title: 'Invalid Input',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: 'Swap Successful!',
        description: `Swapped ${formData.fromAmount} ${formData.fromToken?.currency} for ${formData.toAmount} ${formData.toToken?.currency}`,
        variant: 'default',
      });

      onSuccess();
    } catch {
      toast({
        title: 'Swap Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    executeSwap,
  };
};