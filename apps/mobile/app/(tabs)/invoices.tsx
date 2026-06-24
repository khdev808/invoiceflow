import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/hooks/useI18n';
import { invoicesApi } from '@/lib/api';
import { Screen } from '@/components/ui/Screen';
import { AppHeader } from '@/components/ui/AppHeader';
import { IconButton } from '@/components/ui/IconButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/format';
import { hapticLight } from '@/lib/haptics';
import { radius, spacing } from '@/constants/theme';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'sent', label: 'Sent' },
  { key: 'paid', label: 'Paid' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'estimates', label: 'Estimates' },
  { key: 'credit', label: 'Credit' },
];

export default function InvoicesScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const params: any = {};
      if (filter === 'estimates') params.type = 'ESTIMATE';
      else if (filter === 'credit') params.type = 'CREDIT_NOTE';
      else if (filter !== 'all') params.status = filter.toUpperCase();
      const { data } = await invoicesApi.list(params);
      setInvoices(data);
      const { cacheInvoices } = await import('@/lib/offline');
      await cacheInvoices(data);
    } catch {
      const { getCachedInvoices } = await import('@/lib/offline');
      const cached = await getCachedInvoices();
      setInvoices((cached as any[]) || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [filter]));

  const styles = makeStyles(colors);

  return (
    <Screen edges={['top']}>
      <AppHeader
        title={t('invoices')}
        subtitle={`${invoices.length} document${invoices.length === 1 ? '' : 's'}`}
        right={<IconButton onPress={() => router.push('/invoice/create')} />}
      />

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(f) => f.key}
        showsHorizontalScrollIndicator={false}
        style={styles.filterList}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, { borderColor: colors.border, backgroundColor: colors.surface }, filter === item.key && { backgroundColor: colors.primary, borderColor: colors.primary }]}
            onPress={() => { hapticLight(); setFilter(item.key); }}
          >
            <Text style={[styles.filterText, { color: colors.textSecondary }, filter === item.key && styles.filterTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 48 }} color={colors.primary} />
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm, flexGrow: 1 }}
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(); }}
          ListEmptyComponent={
            <EmptyState
              icon="document-text-outline"
              title="No invoices yet"
              message="Create your first invoice and get paid faster."
              actionLabel={t('createInvoice')}
              onAction={() => router.push('/invoice/create')}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push(`/invoice/${item.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.docNum, { color: colors.text }]}>{item.documentNumber}</Text>
                  <Text style={[styles.clientName, { color: colors.textSecondary }]}>{item.client?.name}</Text>
                </View>
                <Text style={[styles.amount, { color: colors.text }]}>{formatCurrency(item.total, item.currency)}</Text>
              </View>
              <View style={styles.cardBottom}>
                <StatusBadge status={item.status} />
                <Text style={[styles.type, { color: colors.textMuted }]}>{item.documentType.replace('_', ' ')}</Text>
                <Text style={[styles.date, { color: colors.textMuted }]}>{formatDate(item.issueDate)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </Screen>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    filterList: { maxHeight: 44, marginBottom: spacing.sm },
    filterChip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1 },
    filterText: { fontSize: 14, fontWeight: '600' },
    filterTextActive: { color: '#fff' },
    card: { borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    docNum: { fontSize: 16, fontWeight: '700' },
    clientName: { fontSize: 14, marginTop: 2 },
    amount: { fontSize: 18, fontWeight: '800' },
    cardBottom: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: spacing.sm },
    type: { fontSize: 12, fontWeight: '500' },
    date: { fontSize: 12, marginLeft: 'auto' },
  });
}
