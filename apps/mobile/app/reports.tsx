import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { reportsApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/format';
import { radius, spacing } from '@/constants/theme';

export default function ReportsScreen() {
  const { colors } = useTheme();
  const currency = useUserCurrency();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsApi.profitLoss().then(({ data: d }) => setData(d)).finally(() => setLoading(false));
  }, []);

  const profit = data?.profit || 0;

  return (
    <Screen scroll edges={[]}>
      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.hero}>
        <Text style={styles.heroLabel}>Net Profit</Text>
        {loading ? (
          <Skeleton height={48} width={180} borderRadius={radius.md} style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
        ) : (
          <Text style={[styles.heroValue, { color: profit >= 0 ? '#fff' : '#FCA5A5' }]}>
            {formatCurrency(profit, currency)}
          </Text>
        )}
      </LinearGradient>

      <View style={styles.row}>
        <Card style={styles.halfCard}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Income</Text>
          {loading ? <Skeleton height={28} width="70%" /> : (
            <Text style={[styles.cardValue, { color: colors.accent }]}>{formatCurrency(data?.income || 0, currency)}</Text>
          )}
        </Card>
        <Card style={styles.halfCard}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Expenses</Text>
          {loading ? <Skeleton height={28} width="70%" /> : (
            <Text style={[styles.cardValue, { color: colors.danger }]}>{formatCurrency(data?.expenses || 0, currency)}</Text>
          )}
        </Card>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Income by Month</Text>
      {loading ? (
        <View style={{ paddingHorizontal: spacing.lg, gap: 12 }}>
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} height={32} borderRadius={radius.md} />)}
        </View>
      ) : data?.incomeByMonth && Object.entries(data.incomeByMonth).map(([month, amount]) => (
        <View key={month} style={styles.monthRow}>
          <Text style={[styles.monthLabel, { color: colors.textSecondary }]}>{month}</Text>
          <View style={[styles.barContainer, { backgroundColor: colors.surfaceAlt }]}>
            <View style={[styles.bar, { width: `${Math.min(100, ((amount as number) / (data.income || 1)) * 100)}%`, backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.monthValue, { color: colors.text }]}>{formatCurrency(amount as number, currency)}</Text>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { padding: spacing.xl, alignItems: 'center' },
  heroLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: '500' },
  heroValue: { fontSize: 42, fontWeight: '800', marginTop: spacing.xs },
  row: { flexDirection: 'row', padding: spacing.lg, gap: spacing.sm },
  halfCard: { flex: 1 },
  cardLabel: { fontSize: 13, fontWeight: '600' },
  cardValue: { fontSize: 22, fontWeight: '800', marginTop: 6 },
  sectionTitle: { fontSize: 18, fontWeight: '700', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  monthRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
  monthLabel: { width: 72, fontSize: 13, fontWeight: '500' },
  barContainer: { flex: 1, height: 10, borderRadius: 5, overflow: 'hidden' },
  bar: { height: 10, borderRadius: 5 },
  monthValue: { width: 72, fontSize: 13, fontWeight: '700', textAlign: 'right' },
});
