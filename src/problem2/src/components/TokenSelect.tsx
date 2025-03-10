import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';

interface TokenSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export const TokenSelect: React.FC<TokenSelectProps> = ({
  label,
  value,
  options,
  onChange,
}) => {
  const [imageExists, setImageExists] = useState<{ [key: string]: boolean }>({});

  const checkImage = (token: string) => {
    return new Promise<boolean>((resolve) => {
      const img = new Image();
      img.src = `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${token}.svg`;
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    });
  };

  useEffect(() => {
    const checkAllImages = async () => {
      const results: { [key: string]: boolean } = {};
      for (const token of options) {
        results[token] = await checkImage(token);
      }
      setImageExists(results);
    };
    checkAllImages();
  }, [options]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <FormControl fullWidth>
        <InputLabel>{label}</InputLabel>
        <Select
          value={value}
          label={label}
          onChange={(e) => onChange(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          {options.map(token => (
            <MenuItem key={token} value={token}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {token}
                {imageExists[token] ? (
                  <img
                    src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${token}.svg`}
                    alt={token}
                    style={{ width: 24, height: 24 }}
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: '#e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      color: '#757575',
                    }}
                  >
                    {token.charAt(0).toUpperCase()}
                  </Box>
                )}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};