import React from 'react';
import { Paper, Typography } from '@mui/material';

interface ResultDisplayProps {
  amount: string;
  fromToken: string;
  toToken: string;
  result: number | null;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  amount,
  fromToken,
  toToken,
  result,
}) => {
  return (
    <>
      {result !== null && (
        <Paper elevation={1} sx={{ p: 2, mt: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            {amount} {fromToken} = {result} {toToken}
          </Typography>
        </Paper>
      )}
    </>
  );
};