import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/hooks/useI18n';
import { invoicesApi } from '@/lib/api';
import { Screen } from '@/components/ui/Screen';
import { AppHeader } from '@/components/ui/AppHeader';
import { IconButton } from '@/components/ui/IconButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Text } from '@/components/ui/Text';
import { formatCurrency, formatDate } from '@/lib/format';
import { hapticLight } from '@/lib/haptics';
import { devPress } from '@/lib/devLog';
import { fonts, layout, radius, spacing } from '@/constants/theme';

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
    <Screen edges={['top']} tabSafe>
      <AppHeader
        isTabScreen
        title={t('invoices')}
        subtitle={`${invoices.length} document${invoices.length === 1 ? '' : 's'}`}
        right={<IconButton action="invoice:create" onPress={() => router.push('/invoice/create')} />}
      />

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(f) => f.key}
        showsHorizontalScrollIndicator={false}
        style={styles.filterList}
        contentContainerStyle={{ paddingHorizontal: layout.screenPadding, gap: spacing.sm }}
        renderItem={({ item }) => {
          const active = filter === item.key;
          return (
            <TouchableOpacity
              style={[
                styles.filterChip,
                { borderColor: colors.border, backgroundColor: colors.surfaceAlt },
                active && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => { hapticLight(`filter:${item.key}`); setFilter(item.key); }}
            >
              <Text
                variant="caption"
                style={[
                  { color: colors.textSecondary, fontFamily: fonts.semiBold },
                  active && { color: '#fff' },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 48 }} color={colors.primary} />
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: layout.screenPadding, paddingTop: spacing.sm, flexGrow: 1 }}
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
              onPress={devPress(`invoice:open:${item.documentNumber}`, () => router.push(`/invoice/${item.id}`))}
              activeOpacity={0.75}
            >
              <View style={[styles.docIcon, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="document-text-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyBold">{item.documentNumber}</Text>
                    <Text variant="caption" color="secondary">{item.client?.name}</Text>
                  </View>
                  <Text variant="subheading" style={{ letterSpacing: -0.3 }}>
                    {formatCurrency(item.total, item.currency)}
                  </Text>
                </View>
                <View style={styles.cardBottom}>
                  <StatusBadge status={item.status} />
                  <Text variant="micro" color="muted">{item.documentType.replace('_', ' ')}</Text>
                  <Text variant="micro" color="muted" style={{ marginLeft: 'auto' }}>
                    {formatDate(item.issueDate)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </Screen>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    filterList: { maxHeight: 48, marginBottom: spacing.sm },
    filterChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: 10,
      borderRadius: radius.full,
      borderWidth: 1,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      gap: spacing.md,
    },
    docIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardBody: { flex: 1 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardBottom: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: spacing.sm },
  });
}
