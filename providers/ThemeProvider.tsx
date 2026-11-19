import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { themes, type Theme } from '../themes';

interface ThemeContextType {
  theme: Theme;
  setTheme: (themeName: string) => void;
  themes: Theme[];
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState(() => {
    // Get stored theme from localStorage or default to the new interactive theme
    return localStorage.getItem('homeplatter-theme') || 'Glassmorphism Light';
  });

  // Apply the theme colors to the :root element as CSS variables
  useEffect(() => {
    const currentTheme = themes.find(t => t.name === themeName) || themes[0];
    const root = document.documentElement;
    
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Add/remove 'dark' class to html element to trigger Tailwind's dark mode
    if (themeName.includes('Dark')) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    localStorage.setItem('homeplatter-theme', themeName);
  }, [themeName]);
  
  const handleSetTheme = useCallback((newThemeName: string) => {
    setThemeName(newThemeName);
  }, []);

  const activeTheme = useMemo(() => {
      return themes.find(t => t.name === themeName) || themes[0];
  }, [themeName]);

  const contextValue = useMemo(() => ({
    theme: activeTheme,
    setTheme: handleSetTheme,
    themes,
  }), [activeTheme, handleSetTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};