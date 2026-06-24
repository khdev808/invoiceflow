import { View, StyleSheet } from 'react-native';
import { statusColors, radius, fonts } from '@/constants/theme';
import { Text } from './Text';

interface Props {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: Props) {
  const color = statusColors[status] || statusColors.DRAFT;
  const label = status.charAt(0) + status.slice(1).toLowerCase();

  return (
    <View style={[styles.badge, { backgroundColor: color + '16' }, size === 'md' && styles.md]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text
        variant="micro"
        style={[
          styles.text,
          { color, fontFamily: fonts.bold, textTransform: 'capitalize' },
          size === 'md' && styles.textMd,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  md: { paddingHorizontal: 12, paddingVertical: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  text: { letterSpacing: 0.2 },
  textMd: { fontSize: 12 },
});
