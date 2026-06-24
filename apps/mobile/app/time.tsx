import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { timeApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/format';
import { hapticLight } from '@/lib/haptics';
import { devLogAction } from '@/lib/devLog';
import { radius, spacing } from '@/constants/theme';

export default function TimeScreen() {
  const { colors } = useTheme();
  const currency = useUserCurrency();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = async () => {
    try {
      const { data } = await timeApi.list();
      setEntries(data);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const totalBillable = entries.filter((e) => e.billable && !e.invoiced).reduce((s, e) => s + e.hours * e.rate, 0);

  const toggleSelect = (id: string) => {
    hapticLight('time:toggle-entry');
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const billSelected = async () => {
    devLogAction('time:bill-selected', { count: selected.size });
    if (selected.size === 0) {
      Alert.alert('Select entries', 'Tap unbilled entries to select them first.');
      return;
    }
    try {
      const { data: lineItems } = await timeApi.toLineItems([...selected]);
      router.push({ pathname: '/invoice/create', params: { prefilled: JSON.stringify(lineItems) } });
    } catch {
      Alert.alert('Error', 'Failed to convert time entries');
    }
  };

  return (
    <Screen edges={[]}>
      <LinearGradient colors={[colors.accent, colors.accentDark]} style={styles.summary}>
        <Text style={styles.summaryLabel}>Unbilled Time</Text>
        <Text style={styles.summaryValue}>{formatCurrency(totalBillable, currency)}</Text>
      </LinearGradient>

      <View style={styles.actions}>
        <Button label="Log Time Entry" icon="timer-outline" onPress={() => router.push('/time/create')} fullWidth />
      </View>

      {selected.size > 0 && (
        <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.sm }}>
          <Button label={`Bill ${selected.size} entries to Invoice`} icon="document-text" onPress={billSelected} variant="accent" fullWidth />
        </View>
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }}
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(); }}
          ListEmptyComponent={
            <EmptyState icon="timer-outline" title="No time logged" message="Track billable hours and convert them to invoice line items." actionLabel="Log Time" onAction={() => router.push('/time/create')} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: selected.has(item.id) ? colors.primary : colors.border },
                selected.has(item.id) && { borderWidth: 2 },
              ]}
              onPress={() => !item.invoiced && toggleSelect(item.id)}
              disabled={item.invoiced}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.desc, { color: colors.text }]}>{item.description}</Text>
                <Text style={[styles.meta, { color: colors.textSecondary }]}>{item.client?.name || 'No client'} · {item.hours}h @ {formatCurrency(item.rate, currency)}/hr</Text>
                <Text style={[styles.date, { color: colors.textMuted }]}>{formatDate(item.date)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.amount, { color: colors.text }]}>{formatCurrency(item.hours * item.rate, currency)}</Text>
                {item.invoiced && <Text style={[styles.invoiced, { color: colors.accent }]}>Invoiced</Text>}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { padding: spacing.xl, alignItems: 'center' },
  summaryLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 14 },
  summaryValue: { color: '#fff', fontSize: 36, fontWeight: '800', marginTop: 4 },
  actions: { padding: spacing.lg, paddingBottom: spacing.sm },
  card: { flexDirection: 'row', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1 },
  desc: { fontSize: 15, fontWeight: '600' },
  meta: { fontSize: 13, marginTop: 2 },
  date: { fontSize: 12, marginTop: 2 },
  amount: { fontSize: 17, fontWeight: '800' },
  invoiced: { fontSize: 11, fontWeight: '700', marginTop: 4 },
});
