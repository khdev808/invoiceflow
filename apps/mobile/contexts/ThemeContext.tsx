import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { colors as lightColors } from '@/constants/theme';

const darkColors = {
  ...lightColors,
  primary: '#D4AF37',
  primaryDark: '#C9A227',
  primaryLight: '#E0C04A',
  primarySoft: '#2A2416',
  accent: '#C9A227',
  accentDark: '#B8860B',
  accentSoft: '#2A2416',
  warning: '#D4AF37',
  warningSoft: '#2A2416',
  danger: '#E57373',
  dangerSoft: '#3D1F1F',
  background: '#0F1419',
  surface: '#1A2129',
  surfaceAlt: '#232B35',
  surfaceElevated: '#1A2129',
  text: '#FAF8F4',
  textSecondary: '#A8ADB4',
  textMuted: '#6B7380',
  border: '#2A3240',
  borderLight: '#1F2630',
  success: '#4ADE80',
  successSoft: '#142A1F',
  overlay: 'rgba(0, 0, 0, 0.65)',
  gradientStart: '#C9A227',
  gradientMid: '#B8860B',
  gradientEnd: '#9A6700',
  tabBar: '#1A2129',
  tabBarBorder: 'rgba(250, 248, 244, 0.08)',
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
