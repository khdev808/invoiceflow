import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { radius, shadows } from '@/constants/theme';
import { hapticLight } from '@/lib/haptics';

interface Props {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: 'md' | 'lg';
  action?: string;
  variant?: 'primary' | 'soft';
}

export function IconButton({ onPress, icon = 'add', size = 'md', action, variant = 'primary' }: Props) {
  const { colors } = useTheme();
  const dim = size === 'lg' ? 52 : 46;

  if (variant === 'soft') {
    return (
      <TouchableOpacity
        style={[
          styles.btn,
          {
            width: dim,
            height: dim,
            borderRadius: dim / 2,
            backgroundColor: colors.surfaceAlt,
            borderColor: colors.border,
            borderWidth: 1,
          },
        ]}
        onPress={() => {
          hapticLight(action ?? `icon:${icon}`);
          onPress();
        }}
        activeOpacity={0.85}
      >
        <Ionicons name={icon} size={size === 'lg' ? 26 : 22} color={colors.primary} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => {
        hapticLight(action ?? `icon:${icon}`);
        onPress();
      }}
      activeOpacity={0.88}
      style={[shadows.primary, { borderRadius: dim / 2 }]}
    >
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.btn, { width: dim, height: dim, borderRadius: dim / 2 }]}
      >
        <Ionicons name={icon} size={size === 'lg' ? 28 : 24} color="#fff" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { alignItems: 'center', justifyContent: 'center' },
});
