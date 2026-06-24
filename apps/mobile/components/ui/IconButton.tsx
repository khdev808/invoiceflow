import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { shadows } from '@/constants/theme';
import { hapticLight } from '@/lib/haptics';

interface Props {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: 'md' | 'lg';
  /** Dev-only label for action logging. */
  action?: string;
}

export function IconButton({ onPress, icon = 'add', size = 'md', action }: Props) {
  const { colors } = useTheme();
  const dim = size === 'lg' ? 52 : 44;
  return (
    <TouchableOpacity
      style={[styles.btn, { width: dim, height: dim, borderRadius: dim / 2, backgroundColor: colors.primary }, shadows.sm]}
      onPress={() => {
        hapticLight(action ?? `icon:${icon}`);
        onPress();
      }}
      activeOpacity={0.85}
    >
      <Ionicons name={icon} size={size === 'lg' ? 28 : 24} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { alignItems: 'center', justifyContent: 'center' },
});
