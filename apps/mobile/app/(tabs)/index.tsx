import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/auth';
import { invoicesApi, notificationsApi } from '@/lib/api';
import { colors, radius, spacing, shadows } from '@/constants/theme';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<any>(null);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [dashRes, notifRes] = await Promise.all([
        invoicesApi.dashboard(),
        notificationsApi.unreadCount().catch(() => ({ data: 0 })),
      ]);
      setStats(dashRes.data);
      setUnread(typeof notifRes.data === 'number' ? notifRes.data : notifRes.data);
    } catch {
      // offline fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'there'} 👋</Text>
          <Text style={styles.business}>{user?.businessName || 'Your Business'}</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          {unread > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unread}</Text></View>}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/invoice/create')}>
        <Ionicons name="add-circle" size={28} color="#fff" />
        <View style={{ flex: 1 }}>
          <Text style={styles.createTitle}>Create Invoice</Text>
          <Text style={styles.createSub}>Ready in under 30 seconds</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.8)" />
      </TouchableOpacity>

      <View style={styles.statsGrid}>
        {[
          { label: 'Revenue', value: formatCurrency(stats?.totalRevenue || 0), icon: 'trending-up', color: colors.accent },
          { label: 'Outstanding', value: formatCurrency(stats?.outstandingAmount || 0), icon: 'time', color: colors.warning },
          { label: 'Overdue', value: formatCurrency(stats?.overdueAmount || 0), icon: 'alert-circle', color: colors.danger },
          { label: 'Expenses', value: formatCurrency(stats?.totalExpenses || 0), icon: 'receipt', color: colors.textSecondary },
        ].map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Ionicons name={s.icon as any} size={22} color={s.color} />
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionRow}>
          {[
            { label: 'Estimate', icon: 'document-text', route: '/invoice/create?type=ESTIMATE' },
            { label: 'Client', icon: 'person-add', route: '/client/create' },
            { label: 'Expense', icon: 'camera', route: '/expense/create' },
            { label: 'Time', icon: 'timer', route: '/time/create' },
          ].map((a) => (
            <TouchableOpacity key={a.label} style={styles.actionBtn} onPress={() => router.push(a.route as any)}>
              <View style={styles.actionIcon}><Ionicons name={a.icon as any} size={22} color={colors.primary} /></View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNum}>{stats?.paidCount || 0}</Text>
          <Text style={styles.summaryLabel}>Paid</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNum}>{stats?.outstandingCount || 0}</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNum}>{stats?.clientCount || 0}</Text>
          <Text style={styles.summaryLabel}>Clients</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNum}>{stats?.estimatesPending || 0}</Text>
          <Text style={styles.summaryLabel}>Estimates</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, paddingTop: spacing.md },
  greeting: { fontSize: 24, fontWeight: '800', color: colors.text },
  business: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  notifBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...shadows.sm },
  badge: { position: 'absolute', top: 4, right: 4, backgroundColor: colors.danger, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  createBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, marginHorizontal: spacing.lg, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, ...shadows.md },
  createTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  createSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.lg, gap: spacing.sm },
  statCard: { width: '48%', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, ...shadows.sm },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: spacing.xs },
  statLabel: { fontSize: 13, color: colors.textSecondary },
  quickActions: { paddingHorizontal: spacing.lg },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { alignItems: 'center', width: '23%' },
  actionIcon: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...shadows.sm },
  actionLabel: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.xs, fontWeight: '600' },
  summaryRow: { flexDirection: 'row', padding: spacing.lg, gap: spacing.sm, marginBottom: spacing.xl },
  summaryCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', ...shadows.sm },
  summaryNum: { fontSize: 22, fontWeight: '800', color: colors.primary },
  summaryLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
});
