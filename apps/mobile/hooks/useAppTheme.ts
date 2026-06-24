import { useColorScheme } from 'react-native';
import { colors as lightColors } from '@/constants/theme';

export const darkColors = {
  ...lightColors,
  background: '#0F172A',
  surface: '#1E293B',
  surfaceAlt: '#334155',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#334155',
};

export function useAppTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return {
    isDark,
    colors: isDark ? darkColors : lightColors,
  };
}
