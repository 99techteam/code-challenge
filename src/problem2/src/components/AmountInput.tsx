import React from 'react';
import { TextField } from '@mui/material';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const AmountInput: React.FC<AmountInputProps> = ({ value, onChange }) => {
  return (
    <TextField
      label="Amount to send"
      id="input-amount"
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
      variant="outlined"
      InputProps={{ inputProps: { min: 0, step: 'any' } }}
      placeholder="Enter amount"
    />
  );
};