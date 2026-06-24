import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, shadows } from '@/constants/theme';

const METHODS = [
  { name: 'Stripe', icon: 'card', desc: 'Credit cards, Apple Pay, Google Pay', enabled: true },
  { name: 'PayPal', icon: 'logo-paypal', desc: 'PayPal checkout integration', enabled: true },
  { name: 'Bank Transfer', icon: 'business', desc: 'ACH / wire transfer instructions', enabled: true },
  { name: 'Apple Pay', icon: 'logo-apple', desc: 'Tap to pay on iPhone', enabled: true },
  { name: 'Cash / Check', icon: 'cash', desc: 'Manual payment recording', enabled: true },
];

export default function PaymentsSettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Accept payments your clients trust</Text>
      {METHODS.map((m) => (
        <View key={m.name} style={styles.card}>
          <View style={styles.icon}><Ionicons name={m.icon as any} size={24} color={colors.primary} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{m.name}</Text>
            <Text style={styles.desc}>{m.desc}</Text>
          </View>
          <View style={styles.badge}><Text style={styles.badgeText}>Active</Text></View>
        </View>
      ))}
      <Text style={styles.note}>Connect your Stripe account in production to receive real payments. Demo mode uses mock payment links.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  subtitle: { fontSize: 15, color: colors.textSecondary, marginBottom: spacing.lg },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.md, ...shadows.sm },
  icon: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.primary + '10', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  desc: { fontSize: 13, color: colors.textSecondary },
  badge: { backgroundColor: colors.accent + '20', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.sm },
  badgeText: { fontSize: 12, fontWeight: '700', color: colors.accent },
  note: { fontSize: 13, color: colors.textMuted, marginTop: spacing.lg, textAlign: 'center', lineHeight: 20 },
});
