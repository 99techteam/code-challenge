import React, { useState } from 'react';
import { WalletState } from '../types/swap';
import {
  Wallet,
  Settings2,
  RefreshCw,
  Zap,
  Power,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';

interface HeaderProps {
  wallet: WalletState;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  onOpenSettings: () => void;
  onRefreshPrices: () => void;
  isRefreshingPrices: boolean;
  isLivePrice: boolean;
  lastUpdated: Date;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  wallet,
  onConnectWallet,
  onDisconnectWallet,
  onOpenSettings,
  onRefreshPrices,
  isRefreshingPrices,
  isLivePrice,
  lastUpdated,
  isDarkMode,
  onToggleTheme
}) => {
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);

  const shortAddress = wallet.isConnected
    ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
    : '';

  return (
    <header className="w-full max-w-5xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
          <Zap className="w-5 h-5 fill-current" />
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 blur-sm opacity-40 -z-10 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              Switcheo<span className="text-indigo-600 dark:text-indigo-400">Swap</span>
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              v2.0
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className={`w-1.5 h-1.5 rounded-full ${isLivePrice ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-amber-500 dark:bg-amber-400'}`} />
            <span>{isLivePrice ? 'Live Oracle' : 'Snapshot Data'}</span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span>{lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Refresh Prices button */}
        <button
          type="button"
          onClick={onRefreshPrices}
          disabled={isRefreshingPrices}
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/90 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1.5 text-xs font-medium shadow-sm"
          title="Refresh token market prices"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingPrices ? 'animate-spin text-indigo-500 dark:text-indigo-400' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="p-2 rounded-xl bg-white/90 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition shadow-sm"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        {/* Settings button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-white/90 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition shadow-sm"
          title="Swap Settings"
        >
          <Settings2 className="w-4 h-4" />
        </button>

        {/* Wallet Button */}
        <div className="relative">
          {wallet.isConnected ? (
            <div>
              <button
                type="button"
                onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 border border-indigo-400/50 dark:border-indigo-500/40 text-slate-800 dark:text-slate-200 text-xs font-mono font-medium shadow-sm transition group"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                <span>{shortAddress}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition" />
              </button>

              {/* Wallet Dropdown Menu */}
              {walletDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setWalletDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-2xl shadow-2xl p-4 text-slate-800 dark:text-slate-200 z-50 animate-scaleUp">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Connected Account</div>
                    <div className="font-mono text-xs text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-950 p-2 rounded-lg break-all border border-slate-200 dark:border-slate-800 mb-3">
                      {wallet.address}
                    </div>

                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Simulated Balances</div>
                    <div className="max-h-36 overflow-y-auto space-y-1 mb-3 text-xs pr-1">
                      {Object.entries(wallet.balances).map(([sym, bal]) => (
                        <div key={sym} className="flex justify-between py-0.5 text-slate-600 dark:text-slate-300">
                          <span className="font-medium">{sym}</span>
                          <span className="font-mono text-slate-900 dark:text-white font-semibold">{bal.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onDisconnectWallet();
                        setWalletDropdownOpen(false);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 dark:border-rose-500/30 text-xs font-medium flex items-center justify-center gap-2 transition"
                    >
                      <Power className="w-3.5 h-3.5" />
                      Disconnect Wallet
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onConnectWallet}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition active:scale-95"
            >
              <Wallet className="w-3.5 h-3.5" />
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
