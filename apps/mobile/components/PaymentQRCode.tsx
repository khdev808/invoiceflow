import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '@/contexts/ThemeContext';
import { radius, spacing } from '@/constants/theme';

interface Props {
  value: string;
  label?: string;
  size?: number;
}

export function PaymentQRCode({ value, label = 'Scan to pay', size = 160 }: Props) {
  const { colors } = useTheme();
  if (!value) return null;

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <QRCode value={value} size={size} backgroundColor={colors.surface} color={colors.text} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  label: { fontSize: 13, fontWeight: '600' },
});
