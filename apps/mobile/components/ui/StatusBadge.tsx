import { View, Text, StyleSheet } from 'react-native';
import { statusColors } from '@/constants/theme';
import { radius } from '@/constants/theme';

interface Props {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: Props) {
  const color = statusColors[status] || statusColors.DRAFT;
  return (
    <View style={[styles.badge, { backgroundColor: color + '18' }, size === 'md' && styles.md]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }, size === 'md' && styles.textMd]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  md: { paddingHorizontal: 10, paddingVertical: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  textMd: { fontSize: 12 },
});
