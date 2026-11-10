// src/utils/theme.ts
// Luxury Imperial Theme System for Mead - Black + Gold + Elegant Palette
// Centralized colors, shadows, spacing, and typography for consistent luxury feel across all 94 files

import { createContext, useContext, ReactNode } from 'react';
import { Platform, TextStyle, ViewStyle } from 'react-native';

export const colors = {
  // Core Luxury Palette
  black: '#000000',           // Main background
  dark: '#111111',            // Cards, inputs, surfaces
  gold: '#FFD700',            // Primary accent - used for titles, buttons, highlights
  goldLight: '#F5C800',       // Softer gold for subtle elements
  white: '#FFFFFF',           // Text on dark surfaces
  gray: '#AAAAAA',            // Secondary text
  lightGray: '#DDDDDD',       // Tertiary text / borders
  purple: '#6A0DAD',          // Premium / AI accents
  emerald: '#00C853',         // Success / Verified / Mead Clear active
  ruby: '#E91E63',            // Danger / End call
  info: '#00B0FF',            // Informational elements

  // Semantic colors
  success: '#00C853',
  error: '#FF6B6B',
  warning: '#FFB300',

  // Surfaces & borders
  surface: '#111111',
  surfaceElevated: '#1A1A1A',
  border: '#FFD70033',
  borderSubtle: '#FFFFFF14',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const typography = {
  fontFamily: {
    bold: 'Imperial-Bold',
    regular: 'Imperial-Regular',
    system: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
  },
  display: 56,
  h1: 32,
  h2: 24,
  h3: 20,
  body: 16,
  bodyLg: 18,
  caption: 12,
  label: 14,
} as const;

export const shadows = {
  goldGlow: Platform.select<ViewStyle>({
    ios: {
      shadowColor: colors.gold,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    },
    android: { elevation: 8 },
    default: {},
  }),
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.45,
      shadowRadius: 16,
    },
    android: { elevation: 6 },
    default: {},
  }),
} as const;

export const luxuryStyles = {
  screen: {
    flex: 1,
    backgroundColor: colors.black,
  } as ViewStyle,
  goldTitle: {
    fontFamily: typography.fontFamily.bold,
    color: colors.gold,
    letterSpacing: 2,
  } as TextStyle,
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  } as ViewStyle,
};

export type ThemeColors = typeof colors;

interface ThemeContextType {
  colors: ThemeColors;
  spacing: typeof spacing;
  typography: typeof typography;
  shadows: typeof shadows;
  luxuryStyles: typeof luxuryStyles;
}

const themeValue: ThemeContextType = {
  colors,
  spacing,
  typography,
  shadows,
  luxuryStyles,
};

const ThemeContext = createContext<ThemeContextType>(themeValue);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Re-export for direct access if needed
export const Theme = themeValue;

export default Theme;