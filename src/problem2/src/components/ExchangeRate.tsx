interface ExchangeRateProps {
  exchangeRate: string;
}

export function ExchangeRate({ exchangeRate }: ExchangeRateProps) {
  return (
    <div className="mt-4 p-3 bg-gray-800/80 rounded-lg border border-gray-600 shadow-lg">
      <span className="w-full justify-between text-sm text-gray-200 p-2 font-medium">
        {exchangeRate}
      </span>
    </div>
  );
}
