import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { invoicesApi } from '@/lib/api';
import { colors, radius, spacing, shadows } from '@/constants/theme';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: colors.textMuted,
  SENT: colors.primary,
  VIEWED: colors.warning,
  PAID: colors.accent,
  OVERDUE: colors.danger,
  CANCELLED: colors.textMuted,
};

function formatCurrency(n: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);
}

export default function InvoicesScreen() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const params: any = {};
      if (filter === 'estimates') params.type = 'ESTIMATE';
      else if (filter !== 'all') params.status = filter.toUpperCase();
      const { data } = await invoicesApi.list(params);
      setInvoices(data);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [filter]));

  const filters = ['all', 'draft', 'sent', 'paid', 'overdue', 'estimates'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Invoices</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/invoice/create')}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={filters}
        keyExtractor={(f) => f}
        showsHorizontalScrollIndicator={false}
        style={styles.filterList}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, filter === item && styles.filterActive]}
            onPress={() => setFilter(item)}
          >
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>No invoices yet</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/invoice/create')}>
                <Text style={styles.emptyBtnText}>Create your first invoice</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/invoice/${item.id}`)}>
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.docNum}>{item.documentNumber}</Text>
                  <Text style={styles.clientName}>{item.client?.name}</Text>
                </View>
                <Text style={styles.amount}>{formatCurrency(item.total, item.currency)}</Text>
              </View>
              <View style={styles.cardBottom}>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>{item.status}</Text>
                </View>
                <Text style={styles.type}>{item.documentType}</Text>
                <Text style={styles.date}>{new Date(item.issueDate).toLocaleDateString()}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  filterList: { maxHeight: 44, marginBottom: spacing.sm },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  docNum: { fontSize: 16, fontWeight: '700', color: colors.text },
  clientName: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  amount: { fontSize: 18, fontWeight: '800', color: colors.text },
  cardBottom: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: spacing.sm },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
  statusText: { fontSize: 12, fontWeight: '700' },
  type: { fontSize: 12, color: colors.textMuted },
  date: { fontSize: 12, color: colors.textMuted, marginLeft: 'auto' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, color: colors.textSecondary, marginTop: spacing.md },
  emptyBtn: { marginTop: spacing.md, backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.md },
  emptyBtnText: { color: '#fff', fontWeight: '700' },
});
