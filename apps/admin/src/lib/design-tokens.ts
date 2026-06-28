/** Quiet Ledger design tokens — shared reference for TS components */
export const tokens = {
  colors: {
    bg: '#FAF8F4',
    surface: '#FFFFFF',
    text: '#0F1419',
    muted: '#5C6570',
    border: '#E8E4DC',
    accent: '#C9A227',
    accentDark: '#B8860B',
    accentSoft: '#F5EDD6',
    success: '#1B6B4A',
    successSoft: '#E8F3ED',
    warning: '#9A6700',
    warningSoft: '#F5EDD6',
    danger: '#9B2C2C',
    dangerSoft: '#F9EDED',
    navy: '#0F1419',
    ivory: '#FAF8F4',
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  shadow: '0 1px 3px rgba(15, 20, 25, 0.06), 0 4px 12px rgba(15, 20, 25, 0.04)',
  font: {
    sans: 'var(--font-instrument-sans)',
    display: 'var(--font-fraunces)',
  },
} as const;

export type DesignTokens = typeof tokens;
