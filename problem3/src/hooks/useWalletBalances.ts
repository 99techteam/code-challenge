import { WalletBalance } from "@/interfaces";
import { useEffect, useState } from "react";

export default function useWalletBalances(): Array<WalletBalance> {
  const [balances, setBalances] = useState<Array<WalletBalance>>([]);

  useEffect(() => {}, []);

  return balances;
}
