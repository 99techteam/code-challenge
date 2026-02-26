// ── Presentation Component: SwapForm ─────────────────────────────────────────
// Pure UI – delegates all logic to the useSwap hook.

import { useState } from "react";
import { Button } from "@/presentation/ui-toolkit/ui/button";
import { Input } from "@/presentation/ui-toolkit/ui/input";
import { Card, CardContent, CardHeader } from "@/presentation/ui-toolkit/ui/card";
import { Badge } from "@/presentation/ui-toolkit/ui/badge";
import { Alert, AlertDescription } from "@/presentation/ui-toolkit/ui/alert";
import { Separator } from "@/presentation/ui-toolkit/ui/separator";
import { AlertCircle, CheckCircle2, ArrowDown, Loader2, Zap } from "lucide-react";
import { useSwap } from "../hooks/useSwap";
import { TokenSelector } from "./TokenSelector";

export function SwapForm() {
  const {
    tokens,
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    swapping,
    success,
    error,
    rate,
    setFromAmount,
    setToAmount,
    selectFromToken,
    selectToToken,
    flipTokens,
    submit,
  } = useSwap();

  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const selectorProps = { tokens, imgErrors, setImgErrors };

  return (
    <Card className="w-full max-w-[460px] bg-slate-900/90 backdrop-blur-2xl border-slate-700/20 shadow-[0_32px_80px_rgba(0,0,0,0.5)] relative z-10 rounded-3xl">
      <CardHeader className="pb-6 pt-8 px-7">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight leading-none">
              Swap
            </h1>
            <p className="text-slate-500 text-sm mt-1">Trade tokens instantly</p>
          </div>
          <Badge
            variant="outline"
            className="bg-sky-400/10 border-sky-400/25 text-sky-400 text-xs font-semibold gap-1 px-3 py-1"
          >
            <Zap className="h-3 w-3" />
            Live rates
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-7 pb-8 space-y-1">
        {/* ── FROM ── */}
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
          You Pay
        </p>
        <div className="flex gap-2.5 items-stretch">
          <TokenSelector token={fromToken} onSelect={selectFromToken} {...selectorProps} />
          <Input
            type="number"
            min="0"
            placeholder="0.00"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            className="flex-1 bg-slate-800/60 border-slate-700/50 text-slate-100 text-xl font-bold text-right h-12 focus:border-sky-400/40 focus:bg-slate-800/90 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
        {fromToken?.price && (
          <p className="text-xs text-slate-500 text-right mt-1.5">
            ≈ $
            {fromAmount
              ? (parseFloat(fromAmount) * fromToken.price).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })
              : "0.00"}{" "}
            USD
          </p>
        )}

        {/* ── FLIP ── */}
        <div className="flex items-center gap-3 my-5">
          <Separator className="flex-1 bg-slate-700/20" />
          <Button
            data-testid="flip-button"
            variant="outline"
            size="icon"
            onClick={flipTokens}
            className="rounded-full w-10 h-10 bg-sky-400/10 border-sky-400/20 text-sky-400 hover:bg-sky-400/20 hover:rotate-180 transition-all duration-200 flex-shrink-0"
          >
            <ArrowDown className="h-[18px] w-[18px]" />
          </Button>
          <Separator className="flex-1 bg-slate-700/20" />
        </div>

        {/* ── TO ── */}
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
          You Receive
        </p>
        <div className="flex gap-2.5 items-stretch">
          <TokenSelector token={toToken} onSelect={selectToToken} {...selectorProps} />
          <Input
            type="number"
            min="0"
            placeholder="0.00"
            value={toAmount}
            onChange={(e) => setToAmount(e.target.value)}
            className="flex-1 bg-slate-800/60 border-slate-700/50 text-emerald-400 text-xl font-bold text-right h-12 focus:border-sky-400/40 focus:bg-slate-800/90 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
        {toToken?.price && (
          <p className="text-xs text-slate-500 text-right mt-1.5">
            ≈ $
            {toAmount
              ? (parseFloat(toAmount) * toToken.price).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })
              : "0.00"}{" "}
            USD
          </p>
        )}

        {/* ── RATE ── */}
        {rate && fromToken && toToken && (
          <div className="flex justify-between items-center bg-slate-800/50 border border-slate-700/20 rounded-xl px-4 py-2.5 text-sm text-slate-400 mt-4">
            <span className="opacity-60">Rate</span>
            <span className="font-semibold text-slate-300">
              1 {fromToken.symbol} = {rate} {toToken.symbol}
            </span>
          </div>
        )}

        {/* ── ERROR ── */}
        {error && (
          <Alert
            variant="destructive"
            className="mt-3.5 bg-red-500/8 border-red-500/20 text-red-400 animate-[shake_0.4s_ease]"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* ── SUCCESS ── */}
        {success && (
          <Alert className="mt-3.5 bg-emerald-400/8 border-emerald-400/20 text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>Swap confirmed successfully!</AlertDescription>
          </Alert>
        )}

        {/* ── SUBMIT ── */}
        <Button
          onClick={submit}
          disabled={swapping}
          className="w-full h-13 mt-5 text-base font-bold bg-gradient-to-r from-sky-400 to-indigo-500 hover:opacity-90 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(56,189,248,0.25)] active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed border-0 text-white rounded-[14px]"
        >
          {swapping ? (
            <span className="flex items-center gap-2.5">
              <Loader2 className="h-4 w-4 animate-spin" />
              Swapping…
            </span>
          ) : (
            "Swap Now"
          )}
        </Button>

        <p className="text-center text-xs text-slate-700 mt-4 mb-0">
          Powered by Switcheo · No fees · Best rate guaranteed
        </p>
      </CardContent>
    </Card>
  );
}