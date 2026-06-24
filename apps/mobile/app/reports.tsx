import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { reportsApi } from '@/lib/api';
import { colors, radius, spacing, shadows } from '@/constants/theme';

export default function ReportsScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsApi.profitLoss().then(({ data: d }) => setData(d)).finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Net Profit</Text>
        <Text style={[styles.heroValue, { color: (data?.profit || 0) >= 0 ? colors.accent : colors.danger }]}>
          ${(data?.profit || 0).toFixed(2)}
        </Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, { borderLeftColor: colors.accent }]}>
          <Text style={styles.cardLabel}>Income</Text>
          <Text style={styles.cardValue}>${(data?.income || 0).toFixed(2)}</Text>
        </View>
        <View style={[styles.card, { borderLeftColor: colors.danger }]}>
          <Text style={styles.cardLabel}>Expenses</Text>
          <Text style={styles.cardValue}>${(data?.expenses || 0).toFixed(2)}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Income by Month</Text>
      {data?.incomeByMonth && Object.entries(data.incomeByMonth).map(([month, amount]) => (
        <View key={month} style={styles.monthRow}>
          <Text style={styles.monthLabel}>{month}</Text>
          <View style={styles.barContainer}>
            <View style={[styles.bar, { width: `${Math.min(100, ((amount as number) / (data.income || 1)) * 100)}%` }]} />
          </View>
          <Text style={styles.monthValue}>${(amount as number).toFixed(0)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { backgroundColor: colors.primary, padding: spacing.xl, alignItems: 'center' },
  heroLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 16 },
  heroValue: { fontSize: 42, fontWeight: '800', color: '#fff', marginTop: spacing.xs },
  row: { flexDirection: 'row', padding: spacing.lg, gap: spacing.sm },
  card: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderLeftWidth: 4, ...shadows.sm },
  cardLabel: { fontSize: 13, color: colors.textSecondary },
  cardValue: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  monthRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
  monthLabel: { width: 70, fontSize: 13, color: colors.textSecondary },
  barContainer: { flex: 1, height: 8, backgroundColor: colors.surfaceAlt, borderRadius: 4 },
  bar: { height: 8, backgroundColor: colors.primary, borderRadius: 4 },
  monthValue: { width: 60, fontSize: 13, fontWeight: '700', color: colors.text, textAlign: 'right' },
});
