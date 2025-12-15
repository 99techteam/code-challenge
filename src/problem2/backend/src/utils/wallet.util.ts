import { Wallet } from 'ethers';

/**
 * Generates a new Web3 wallet address
 * @returns A unique Ethereum wallet address (42 characters starting with 0x)
 */
export function generateWalletAddress(): string {
  const wallet = Wallet.createRandom();
  return wallet.address;
}
