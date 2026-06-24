import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { colors as lightColors } from '@/constants/theme';

const darkColors = {
  ...lightColors,
  background: '#0B1220',
  surface: '#151F32',
  surfaceAlt: '#1E293B',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#2A3548',
  gradientStart: '#1E3A8A',
  gradientEnd: '#1E40AF',
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
