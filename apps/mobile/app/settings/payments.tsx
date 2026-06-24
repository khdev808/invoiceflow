import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { radius, spacing } from '@/constants/theme';

const METHODS = [
  { name: 'Stripe', icon: 'card', desc: 'Credit cards, Apple Pay, Google Pay', enabled: true },
  { name: 'PayPal', icon: 'logo-paypal', desc: 'PayPal checkout on portal and mobile', enabled: true },
  { name: 'Bank Transfer', icon: 'business', desc: 'ACH / wire transfer instructions', enabled: true },
  { name: 'QR Payments', icon: 'qr-code', desc: 'Scan-to-pay links on invoices', enabled: true },
  { name: 'Cash / Check', icon: 'cash', desc: 'Manual payment recording', enabled: true },
];

export default function PaymentsSettingsScreen() {
  const { colors } = useTheme();

  return (
    <Screen scroll edges={[]}>
      <View style={{ padding: spacing.lg }}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Payment methods available to your clients today.</Text>
        {METHODS.map((m) => (
          <Card key={m.name} style={styles.cardRow}>
            <View style={[styles.icon, { backgroundColor: colors.primary + '12' }]}>
              <Ionicons name={m.icon as any} size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.text }]}>{m.name}</Text>
              <Text style={[styles.desc, { color: colors.textSecondary }]}>{m.desc}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.accent + '18' }]}>
              <Text style={[styles.badgeText, { color: colors.accent }]}>Active</Text>
            </View>
          </Card>
        ))}
        <Text style={[styles.note, { color: colors.textMuted }]}>
          Add production Stripe and PayPal keys in the API environment to receive real payments. Demo mode uses mock checkout links.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: spacing.lg },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  icon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '700' },
  desc: { fontSize: 13, marginTop: 2 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.sm },
  badgeText: { fontSize: 11, fontWeight: '800' },
  note: { fontSize: 13, marginTop: spacing.lg, textAlign: 'center', lineHeight: 20 },
});
