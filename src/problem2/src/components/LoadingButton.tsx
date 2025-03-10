import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';

interface LoadingButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  onClick,
  disabled = false,
  children,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleClick = () => {
    setIsLoading(true);
    // Simulate a backend delay of 1.5 seconds
    setTimeout(() => {
      onClick();
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={handleClick}
      fullWidth
      sx={{ py: 1.5 }}
      disabled={disabled || isLoading}
      startIcon={isLoading ? <CircularProgress size={20} /> : null}
    >
      {isLoading ? 'Processing...' : children}
    </Button>
  );
};