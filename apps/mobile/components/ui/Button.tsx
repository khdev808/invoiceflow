import { Pressable, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { fonts, radius, shadows, spacing } from '@/constants/theme';
import { hapticLight } from '@/lib/haptics';
import { devLogAction } from '@/lib/devLog';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
type Size = 'md' | 'lg' | 'sm';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  disabled,
  fullWidth,
  style,
  textStyle,
}: Props) {
  const { colors } = useTheme();
  const v = variants(colors)[variant];
  const sizeStyle = sizes[size];

  const content = loading ? (
    <ActivityIndicator color={v.text} />
  ) : (
    <>
      {icon ? <Ionicons name={icon} size={size === 'sm' ? 18 : 20} color={v.text} /> : null}
      <Text style={[styles.label, { color: v.text, fontFamily: fonts.bold, fontSize: sizeStyle.fontSize }, textStyle]}>
        {label}
      </Text>
    </>
  );

  const handlePress = () => {
    if (disabled || loading) return;
    devLogAction(`button:${label}`);
    hapticLight();
    onPress();
  };

  if (variant === 'primary') {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          fullWidth && styles.full,
          shadows.primary,
          pressed && !disabled && { opacity: 0.92, transform: [{ scale: 0.98 }] },
          disabled && styles.disabled,
          style,
        ]}
      >
        <LinearGradient
          colors={disabled ? [colors.textMuted, colors.textMuted] : [colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.base, sizeStyle.base, styles.gradientInner, fullWidth && styles.full]}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        sizeStyle.base,
        { backgroundColor: v.bg, borderColor: v.border },
        fullWidth && styles.full,
        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
        disabled && styles.disabled,
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

function variants(colors: ReturnType<typeof useTheme>['colors']) {
  return {
    primary: { bg: colors.primary, border: colors.primary, text: '#fff' },
    secondary: { bg: colors.primarySoft, border: colors.primarySoft, text: colors.primary },
    ghost: { bg: 'transparent', border: 'transparent', text: colors.primary },
    danger: { bg: colors.danger, border: colors.danger, text: '#fff' },
    accent: { bg: colors.accent, border: colors.accent, text: '#fff' },
  };
}

const sizes = {
  sm: { base: { paddingVertical: 10, paddingHorizontal: spacing.md }, fontSize: 14 },
  md: { base: { paddingVertical: 15, paddingHorizontal: spacing.lg }, fontSize: 16 },
  lg: { base: { paddingVertical: 18, paddingHorizontal: spacing.xl }, fontSize: 17 },
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  gradientInner: { borderWidth: 0 },
  full: { width: '100%' },
  disabled: { opacity: 0.45 },
  label: { letterSpacing: -0.2 },
});
