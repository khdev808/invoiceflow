import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing } from '@/constants/theme';
import { devPress } from '@/lib/devLog';
import { Text } from './Text';

interface Props {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Text variant="subheading">{title}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={devPress(`section:${title}:${actionLabel}`, onAction)}
          style={styles.action}
        >
          <Text variant="caption" color="primary">{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});
