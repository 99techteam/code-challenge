import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WalletBalance {
  blockchain: string;
  currency: string;
  amount: number;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

interface WalletPageProps {
  prices: Record<string, number>;
  balances: WalletBalance[];
}

const BLOCKCHAIN_PRIORITY: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

function getPriority(blockchain: string): number {
  return BLOCKCHAIN_PRIORITY[blockchain] ?? -99;
}

function WalletRow({ balance }: { balance: FormattedWalletBalance }) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        <Badge variant="outline">{balance.blockchain}</Badge>
      </TableCell>
      <TableCell>{balance.currency}</TableCell>
      <TableCell className="text-right font-mono">{balance.formatted}</TableCell>
      <TableCell className="text-right font-mono text-green-600 dark:text-green-400">
        ${balance.usdValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </TableCell>
    </TableRow>
  );
}

export const WalletPage: React.FC<WalletPageProps> = ({ balances, prices }) => {
  const sortedBalances = useMemo((): FormattedWalletBalance[] => {
    return (
      balances
        .filter((balance) => {
          const priority = getPriority(balance.blockchain);
          return priority > -99 && balance.amount > 0;
        })
        .sort((lhs, rhs) => getPriority(rhs.blockchain) - getPriority(lhs.blockchain))
        .map((balance) => ({
          ...balance,
          formatted: balance.amount.toFixed(2),
          usdValue: (prices[balance.currency] ?? 0) * balance.amount,
        }))
    );
  }, [balances, prices]);

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Wallet Balances</CardTitle>
        <CardDescription>
          Your holdings sorted by blockchain priority
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Blockchain</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">USD Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedBalances.map((balance) => (
              <WalletRow
                key={`${balance.blockchain}-${balance.currency}`}
                balance={balance}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};