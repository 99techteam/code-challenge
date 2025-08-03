import React, { useState, useEffect, useMemo } from 'react';
import Avatar from '@mui/material/Avatar';
import { TokenSelectModal } from 'components/SelectTokenModal';
import TokenContainer from 'components/TokenContainer';
import { usePriceToken } from 'hooks/usePriceToken';
import { FROM_TOKEN, TO_TOKEN } from 'utils/constant';
import type { TokenWithIcon } from 'types/token';
import { Button } from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { motion } from "motion/react";
import toast from 'react-hot-toast';
import PendingIcon from '@mui/icons-material/Pending';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: {
        method: string;
        params?: unknown[]
      }) => Promise<string[]>;
      on: (event: string, callback: (accounts: string[]) => void) => void;
      removeListener: (event: string, callback: (accounts: string[]) => void) => void;
    };
  }
}

const TokenSwap: React.FC = () => {
  const { tokens, loading, error } = usePriceToken();
  const [targetTokenSelected, setTargetTokenSelected] = useState('');
  const [toToken, setToToken] = useState<TokenWithIcon | null>(null);
  const [fromToken, setFromToken] = useState<TokenWithIcon | null>(null);
  const [toAmount, setToAmount] = useState('');
  const [fromAmount, setFromAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [openTokenModal, setOpenTokenModal] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const enableSwap = fromToken && toToken && fromAmount;

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsConnecting(true);
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert('Please install MetaMask to use this feature!');
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          setWalletAddress('');
        } else {
          setWalletAddress(accounts[0]);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  useEffect(() => {
    if (tokens.length > 0) {
      setFromToken(tokens.find(t => t.currency === 'ETH') || tokens[0]);
      setToToken(tokens.find(t => t.currency === 'USDC') || tokens[1]);
    }
  }, [tokens])

  const handleSwap = () => {
    if (fromToken?.currency === toToken?.currency) {
      const errorMessage = 'Cannot swap the same token.';
      toast.error(errorMessage);
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSwapping(true);

    // Simulate swap process
    setTimeout(() => {
      setIsSwapping(false);
      toast.success(`Successfully swapped!`);

      // Clear the form after successful swap
      setFromAmount('');
      setToAmount('');
    }, 1500);
  };

  const exchangeRate = useMemo(() => {
    if (fromToken?.price && toToken?.price) {
      return fromToken.price / toToken.price;
    }
    return 0;
  }, [fromToken, toToken]);

  useEffect(() => {
    if (!fromAmount || parseFloat(fromAmount) < 0) setToAmount('')
    if (exchangeRate && fromAmount) {
      const amount = parseFloat(fromAmount);
      if (!isNaN(amount)) {
        const calculatedAmount = amount * exchangeRate;
        setToAmount(calculatedAmount.toFixed(5));
      } else {
        setToAmount('');
      }
    }
  }, [exchangeRate, fromAmount])

  const handleTokenSelect = (token: TokenWithIcon) => {
    if (targetTokenSelected === FROM_TOKEN) {
      setFromToken(token);
    } else {
      setToToken(token);
    }
    setOpenTokenModal(false);
  };

  const handleOpenModal = (target: string) => {
    setTargetTokenSelected(target);
    setOpenTokenModal(true);
  };

  function handleTokenSwap() {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount('');
    setToAmount('');
  }

  if (loading) return <p className="text-white">Loading tokens...</p>;
  if (error) return <p className="text-red-500">Error fetching tokens: {error.message}</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow-md">
      <div className="p-4 bg-white rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">From</span>
        </div>
        <div className="flex justify-between items-center">
          <TokenContainer
            disable={false}
            value={fromAmount}
            onChangeValue={(value) => setFromAmount(value)}
          />
          <button
            onClick={() => handleOpenModal(FROM_TOKEN)}
            className="flex items-center !bg-[#FF37C7] text-white px-3 py-2 rounded-lg gap-1 whitespace-nowrap"
          >
            {fromToken ? (
              <>
                <Avatar alt={fromToken.currency} src={fromToken.iconUrl}
                />
                {fromToken.currency}
              </>
            ) : (
              'Select token'
            )}
          </button>
        </div>
      </div>
      <div className="flex place-self-center justify-center my-2">
        <motion.div
          whileTap={{
            rotate: 180,
          }}
        >
          <Button
            variant='outlined'
            className={` rounded-full !bg-[#ff37c6e0] hover:bg-pink-700 !border-none `}
            onClick={handleTokenSwap}>
            <SwapVertIcon className={`h-4 w-2 text-white`} />
          </Button>
        </motion.div>
      </div>
      <div className="mb-6 p-4 bg-white rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">To</span>
        </div>
        <div className="flex justify-between items-center">

          <TokenContainer
            disable={true}
            value={toAmount}
          />
          <button
            onClick={() => handleOpenModal(TO_TOKEN)}
            className="flex items-center !bg-[#FF37C7] text-white px-3 py-2 rounded-lg gap-1 whitespace-nowrap"
          >
            {toToken ? (
              <>
                <Avatar alt={toToken.currency} src={toToken.iconUrl}
                />
                {toToken.currency}
              </>
            ) : (
              'Select token'
            )}
          </button>
        </div>
      </div>
      <button onClick={handleSwap} disabled={isSwapping || !enableSwap}
        className="w-full !bg-fuchsia-100 text-[#FF37C7] py-3 rounded-lg font-bold mb-2"
      >
        {isSwapping ? (
          <>
            <PendingIcon className="h-4 w-4 animate-spin" />
            <span>Swapping...</span>
          </>
        ) : (
          'Confirm Swap'
        )}
      </button>
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="w-full !bg-fuchsia-100 text-[#FF37C7] py-3 rounded-lg font-bold mb-2"
      >
        {isConnecting ? 'Connecting...' : walletAddress ?
          `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` :
          'Connect Wallet'}
        <AccountBalanceWalletIcon />
      </button>

      {
        exchangeRate && fromAmount && (
          <div className="p-4 bg-white rounded-lg">
            <div className="text-sm text-gray-600">
              1 {fromToken?.currency} = {exchangeRate.toFixed(2)} {toToken?.currency} (${fromToken?.price.toFixed(2)})
            </div>
          </div>
        )
      }
      <TokenSelectModal
        open={openTokenModal}
        current={targetTokenSelected === FROM_TOKEN ? fromToken : toToken}
        data={tokens}
        onClose={() => setOpenTokenModal(false)}
        onTokenSelect={handleTokenSelect}
      />
    </div >
  );
};

export default TokenSwap;