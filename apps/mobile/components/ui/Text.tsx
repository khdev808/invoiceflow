import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

type Variant = keyof typeof typography;

interface Props extends TextProps {
  variant?: Variant;
  color?: 'text' | 'secondary' | 'muted' | 'primary' | 'accent' | 'danger' | 'inverse';
  muted?: boolean;
}

const colorKey = {
  text: 'text',
  secondary: 'textSecondary',
  muted: 'textMuted',
  primary: 'primary',
  accent: 'accent',
  danger: 'danger',
  inverse: 'surface',
} as const;

export function Text({ variant = 'body', color = 'text', muted, style, ...props }: Props) {
  const { colors } = useTheme();
  const resolvedColor = muted ? colors.textMuted : colors[colorKey[color] as keyof typeof colors] as string;

  return (
    <RNText
      style={[typography[variant], { color: resolvedColor }, style]}
      {...props}
    />
  );
}

export function textStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    hero: { ...typography.hero, color: colors.text },
    title: { ...typography.title, color: colors.text },
    heading: { ...typography.heading, color: colors.text },
    subheading: { ...typography.subheading, color: colors.text },
    body: { ...typography.body, color: colors.text },
    bodyBold: { ...typography.bodyBold, color: colors.text },
    caption: { ...typography.caption, color: colors.textSecondary },
    micro: { ...typography.micro, color: colors.textMuted },
    label: { ...typography.label, color: colors.text },
  });
}
