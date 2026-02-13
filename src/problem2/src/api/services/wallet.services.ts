import {
  WALLET_STORE,
  SIMULATED_DELAY,
  INITIAL_USD_BALANCE,
  ERROR_MESSAGES,
} from "@common";
import type { ExchangeFormData, WalletType } from "@types";

const DEFAULT_BALANCE = 0;

// Validation helper
const isValidWalletData = (data: unknown): data is Record<string, number> => {
  if (typeof data !== "object" || data === null) return false;
  return Object.values(data).every(
    (v) => typeof v === "number" && v >= DEFAULT_BALANCE,
  );
};

// Get balance for a currency (returns 0 if not found)
const getBalanceFromData = (
  walletData: Record<string, number>,
  currency: string,
): number => {
  return walletData[currency] ?? DEFAULT_BALANCE;
};

// Initialize wallet with default data
const initializeWallet = (): Record<string, number> => {
  const initData = { USD: INITIAL_USD_BALANCE };
  localStorage.setItem(WALLET_STORE, JSON.stringify(initData));
  return initData;
};

// Get wallet data from localStorage
const getWalletData = (): Record<string, number> => {
  const storedData = localStorage.getItem(WALLET_STORE);

  if (!storedData) {
    return initializeWallet();
  }

  try {
    const parsedData = JSON.parse(storedData);

    if (
      !isValidWalletData(parsedData) ||
      Object.keys(parsedData).length === 0
    ) {
      console.warn("Invalid wallet data, reinitializing");
      return initializeWallet();
    }

    return parsedData;
  } catch (error) {
    console.error("Failed to parse wallet data:", error);
    return initializeWallet();
  }
};

export const walletService = {
  getWallets: async (): Promise<WalletType[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY));

    const walletData = getWalletData();

    return Object.keys(walletData)
      .map((key) => ({
        currency: key,
        amount: walletData[key],
      }))
      .filter((wallet) => wallet.amount > DEFAULT_BALANCE);
  },

  getBalance: (currency: string): number => {
    const walletData = getWalletData();
    return getBalanceFromData(walletData, currency);
  },

  exchangeWallet: async (params: ExchangeFormData): Promise<void> => {
    // Input validation
    if (!params.fromToken || !params.toToken) {
      throw new Error(ERROR_MESSAGES.VALIDATE.MISSING_TOKEN);
    }

    if (params.fromToken === params.toToken) {
      throw new Error(ERROR_MESSAGES.VALIDATE.CANNOT_SWAP_SAME_TOKEN);
    }

    if (
      params.fromAmount <= DEFAULT_BALANCE ||
      params.toAmount <= DEFAULT_BALANCE
    ) {
      throw new Error(ERROR_MESSAGES.VALIDATE.AMOUNT_MUST_BE_POSITIVE);
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY));

    const walletData = getWalletData();
    const currentBalance = getBalanceFromData(walletData, params.fromToken);

    if (currentBalance < params.fromAmount) {
      throw new Error(ERROR_MESSAGES.VALIDATE.INSUFFICIENT_BALANCE);
    }

    // Update balances
    walletData[params.fromToken] = currentBalance - params.fromAmount;
    walletData[params.toToken] =
      getBalanceFromData(walletData, params.toToken) + params.toAmount;

    localStorage.setItem(WALLET_STORE, JSON.stringify(walletData));
  },
};
