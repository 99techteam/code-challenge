import { useState } from 'react';
import type { SwapFormData, EnrichedToken } from '@/types/swap';
import { validateAmount, sanitizeAmountInput } from '@/lib/precision';

export const useSwapForm = () => {
  const [formData, setFormData] = useState<SwapFormData>({
    fromToken: null,
    toToken: null,
    fromAmount: '',
    toAmount: '',
  });

  const updateFromToken = (token: EnrichedToken) => {
    setFormData(prev => ({ ...prev, fromToken: token }));
  };

  const updateToToken = (token: EnrichedToken) => {
    setFormData(prev => ({ ...prev, toToken: token }));
  };

  const updateFromAmount = (amount: string) => {
    setFormData(prev => ({ ...prev, fromAmount: amount }));
  };


  const swapTokens = () => {
    setFormData(prev => ({
      ...prev,
      fromToken: prev.toToken,
      toToken: prev.fromToken,
      fromAmount: prev.toAmount,
      toAmount: prev.fromAmount,
    }));
  };

  const resetAmounts = () => {
    setFormData(prev => ({
      ...prev,
      fromAmount: '',
      toAmount: '',
    }));
  };

  const setTokens = (fromToken: EnrichedToken, toToken: EnrichedToken) => {
    setFormData(prev => ({
      ...prev,
      fromToken,
      toToken,
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.fromToken) return 'Please select a token to swap from';
    if (!formData.toToken) return 'Please select a token to swap to';
    
    // Validate amount using precision validation
    const amountValidation = validateAmount(
      formData.fromAmount,
      formData.fromToken.decimals || 18
    );
    
    if (!amountValidation.isValid) {
      return amountValidation.error || 'Invalid amount';
    }
    
    if (!formData.fromAmount || formData.fromAmount === '0' || formData.fromAmount === '') {
      return 'Please enter a valid amount';
    }
    
    if (formData.fromToken.currency === formData.toToken.currency) {
      return 'Cannot swap the same token';
    }
    
    return null;
  };

  const handleAmountChange = (value: string): string => {
    // Use precision library for input sanitization
    const decimals = formData.fromToken?.decimals || 18;
    return sanitizeAmountInput(value, decimals);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const currentValue = parseFloat(formData.fromAmount) || 0;
    let newValue = currentValue;
    
    // Define increment values based on current amount
    const increment = currentValue >= 100 ? 10 : currentValue >= 10 ? 1 : 0.1;
    
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      newValue = currentValue + increment;
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      newValue = Math.max(0, currentValue - increment);
    } else {
      return;
    }
    
    // Format to appropriate decimal places
    const decimals = increment < 1 ? 1 : 0;
    updateFromAmount(newValue.toFixed(decimals));
  };

  return {
    formData,
    updateFromToken,
    updateToToken,
    updateFromAmount,
    swapTokens,
    resetAmounts,
    setTokens,
    validateForm,
    handleAmountChange,
    handleKeyDown,
    isValid: !validateForm(),
  };
};