import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { mileageApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/format';
import { radius, spacing } from '@/constants/theme';

export default function MileageScreen() {
  const { colors } = useTheme();
  const currency = useUserCurrency();
  const [entries, setEntries] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [listRes, sumRes] = await Promise.all([mileageApi.list(), mileageApi.summary()]);
      setEntries(listRes.data);
      setSummary(sumRes.data);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const rate = summary?.totalMiles ? summary.totalDeduction / summary.totalMiles : 0.67;

  return (
    <Screen edges={[]}>
      <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.summary}>
        <Text style={styles.summaryLabel}>Mileage Deduction (IRS {formatCurrency(rate, currency)}/mi)</Text>
        <Text style={styles.summaryValue}>{formatCurrency(summary?.totalDeduction || 0, currency)}</Text>
        <Text style={styles.summarySub}>{(summary?.totalMiles || 0).toFixed(1)} miles logged</Text>
      </LinearGradient>

      <View style={{ padding: spacing.lg }}>
        <Button label="Log Mileage" icon="car" onPress={() => router.push('/mileage/create')} fullWidth />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: spacing.lg, paddingTop: 0, flexGrow: 1 }}
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(); }}
          ListEmptyComponent={
            <EmptyState icon="car-outline" title="No mileage yet" message="Log business trips for IRS-ready deductions." actionLabel="Log Mileage" onAction={() => router.push('/mileage/create')} />
          }
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.desc, { color: colors.text }]}>{item.description}</Text>
                <Text style={[styles.meta, { color: colors.textSecondary }]}>{item.miles} mi × {formatCurrency(item.rate, currency)}/mi · {formatDate(item.date)}</Text>
              </View>
              <Text style={[styles.amount, { color: colors.text }]}>{formatCurrency(item.miles * item.rate, currency)}</Text>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { padding: spacing.xl, alignItems: 'center' },
  summaryLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 13, textAlign: 'center' },
  summaryValue: { color: '#fff', fontSize: 36, fontWeight: '800', marginTop: 4 },
  summarySub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 },
  card: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: radius.lg, marginBottom: spacing.sm, borderWidth: 1 },
  desc: { fontSize: 15, fontWeight: '600' },
  meta: { fontSize: 13, marginTop: 2 },
  amount: { fontSize: 16, fontWeight: '800' },
});
