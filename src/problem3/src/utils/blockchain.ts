import { Blockchain } from "../types/wallet";

export const getPriority = (blockchain: Blockchain): number => {
  switch (blockchain) {
    case "Osmosis":
      return 100;
    case "Ethereum":
      return 50;
    case "Arbitrum":
      return 30;
    case "Zilliqa":
    case "Neo":
      return 20;
    default:
      return -99; // Unsupported or low-priority chain
  }
};

export const isSupportedBlockchain = (blockchain: Blockchain): boolean => {
  return getPriority(blockchain) > -99;
};
