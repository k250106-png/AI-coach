'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type VettoTheme = 'dark' | 'light';

type ThemeContextValue = {
  theme: VettoTheme;
  toggleTheme: () => void;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'vetto-theme';

export function VettoThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<VettoTheme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const nextTheme = stored === 'light' || stored === 'dark' ? stored : 'dark';
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.classList.toggle('light', nextTheme === 'light');
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [mounted, theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      mounted,
      toggleTheme: () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark')),
    }),
    [mounted, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useVettoTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useVettoTheme must be used within VettoThemeProvider');
  }
  return context;
}
