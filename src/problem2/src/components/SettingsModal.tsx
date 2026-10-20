import React, { useState } from 'react';
import { SwapSettings } from '../types/swap';
import { X, SlidersHorizontal, AlertTriangle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SwapSettings;
  onUpdateSettings: (newSettings: SwapSettings) => void;
}

const PRESET_SLIPPAGES = [0.1, 0.5, 1.0];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  const [slippage, setSlippage] = useState(settings.slippage);
  const [customSlippage, setCustomSlippage] = useState(
    PRESET_SLIPPAGES.includes(settings.slippage) ? '' : settings.slippage.toString()
  );
  const [deadline, setDeadline] = useState(settings.deadline);
  const [simulateFailure, setSimulateFailure] = useState(settings.simulateFailure);

  if (!isOpen) return null;

  const handleSelectPreset = (val: number) => {
    setSlippage(val);
    setCustomSlippage('');
  };

  const handleCustomSlippageChange = (val: string) => {
    setCustomSlippage(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0 && num <= 50) {
      setSlippage(num);
    }
  };

  const handleSave = () => {
    onUpdateSettings({
      slippage,
      deadline: deadline > 0 ? deadline : 20,
      simulateFailure
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-md transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-3xl shadow-2xl p-5 sm:p-6 text-slate-900 dark:text-slate-100 z-10 animate-scaleUp">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Transaction Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 pt-4">
          {/* Slippage tolerance */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Slippage Tolerance
            </label>
            <div className="flex items-center gap-2">
              {PRESET_SLIPPAGES.map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleSelectPreset(val)}
                  className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold border transition ${
                    slippage === val && customSlippage === ''
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                  }`}
                >
                  {val}%
                </button>
              ))}

              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Custom"
                  value={customSlippage}
                  onChange={e => handleCustomSlippageChange(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl py-2 pl-2 pr-6 text-xs text-slate-900 dark:text-white text-right font-medium outline-none"
                />
                <span className="absolute right-2 top-2 text-xs text-slate-400 pointer-events-none">
                  %
                </span>
              </div>
            </div>

            {slippage > 3 && (
              <p className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 mt-1.5 font-medium">
                <AlertTriangle className="w-3 h-3 flex-shrink-0" /> High slippage tolerance may result in frontrunning
              </p>
            )}
          </div>

          {/* Transaction Deadline */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Transaction Deadline
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="180"
                value={deadline}
                onChange={e => setDeadline(parseInt(e.target.value) || 20)}
                className="w-20 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white font-mono outline-none"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">minutes</span>
            </div>
          </div>

          {/* Dev Simulation Option */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-750 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Mock Network Failure</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Simulate rejection for error handling test</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={e => setSimulateFailure(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
};
