import { Platform } from 'react-native';

export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
};

export const colors = {
  primary: '#4F46E5',
  primaryDark: '#4338CA',
  primaryLight: '#6366F1',
  primarySoft: '#EEF2FF',
  accent: '#059669',
  accentDark: '#047857',
  accentSoft: '#ECFDF5',
  warning: '#D97706',
  warningSoft: '#FFFBEB',
  danger: '#DC2626',
  dangerSoft: '#FEF2F2',
  background: '#F6F8FC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  surfaceElevated: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  success: '#16A34A',
  overlay: 'rgba(15, 23, 42, 0.55)',
  gradientStart: '#4F46E5',
  gradientMid: '#6366F1',
  gradientEnd: '#7C3AED',
  tabBar: '#FFFFFF',
  tabBarBorder: 'rgba(15, 23, 42, 0.06)',
};

export const typography = {
  hero: { fontSize: 32, fontFamily: fonts.extraBold, letterSpacing: -0.8, lineHeight: 38 },
  title: { fontSize: 28, fontFamily: fonts.extraBold, letterSpacing: -0.5, lineHeight: 34 },
  heading: { fontSize: 20, fontFamily: fonts.bold, letterSpacing: -0.3, lineHeight: 26 },
  subheading: { fontSize: 17, fontFamily: fonts.semiBold, letterSpacing: -0.2, lineHeight: 22 },
  body: { fontSize: 16, fontFamily: fonts.regular, lineHeight: 24 },
  bodyBold: { fontSize: 16, fontFamily: fonts.semiBold, lineHeight: 24 },
  caption: { fontSize: 13, fontFamily: fonts.medium, lineHeight: 18 },
  micro: { fontSize: 11, fontFamily: fonts.semiBold, letterSpacing: 0.4, lineHeight: 14 },
  label: { fontSize: 14, fontFamily: fonts.semiBold, lineHeight: 18 },
};

export const statusColors: Record<string, string> = {
  DRAFT: '#94A3B8',
  SENT: '#4F46E5',
  VIEWED: '#D97706',
  PAID: '#059669',
  OVERDUE: '#DC2626',
  CANCELLED: '#94A3B8',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 40,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const layout = {
  screenPadding: 20,
  tabBarHeight: 68,
  tabBarBottomGap: 10,
  tabBarHorizontalInset: 16,
};

export const shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: { elevation: 2 },
    default: {},
  })!,
  md: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
    },
    android: { elevation: 6 },
    default: {},
  })!,
  lg: Platform.select({
    ios: {
      shadowColor: '#312E81',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.18,
      shadowRadius: 28,
    },
    android: { elevation: 10 },
    default: {},
  })!,
  primary: Platform.select({
    ios: {
      shadowColor: '#4F46E5',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.28,
      shadowRadius: 16,
    },
    android: { elevation: 8 },
    default: {},
  })!,
};

export const templates = [
  { id: 'modern', name: 'Modern', color: '#4F46E5' },
  { id: 'classic', name: 'Classic', color: '#1E293B' },
  { id: 'minimal', name: 'Minimal', color: '#64748B' },
  { id: 'bold', name: 'Bold', color: '#7C3AED' },
  { id: 'professional', name: 'Professional', color: '#0F766E' },
  { id: 'creative', name: 'Creative', color: '#DB2777' },
];

export const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

export const expenseCategories = [
  'General', 'Materials', 'Travel', 'Equipment', 'Office', 'Marketing', 'Insurance', 'Subcontractor', 'Meals', 'Utilities',
];
