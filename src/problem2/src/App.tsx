import React, { useState, useEffect } from 'react';
import { TokenSelect } from './components/TokenSelect';
import { AmountInput } from './components/AmountInput';
import { ResultDisplay } from './components/ResultDisplay';
import { LoadingButton } from './components/LoadingButton';
import { Container, Paper, Typography, Box, CircularProgress } from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';

interface PriceData {
  currency: string;
  date: string;
  price: number;
}

const App: React.FC = () => {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [fromToken, setFromToken] = useState<string>('');
  const [toToken, setToToken] = useState<string>('');
  const [amount, setAmount] = useState<string>('1');
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasConverted, setHasConverted] = useState<boolean>(false);

  useEffect(() => {
    fetch('https://interview.switcheo.com/prices.json')
      .then(response => response.json())
      .then(data => {
        setPrices(data);
        setFromToken('USD');
        setToToken('ETH');
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load price data');
        setLoading(false);
      });
  }, []);

  // Reset result when fromToken or toToken changes
  useEffect(() => {
    setResult(null);
    setHasConverted(false);
  }, [fromToken, toToken]);

  // Recalculate result when amount changes, with negative number check
  useEffect(() => {
    if (hasConverted) {
      if (!amount || isNaN(Number(amount))) {
        setResult(null);
        return;
      }
      
      const numAmount = Number(amount);
      if (numAmount <= 0) {
        toast.error('Amount must be a positive number');
        setResult(null);
      } else {
        calculateConversion();
      }
    }
  }, [amount, hasConverted]);

  const uniqueTokens = Array.from(new Set(prices.map(item => item.currency)));

  const calculateConversion = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid positive amount');
      setResult(null);
      return;
    }

    const fromPrice = prices.find(p => p.currency === fromToken)?.price || 0;
    const toPrice = prices.find(p => p.currency === toToken)?.price || 0;

    if (fromPrice === 0 || toPrice === 0) {
      toast.error('Price data not available for selected tokens');
      setResult(null);
      return;
    }

    const conversion = (Number(amount) * fromPrice) / toPrice;
    setResult(Number(conversion.toFixed(6)));
    setHasConverted(true);
  };

  if (loading) {
    return (
      <Container sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
        <Typography variant="h5" align="center" gutterBottom>
          Swap
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <AmountInput value={amount} onChange={setAmount} />
          <TokenSelect
            label="From"
            value={fromToken}
            options={uniqueTokens}
            onChange={setFromToken}
          />
          <TokenSelect
            label="To"
            value={toToken}
            options={uniqueTokens}
            onChange={setToToken}
          />
          
          <LoadingButton onClick={calculateConversion}>
            CONFIRM SWAP
          </LoadingButton>

          <ResultDisplay
            amount={amount}
            fromToken={fromToken}
            toToken={toToken}
            result={result}
          />
        </Box>
      </Paper>
      <Toaster position="top-right" />
    </Container>
  );
};

export default App;