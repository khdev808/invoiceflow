import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { mileageApi } from '@/lib/api';
import { cacheMileage, getCachedMileage } from '@/lib/offline';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { useI18n } from '@/hooks/useI18n';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Text } from '@/components/ui/Text';
import { formatCurrency, formatDate } from '@/lib/format';
import { hapticLight } from '@/lib/haptics';
import { radius, spacing } from '@/constants/theme';

export default function MileageScreen() {
  const { colors } = useTheme();
  const { t, lang } = useI18n();
  const currency = useUserCurrency();
  const [entries, setEntries] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [cached, setCached] = useState(false);

  const load = async () => {
    try {
      const [listRes, sumRes] = await Promise.all([mileageApi.list(), mileageApi.summary()]);
      setEntries(listRes.data);
      setSummary(sumRes.data);
      await cacheMileage(listRes.data);
      setCached(false);
    } catch {
      const cachedData = await getCachedMileage();
      setEntries((cachedData as any[]) || []);
      setCached(!!cachedData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const rate = summary?.defaultRate ?? 0.67;
  const unbilledDeduction = entries.filter((e) => !e.invoiced).reduce((s, e) => s + e.miles * e.rate, 0);

  const toggleSelect = (id: string) => {
    hapticLight('mileage:toggle');
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const billSelected = async () => {
    if (selected.size === 0) {
      Alert.alert(t('selectEntries'), t('selectEntriesHint'));
      return;
    }
    try {
      const { data: lineItems } = await mileageApi.toLineItems([...selected]);
      router.push({ pathname: '/invoice/create', params: { prefilled: JSON.stringify(lineItems) } });
    } catch {
      Alert.alert(t('error'), t('failedConvertMileage'));
    }
  };

  const deleteEntry = (id: string) => {
    Alert.alert(t('delete'), t('deleteMileage'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          await mileageApi.delete(id);
          load();
        },
      },
    ]);
  };

  return (
    <Screen edges={[]}>
      <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.summary}>
        <Text style={styles.summaryLabel}>
          {t('unbilledMileage')} ({formatCurrency(rate, currency, lang)}/mi)
        </Text>
        <Text style={styles.summaryValue}>{formatCurrency(unbilledDeduction, currency, lang)}</Text>
        <Text style={styles.summarySub}>
          {(summary?.totalMiles || 0).toFixed(1)} {t('milesLogged')}
        </Text>
        {cached && <Text style={styles.cachedHint}>{t('offlineCached')}</Text>}
      </LinearGradient>

      <View style={{ padding: spacing.lg }}>
        <Button label={t('logMileage')} icon="car" onPress={() => router.push('/mileage/create')} fullWidth />
      </View>

      {selected.size > 0 && (
        <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.sm }}>
          <Button
            label={t('billMileageCount', { count: selected.size })}
            icon="document-text"
            onPress={billSelected}
            variant="accent"
            fullWidth
          />
        </View>
      )}

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
            <EmptyState
              icon="car-outline"
              title={t('noMileage')}
              message={t('mileageDesc')}
              actionLabel={t('logMileage')}
              onAction={() => router.push('/mileage/create')}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: selected.has(item.id) ? colors.primary : colors.border },
                !item.invoiced && selected.has(item.id) && { borderWidth: 2 },
              ]}
              onPress={() => !item.invoiced && toggleSelect(item.id)}
              onLongPress={() => deleteEntry(item.id)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.desc, { color: colors.text }]}>{item.description}</Text>
                <Text style={[styles.meta, { color: colors.textSecondary }]}>
                  {item.miles} mi × {formatCurrency(item.rate, currency, lang)}/mi · {formatDate(item.date, lang)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.amount, { color: colors.text }]}>{formatCurrency(item.miles * item.rate, currency, lang)}</Text>
                {item.invoiced && <Text style={[styles.invoiced, { color: colors.accent }]}>{t('invoiced')}</Text>}
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
  summaryLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 13, textAlign: 'center' },
  summaryValue: { color: '#fff', fontSize: 36, fontWeight: '800', marginTop: 4 },
  summarySub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 },
  cachedHint: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 6 },
  card: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: radius.lg, marginBottom: spacing.sm, borderWidth: 1 },
  desc: { fontSize: 15, fontWeight: '600' },
  meta: { fontSize: 13, marginTop: 2 },
  amount: { fontSize: 16, fontWeight: '800' },
  invoiced: { fontSize: 11, fontWeight: '700', marginTop: 4 },
});
