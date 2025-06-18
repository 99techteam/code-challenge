import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Avatar from '@mui/material/Avatar';
import { Modal } from '@mui/material';

interface Token {
  currency: string;
  date: string;
  price: number;
}

interface TokenWithIcon extends Token {
  iconUrl: string;
}

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
  const [tokens, setTokens] = useState<TokenWithIcon[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<TokenWithIcon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [isSelectingBuy, setIsSelectingBuy] = useState(false);
  const [sellToken, setSellToken] = useState<TokenWithIcon | null>(null);
  const [buyToken, setBuyToken] = useState<TokenWithIcon | null>(null);
  const [sellAmount, setSellAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

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
    const fetchTokens = async () => {
      try {
        const response = await axios.get<Token[]>('https://interview.switcheo.com/prices.json');
        const tokensData = response.data;

        // Remove duplicates by keeping only the latest record for each currency
        const uniqueTokens = tokensData.reduce((acc: Token[], current) => {
          const existingToken = acc.find(token => token.currency === current.currency);
          if (!existingToken || new Date(current.date) > new Date(existingToken.date)) {
            // If no existing token or current token is newer, replace it
            return [...acc.filter(token => token.currency !== current.currency), current];
          }
          return acc;
        }, []);

        const tokensWithIcons = uniqueTokens.map(token => ({
          ...token,
          iconUrl: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${token.currency.toUpperCase()}.svg`
        }));

        setTokens(tokensWithIcons);
        setFilteredTokens(tokensWithIcons);
      } catch (error) {
        console.error('Error fetching tokens:', error);
      }
    };

    fetchTokens();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = tokens.filter(token =>
        token.currency.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTokens(filtered);
    } else {
      setFilteredTokens(tokens);
    }
  }, [searchTerm, tokens]);

  useEffect(() => {
    if (sellToken && buyToken && sellAmount) {
      const sellValue = parseFloat(sellAmount);
      if (!isNaN(sellValue)) {
        const calculatedAmount = (sellValue * sellToken.price) / buyToken.price;
        setBuyAmount(calculatedAmount.toFixed(4));
      } else {
        setBuyAmount('');
      }
    }
  }, [sellToken, buyToken, sellAmount]);

  const handleTokenSelect = (token: TokenWithIcon) => {
    if (isSelectingBuy) {
      setBuyToken(token);
    } else {
      setSellToken(token);
    }
    setShowTokenModal(false);
  };

  const handleSellAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Handle empty input
    if (value === '') {
      setSellAmount('');
      return;
    }

    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^\d.]/g, '');

    // Split by decimal point and clean each part
    const parts = cleanValue.split('.');
    let formattedValue = '';

    if (parts.length > 1) {
      // Keep the decimal part clean
      const decimalPart = parts[1].replace(/[^\d]/g, '');
      formattedValue = parts[0] + '.' + decimalPart;
    } else {
      formattedValue = parts[0];
    }

    // Update the input value directly
    e.target.value = formattedValue;
    setSellAmount(formattedValue);
  };

  const openTokenModal = (isBuy: boolean) => {
    setIsSelectingBuy(isBuy);
    setShowTokenModal(true);
    setSearchTerm('');
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow-md">
      <div className="mb-6 p-4 bg-white rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Sell</span>
          {sellToken && (
            <span className="text-gray-600">${sellToken.price.toFixed(2)}</span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <input
            type="text"
            maxLength={10}
            value={sellAmount}
            onChange={handleSellAmountChange}
            placeholder="0"
            className="text-2xl font-bold w-full outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={() => openTokenModal(false)}
            className="flex items-center !bg-[#FF37C7] text-white px-3 py-2 rounded-lg gap-1 whitespace-nowrap"
          >
            {sellToken ? (
              <>
                <Avatar alt={sellToken.currency} src={sellToken.iconUrl}
                />
                {sellToken.currency}
              </>
            ) : (
              'Select token'
            )}
          </button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-white rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Buy</span>
          {buyToken && (
            <span className="text-gray-600">${buyToken.price.toFixed(2)}</span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <input
            type="number"
            value={buyAmount}
            readOnly
            placeholder="0"
            min="0"
            className="text-2xl font-bold w-full outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={() => openTokenModal(true)}
            className="flex items-center !bg-[#FF37C7] text-white px-3 py-2 rounded-lg gap-1 whitespace-nowrap "
          >
            {buyToken ? (
              <>
                <Avatar alt={buyToken.currency} src={buyToken.iconUrl} /> {buyToken.currency}
              </>
            ) : (
              'Select token'
            )}
          </button>
        </div>
      </div>

      {sellToken && buyToken && sellAmount && (
        <div className="mb-6 p-4 bg-white rounded-lg">
          <div className="text-sm text-gray-600">
            1 {buyToken.currency} = {(buyToken.price / sellToken.price).toFixed(6)} {sellToken.currency} (${buyToken.price.toFixed(2)})
          </div>
        </div>
      )}

      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="w-full !bg-fuchsia-100 text-[#FF37C7] py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting ? 'Connecting...' : walletAddress ?
          `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` :
          'Connect wallet'}
      </button>
      <Modal
        open={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Select a token</h2>
              <button onClick={() => setShowTokenModal(false)}>×</button>
            </div>

            <input
              type="text"
              placeholder="Search tokens"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4"
            />

            <div className="grid grid-cols-5 gap-2 mb-4">
              {['ETH', 'USDC', 'USDT', 'WBTC', 'WETH'].map((symbol) => {
                const token = tokens.find(t => t.currency === symbol);
                return token ? (
                  <button
                    key={symbol}
                    onClick={() => handleTokenSelect(token)}
                    className="flex flex-col items-center p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Avatar alt={symbol} src={token.iconUrl}><span className="text-xs">{symbol}</span></Avatar>

                  </button>
                ) : null;
              })}
            </div>

            <div className="mb-2 text-sm text-gray-500">Tokens by 24H volume</div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredTokens.map((token) => (
                <button
                  key={token.currency}
                  onClick={() => handleTokenSelect(token)}
                  className="flex items-center w-full p-3 hover:bg-gray-100 rounded-lg"
                >
                  <Avatar alt={token.currency.toUpperCase()} src={token.iconUrl} />
                  <div className="text-left ml-1">
                    <div className="font-medium">{token.currency}</div>
                    <div className="text-xs text-gray-500">
                      {token.currency === 'ETH' ? 'Ethereum' :
                        token.currency === 'USDC' ? 'USDC' :
                          token.currency === 'USDT' ? 'Tether' :
                            token.currency === 'BNB' ? 'Binance Coin' : token.currency}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TokenSwap;