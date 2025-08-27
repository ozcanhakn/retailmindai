'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // More descriptive error message
    throw new Error(
      'useTheme must be used within a ThemeProvider. ' +
      'Make sure the component is wrapped with <ThemeProvider>.'
    );
  }
  return context;
};

const lightThemeVars = {
  '--primary-100': '#bb2649',
  '--primary-200': '#f35d74',
  '--primary-300': '#ffc3d4',
  '--accent-100': '#ffadad',
  '--accent-200': '#ffd6a5',
  '--text-100': '#4b4f5d',
  '--text-200': '#6a738b',
  '--bg-100': '#ffffff',
  '--bg-200': '#f5f5f5',
  '--bg-300': '#cccccc',
  // Additional statistics and chart colors for light mode
  '--stats-box-bg': '#292E3B',
  '--stats-text': '#B4C2DC',
  '--chart-primary': '#FF4D4D',
  '--chart-secondary': '#FF4D4D',
  '--chart-tertiary': '#FF4D4D',
  '--chart-background': '#292E3B',
  '--chart-card-bg': '#292E3B',
};

const darkThemeVars = {
  '--primary-100': '#0D6E6E',
  '--primary-200': '#4a9d9c',
  '--primary-300': '#afffff',
  '--accent-100': '#FF3D3D',
  '--accent-200': '#ffe0c8',
  '--text-100': '#FFFFFF',
  '--text-200': '#B4C2DC',
  '--bg-100': '#1A1F2B',
  '--bg-200': '#292E3B',
  '--bg-300': '#3a4050',
  // Additional statistics and chart colors
  '--stats-box-bg': '#292E3B',
  '--stats-text': '#B4C2DC',
  '--chart-primary': '#FF4D4D',
  '--chart-secondary': '#FF4D4D',
  '--chart-tertiary': '#FF4D4D',
  '--chart-background': '#292E3B',
  '--chart-card-bg': '#292E3B',
};

const applyTheme = (theme: Theme) => {
  const vars = theme === 'light' ? lightThemeVars : darkThemeVars;
  const root = document.documentElement;
  
  Object.entries(vars).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
  
  // Apply theme class to document element for Tailwind integration
  document.documentElement.className = document.documentElement.className.replace(/theme-\w+/g, '');
  document.documentElement.classList.add(`theme-${theme}`);
  
  // Also apply to body for additional styling
  document.body.className = document.body.className.replace(/theme-\w+/g, '');
  document.body.classList.add(`theme-${theme}`);
  
  // Set data attribute for CSS selectors
  document.documentElement.setAttribute('data-theme', theme);
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'light' 
}) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Apply default theme immediately
  useEffect(() => {
    // Apply the default theme class immediately
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add(`theme-${defaultTheme}`);
      document.documentElement.setAttribute('data-theme', defaultTheme);
      applyTheme(defaultTheme);
    }
  }, [defaultTheme]);

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    } finally {
      setMounted(true);
    }
  }, [defaultTheme]);

  // Apply theme changes
  useEffect(() => {
    if (mounted) {
      try {
        applyTheme(theme);
        localStorage.setItem('theme', theme);
      } catch (error) {
        console.warn('Failed to apply theme:', error);
      }
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const contextValue = { 
    theme, 
    setTheme: handleSetTheme, 
    toggleTheme 
  };

  // Always render the provider
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};