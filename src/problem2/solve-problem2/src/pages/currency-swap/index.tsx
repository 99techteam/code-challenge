import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CurrencySwapForm from "./component/currency-swap-form";

export default function CurrencySwapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Currency Swap
          </CardTitle>
          <CardDescription>
            Exchange your assets instantly at competitive rates
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <CurrencySwapForm />

          {/* Additional Info */}
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>• No hidden fees • Instant processing • Secure transactions</p>
            <p>Exchange rates update every 30 seconds</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
