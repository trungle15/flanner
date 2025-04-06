"use client";

import React, { createContext, useContext, ReactNode } from 'react';

// MyFitnessPal-inspired color palette
export const theme = {
  colors: {
    primary: '#0066EE',         // Main blue color
    primaryDark: '#0055CC',     // Darker blue for hover states
    secondary: '#5E5E5E',       // Dark gray for secondary text
    accent: '#14A84B',          // Green for success/positive elements
    accentDark: '#0E8A3E',      // Darker green for hover states
    danger: '#E33D3D',          // Red for errors/warnings
    background: '#F8F9FA',      // Light gray background
    card: '#FFFFFF',            // White card background
    border: '#E5E7EB',          // Light gray border
    text: {
      primary: '#2D2F30',       // Near-black for primary text
      secondary: '#5E5E5E',     // Dark gray for secondary text
      light: '#8A8A8A',         // Light gray for tertiary text
      white: '#FFFFFF',         // White text
    },
    progress: {
      low: '#E33D3D',           // Red for low progress
      medium: '#F59E0B',        // Amber for medium progress
      high: '#14A84B',          // Green for high progress
    }
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  }
};

type ThemeContextType = {
  theme: typeof theme;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
