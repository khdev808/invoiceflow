import { Platform } from 'react-native';

export const fonts = {
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semiBold: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
  display: 'LibreBaskerville_700Bold',
};

export const colors = {
  primary: '#C9A227',
  primaryDark: '#B8860B',
  primaryLight: '#D4AF37',
  primarySoft: '#F5EDD6',
  accent: '#C9A227',
  accentDark: '#B8860B',
  accentSoft: '#F5EDD6',
  warning: '#9A6700',
  warningSoft: '#F5EDD6',
  danger: '#9B2C2C',
  dangerSoft: '#F9EDED',
  background: '#FAF8F4',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F2EB',
  surfaceElevated: '#FFFFFF',
  text: '#0F1419',
  textSecondary: '#5C6570',
  textMuted: '#8B939E',
  border: '#E8E4DC',
  borderLight: '#F0EDE6',
  success: '#1B6B4A',
  successSoft: '#E8F3ED',
  overlay: 'rgba(15, 20, 25, 0.55)',
  gradientStart: '#C9A227',
  gradientMid: '#B8860B',
  gradientEnd: '#9A6700',
  tabBar: '#FAF8F4',
  tabBarBorder: 'rgba(15, 20, 25, 0.08)',
  navy: '#0F1419',
};

export const typography = {
  hero: { fontSize: 32, fontFamily: fonts.display, letterSpacing: -0.5, lineHeight: 40 },
  title: { fontSize: 28, fontFamily: fonts.display, letterSpacing: -0.3, lineHeight: 36 },
  heading: { fontSize: 20, fontFamily: fonts.bold, letterSpacing: -0.2, lineHeight: 26 },
  subheading: { fontSize: 17, fontFamily: fonts.semiBold, letterSpacing: -0.1, lineHeight: 24 },
  body: { fontSize: 16, fontFamily: fonts.regular, lineHeight: 26 },
  bodyBold: { fontSize: 16, fontFamily: fonts.semiBold, lineHeight: 26 },
  caption: { fontSize: 13, fontFamily: fonts.medium, lineHeight: 20 },
  micro: { fontSize: 11, fontFamily: fonts.semiBold, letterSpacing: 0.3, lineHeight: 14 },
  label: { fontSize: 14, fontFamily: fonts.semiBold, lineHeight: 20 },
};

export const statusColors: Record<string, string> = {
  DRAFT: '#8B939E',
  SENT: '#5C6570',
  VIEWED: '#9A6700',
  PAID: '#1B6B4A',
  OVERDUE: '#9B2C2C',
  CANCELLED: '#8B939E',
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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const layout = {
  screenPadding: 20,
  tabBarHeight: 64,
  tabBarBottomGap: 10,
  tabBarHorizontalInset: 16,
};

export const shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#0F1419',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: { elevation: 2 },
    default: {},
  })!,
  md: Platform.select({
    ios: {
      shadowColor: '#0F1419',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: { elevation: 4 },
    default: {},
  })!,
  lg: Platform.select({
    ios: {
      shadowColor: '#0F1419',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
    },
    android: { elevation: 8 },
    default: {},
  })!,
  primary: Platform.select({
    ios: {
      shadowColor: '#B8860B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
    },
    android: { elevation: 6 },
    default: {},
  })!,
};

export const templates = [
  { id: 'modern', name: 'Modern', color: '#0F1419', accentColor: '#C9A227', layout: 'modern', description: 'Quiet Ledger default — navy and brass', premium: false },
  { id: 'minimal', name: 'Minimal', color: '#5C6570', accentColor: '#8B939E', layout: 'minimal', description: 'Light and airy — lets your line items shine', premium: false },
  { id: 'classic', name: 'Classic', color: '#0F1419', accentColor: '#5C6570', layout: 'classic', description: 'Traditional serif look for established businesses', premium: true },
  { id: 'bold', name: 'Bold', color: '#0F1419', accentColor: '#C9A227', layout: 'bold', description: 'Strong typography with brass accent', premium: true },
  { id: 'professional', name: 'Professional', color: '#1B6B4A', accentColor: '#2D8A5E', layout: 'professional', description: 'Deep green accent — perfect for trades & consulting', premium: true },
  { id: 'creative', name: 'Creative', color: '#5C4A72', accentColor: '#8B7AA8', layout: 'creative', description: 'Muted plum tones for creative studios', premium: true },
] as const;

export type InvoiceTemplate = (typeof templates)[number];

export const FREE_TEMPLATE_IDS = new Set<string>(templates.filter((t) => !t.premium).map((t) => t.id));

export const paymentTermOptions = [
  { days: 0, label: 'Due on receipt' },
  { days: 7, label: 'Net 7' },
  { days: 14, label: 'Net 14' },
  { days: 30, label: 'Net 30' },
  { days: 60, label: 'Net 60' },
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
