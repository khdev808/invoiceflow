import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { radius, spacing } from '@/constants/theme';
import { hapticLight } from '@/lib/haptics';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
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
  icon,
  loading,
  disabled,
  fullWidth,
  style,
  textStyle,
}: Props) {
  const { colors } = useTheme();
  const v = variants(colors)[variant];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: v.bg, borderColor: v.border },
        fullWidth && styles.full,
        pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
        disabled && styles.disabled,
        style,
      ]}
      onPress={() => {
        if (disabled || loading) return;
        hapticLight();
        onPress();
      }}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={20} color={v.text} /> : null}
          <Text style={[styles.label, { color: v.text }, textStyle]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

function variants(colors: ReturnType<typeof useTheme>['colors']) {
  return {
    primary: { bg: colors.primary, border: colors.primary, text: '#fff' },
    secondary: { bg: colors.surface, border: colors.border, text: colors.primary },
    ghost: { bg: 'transparent', border: 'transparent', text: colors.primary },
    danger: { bg: colors.danger, border: colors.danger, text: '#fff' },
    accent: { bg: colors.accent, border: colors.accent, text: '#fff' },
  };
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  full: { width: '100%' },
  disabled: { opacity: 0.5 },
  label: { fontSize: 16, fontWeight: '700' },
});
