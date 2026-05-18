import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Calculator, X } from 'lucide-react';
import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from '../utils/sum';

interface SumCalculatorProps {
  onSelectResult: (result: number) => void;
  onClose: () => void;
}

export const SumCalculator: FC<SumCalculatorProps> = ({ onSelectResult, onClose }) => {
  const [inputVal, setInputVal] = useState<string>('');
  const [results, setResults] = useState<{a: number|null, b: number|null, c: number|null}>({a: null, b: null, c: null});

  useEffect(() => {
    const n = parseInt(inputVal);
    if (!isNaN(n) && n > 0 && n < 10000) { // arbitrary limit to prevent max call stack
      setResults({
        a: sum_to_n_a(n),
        b: sum_to_n_b(n),
        c: sum_to_n_c(n)
      });
    } else {
      setResults({a: null, b: null, c: null});
    }
  }, [inputVal]);

  const bestResult = results.a;

  return (
    <div className="absolute top-full mt-2 right-0 z-50 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800/80">
        <div className="flex items-center gap-2 text-cyan-400 font-medium text-sm">
          <Calculator size={16} />
          <span>Sum to N Calculator</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Enter a number (N)</label>
          <input
            type="number"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-sm"
            placeholder="e.g. 5"
          />
        </div>

        {bestResult !== null && (
          <div className="space-y-2">
            <ResultRow label="A (Formula)" result={results.a} badge="O(1)" badgeColor="bg-green-500/20 text-green-400 border-green-500/30" />
            <ResultRow label="B (Iterative)" result={results.b} badge="O(n)" badgeColor="bg-yellow-500/20 text-yellow-400 border-yellow-500/30" />
            <ResultRow label="C (Recursive)" result={results.c} badge="O(n) mem" badgeColor="bg-orange-500/20 text-orange-400 border-orange-500/30" />
            
            <button 
              onClick={() => {
                onSelectResult(bestResult);
                onClose();
              }}
              className="w-full mt-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Use Result ({bestResult})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ResultRow = ({ label, result, badge, badgeColor }: { label: string, result: number | null, badge: string, badgeColor: string }) => (
  <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-300">{label}</span>
      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${badgeColor}`}>
        {badge}
      </span>
    </div>
    <span className="text-sm font-mono text-white">{result}</span>
  </div>
);
