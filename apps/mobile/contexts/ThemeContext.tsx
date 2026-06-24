import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { colors as lightColors } from '@/constants/theme';

const darkColors = {
  ...lightColors,
  primary: '#818CF8',
  primaryDark: '#6366F1',
  primaryLight: '#A5B4FC',
  primarySoft: '#1E1B4B',
  accent: '#34D399',
  accentSoft: '#064E3B',
  warning: '#FBBF24',
  warningSoft: '#451A03',
  danger: '#F87171',
  dangerSoft: '#450A0A',
  background: '#0B0F17',
  surface: '#141B28',
  surfaceAlt: '#1C2536',
  surfaceElevated: '#1A2233',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',
  border: '#243044',
  borderLight: '#1C2536',
  overlay: 'rgba(0, 0, 0, 0.65)',
  gradientStart: '#3730A3',
  gradientMid: '#4F46E5',
  gradientEnd: '#6D28D9',
  tabBar: '#141B28',
  tabBarBorder: 'rgba(255, 255, 255, 0.08)',
};

type ThemeColors = typeof lightColors;

const ThemeContext = createContext<{ colors: ThemeColors; isDark: boolean }>({
  colors: lightColors,
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const value = useMemo(
    () => ({ colors: isDark ? darkColors : lightColors, isDark }),
    [isDark],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
