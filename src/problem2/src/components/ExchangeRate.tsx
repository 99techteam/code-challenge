import { formatNumber } from "../services/tokenService";
import type { Token } from "../types";

export const ExchangeRate = ({ fromToken, toToken, exchangeRate }: { fromToken: Token | null, toToken: Token | null, exchangeRate: number }) => {
    return (
        <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Exchange Rate</span>
                <span className="text-slate-200 font-medium">
                    1 {fromToken?.symbol} = {formatNumber(exchangeRate)} {toToken?.symbol}
                </span>
            </div>
        </div>
    );
};