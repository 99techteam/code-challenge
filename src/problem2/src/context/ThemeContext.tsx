import { getTheme } from '@config/themeConfig';
import { ITheme, IThemeMode } from '@types/theme';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface IThemeContextType {
    theme: ITheme;
    toggleTheme: () => void;
    setTheme: (mode: IThemeMode) => void;
  }

const ThemeContext = createContext<IThemeContextType | undefined>(undefined);

export const useTheme = (): IThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<IThemeMode>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    
    return 'dark';
  });

  const theme = getTheme(themeMode);

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (mode: IThemeMode) => {
    setThemeMode(mode);
  };

  useEffect(() => {
    localStorage.setItem('theme', themeMode);
    
    document.documentElement.setAttribute('data-theme', themeMode);
    document.body.style.backgroundColor = theme.colors.background;
  }, [themeMode, theme.colors.background]);

  const value: IThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 