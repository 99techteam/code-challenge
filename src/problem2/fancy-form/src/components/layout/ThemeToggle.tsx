import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Button
      id="theme-toggle"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-11 w-11 rounded-2xl border border-white/60 bg-white/50 text-slate-600 shadow-sm backdrop-blur-md transition-all duration-300 hover:bg-white/90 hover:text-slate-900 hover:shadow-md active:scale-95 dark:border-white/10 dark:bg-black/20 dark:text-slate-400 dark:hover:bg-black/40 dark:hover:text-slate-100"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
