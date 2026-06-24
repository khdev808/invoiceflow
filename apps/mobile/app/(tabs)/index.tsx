import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/stores/auth';
import { invoicesApi, notificationsApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/hooks/useI18n';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/format';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { hapticLight } from '@/lib/haptics';
import { devPress } from '@/lib/devLog';
import { getTabHeaderTopSpacing } from '@/lib/safeArea';
import { radius, spacing, shadows } from '@/constants/theme';

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const { colors } = useTheme();
  const { t } = useI18n();
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currency = useUserCurrency();

  const load = async () => {
    try {
      const [dashRes, notifRes, listRes] = await Promise.all([
        invoicesApi.dashboard(),
        notificationsApi.unreadCount().catch(() => ({ data: 0 })),
        invoicesApi.list().catch(() => ({ data: [] })),
      ]);
      setStats(dashRes.data);
      setUnread(typeof notifRes.data === 'number' ? notifRes.data : notifRes.data);
      setRecent((listRes.data || []).slice(0, 5));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, []));

  const styles = makeStyles(colors);

  if (loading && !stats) {
    return (
      <Screen>
        <View style={{ paddingTop: getTabHeaderTopSpacing() }}>
          <DashboardSkeleton />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}>
      <View style={[styles.header, { paddingTop: getTabHeaderTopSpacing() }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{t('home')}, {user?.name?.split(' ')[0] || 'there'} 👋</Text>
          <Text style={styles.business}>{user?.businessName || 'Your Business'}</Text>
        </View>
        <TouchableOpacity
          style={[styles.notifBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => { hapticLight('home:notifications'); router.push('/notifications'); }}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          {unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Pressable
        onPress={() => { hapticLight('home:create-invoice'); router.push('/invoice/create'); }}
        style={({ pressed }) => [pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }]}
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroIcon}>
            <Ionicons name="flash" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>{t('createInvoice')}</Text>
            <Text style={styles.heroSub}>Ready in under 30 seconds</Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={32} color="rgba(255,255,255,0.9)" />
        </LinearGradient>
      </Pressable>

      <View style={styles.statsGrid}>
        {[
          { label: t('revenue'), value: formatCurrency(stats?.totalRevenue || 0, currency), icon: 'trending-up', color: colors.accent },
          { label: t('outstanding'), value: formatCurrency(stats?.outstandingAmount || 0, currency), icon: 'time', color: colors.warning },
          { label: t('overdue'), value: formatCurrency(stats?.overdueAmount || 0, currency), icon: 'alert-circle', color: colors.danger },
          { label: t('expenses'), value: formatCurrency(stats?.totalExpenses || 0, currency), icon: 'receipt', color: colors.textSecondary },
        ].map((s) => (
          <Card key={s.label} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: s.color + '15' }]}>
              <Ionicons name={s.icon as any} size={20} color={s.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{loading ? '—' : s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.label}</Text>
          </Card>
        ))}
      </View>

      <View style={styles.section}>
        <SectionHeader title="Quick Actions" />
        <View style={styles.actionRow}>
          {[
            { label: 'Estimate', icon: 'document-text', route: '/invoice/create?type=ESTIMATE', bg: '#7C3AED' },
            { label: 'Client', icon: 'person-add', route: '/client/create', bg: colors.primary },
            { label: 'Expense', icon: 'camera', route: '/expense/create', bg: colors.warning },
            { label: 'Time', icon: 'timer', route: '/time/create', bg: colors.accent },
          ].map((a) => (
            <TouchableOpacity
              key={a.label}
              style={styles.actionBtn}
              onPress={() => { hapticLight(`home:quick:${a.label}`); router.push(a.route as any); }}
            >
              <View style={[styles.actionIcon, { backgroundColor: a.bg + '18' }]}>
                <Ionicons name={a.icon as any} size={22} color={a.bg} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.summaryRow}>
        {[
          { num: stats?.paidCount || 0, label: 'Paid', color: colors.accent },
          { num: stats?.outstandingCount || 0, label: 'Pending', color: colors.warning },
          { num: stats?.clientCount || 0, label: 'Clients', color: colors.primary },
          { num: stats?.estimatesPending || 0, label: 'Estimates', color: '#7C3AED' },
        ].map((s) => (
          <View key={s.label} style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.summaryNum, { color: s.color }]}>{s.num}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {recent.length > 0 && (
        <View style={[styles.section, { paddingBottom: spacing.xxl }]}>
          <SectionHeader title="Recent Invoices" actionLabel="See all" onAction={() => router.push('/(tabs)/invoices')} />
          {recent.map((inv) => (
            <TouchableOpacity
              key={inv.id}
              style={[styles.recentRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={devPress(`invoice:open:${inv.documentNumber}`, () => router.push(`/invoice/${inv.id}`))}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.recentNum, { color: colors.text }]}>{inv.documentNumber}</Text>
                <Text style={[styles.recentClient, { color: colors.textSecondary }]}>{inv.client?.name}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={[styles.recentAmount, { color: colors.text }]}>{formatCurrency(inv.total, inv.currency)}</Text>
                <StatusBadge status={inv.status} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Screen>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
    greeting: { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
    business: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
    notifBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, ...shadows.sm },
    badge: { position: 'absolute', top: -2, right: -2, backgroundColor: colors.danger, borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
    hero: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.lg, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, marginBottom: spacing.lg, ...shadows.md },
    heroIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    heroTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
    heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 2 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.lg },
    statCard: { width: '48.5%', marginBottom: 0 },
    statIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
    statValue: { fontSize: 18, fontWeight: '800' },
    statLabel: { fontSize: 12, marginTop: 2, fontWeight: '500' },
    section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
    actionBtn: { alignItems: 'center', width: '23%' },
    actionIcon: { width: 56, height: 56, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
    actionLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
    summaryRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.lg },
    summaryCard: { flex: 1, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', borderWidth: 1 },
    summaryNum: { fontSize: 22, fontWeight: '800' },
    summaryLabel: { fontSize: 11, marginTop: 2, fontWeight: '600' },
    recentRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: radius.md, borderWidth: 1, marginBottom: spacing.sm },
    recentNum: { fontSize: 15, fontWeight: '700' },
    recentClient: { fontSize: 13, marginTop: 2 },
    recentAmount: { fontSize: 16, fontWeight: '800' },
  });
}
