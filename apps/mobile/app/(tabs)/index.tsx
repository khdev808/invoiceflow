import { View, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
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
import { Text } from '@/components/ui/Text';
import { formatCurrency, formatDate } from '@/lib/format';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { hapticLight } from '@/lib/haptics';
import { devPress } from '@/lib/devLog';
import { getTabHeaderTopSpacing } from '@/lib/safeArea';
import { fonts, layout, radius, shadows, spacing } from '@/constants/theme';

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
      <Screen tabSafe>
        <View style={{ paddingTop: getTabHeaderTopSpacing() }}>
          <DashboardSkeleton />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll tabSafe refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}>
      <View style={[styles.header, { paddingTop: getTabHeaderTopSpacing() }]}>
        <View style={{ flex: 1 }}>
          <Text variant="caption" color="secondary" style={styles.welcomeLabel}>
            {t('home')}
          </Text>
          <Text variant="title" style={{ fontSize: 30 }}>
            {user?.name?.split(' ')[0] || 'there'} 👋
          </Text>
          <Text variant="caption" color="muted">{user?.businessName || 'Your Business'}</Text>
        </View>
        <TouchableOpacity
          style={[styles.notifBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => { hapticLight('home:notifications'); router.push('/notifications'); }}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          {unread > 0 && (
            <View style={styles.badge}>
              <Text variant="micro" style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Pressable
        onPress={() => { hapticLight('home:create-invoice'); router.push('/invoice/create'); }}
        style={({ pressed }) => [pressed && { opacity: 0.96, transform: [{ scale: 0.99 }] }]}
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroGlow} />
          <View style={styles.heroIcon}>
            <Ionicons name="flash" size={24} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>{t('createInvoice')}</Text>
            <Text style={styles.heroSub}>Professional invoice in under 30 seconds</Text>
          </View>
          <View style={styles.heroArrow}>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </View>
        </LinearGradient>
      </Pressable>

      <View style={styles.statsGrid}>
        {[
          { label: t('revenue'), value: formatCurrency(stats?.totalRevenue || 0, currency), icon: 'trending-up', color: colors.accent, soft: colors.accentSoft },
          { label: t('outstanding'), value: formatCurrency(stats?.outstandingAmount || 0, currency), icon: 'time', color: colors.warning, soft: colors.warningSoft },
          { label: t('overdue'), value: formatCurrency(stats?.overdueAmount || 0, currency), icon: 'alert-circle', color: colors.danger, soft: colors.dangerSoft },
          { label: t('expenses'), value: formatCurrency(stats?.totalExpenses || 0, currency), icon: 'receipt', color: colors.primary, soft: colors.primarySoft },
        ].map((s) => (
          <Card key={s.label} style={styles.statCard} borderless elevated>
            <View style={[styles.statIcon, { backgroundColor: s.soft }]}>
              <Ionicons name={s.icon as any} size={20} color={s.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{loading ? '—' : s.value}</Text>
            <Text variant="caption" color="secondary">{s.label}</Text>
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
              <View style={[styles.actionIcon, { backgroundColor: a.bg + '14' }]}>
                <Ionicons name={a.icon as any} size={22} color={a.bg} />
              </View>
              <Text variant="caption" style={{ textAlign: 'center' }}>{a.label}</Text>
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
            <Text variant="micro" color="muted">{s.label}</Text>
          </View>
        ))}
      </View>

      {recent.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="Recent Invoices" actionLabel="See all" onAction={() => router.push('/(tabs)/invoices')} />
          {recent.map((inv) => (
            <TouchableOpacity
              key={inv.id}
              style={[styles.recentRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={devPress(`invoice:open:${inv.documentNumber}`, () => router.push(`/invoice/${inv.id}`))}
              activeOpacity={0.75}
            >
              <View style={[styles.recentIcon, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="document-text-outline" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyBold">{inv.documentNumber}</Text>
                <Text variant="caption" color="secondary">{inv.client?.name}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <Text variant="bodyBold">{formatCurrency(inv.total, inv.currency)}</Text>
                <StatusBadge status={inv.status} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Screen>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: layout.screenPadding,
      marginBottom: spacing.lg,
    },
    welcomeLabel: { textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
    notifBtn: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      ...shadows.sm,
    },
    badge: {
      position: 'absolute',
      top: -2,
      right: -2,
      backgroundColor: colors.danger,
      borderRadius: 10,
      minWidth: 18,
      height: 18,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
      borderWidth: 2,
      borderColor: colors.background,
    },
    badgeText: { color: '#fff', fontSize: 10, fontFamily: fonts.extraBold },
    hero: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: layout.screenPadding,
      borderRadius: radius.xl,
      padding: spacing.lg,
      gap: spacing.md,
      marginBottom: spacing.lg,
      overflow: 'hidden',
      ...shadows.lg,
    },
    heroGlow: {
      position: 'absolute',
      top: -40,
      right: -20,
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: 'rgba(255,255,255,0.12)',
    },
    heroIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroTitle: { color: '#fff', fontSize: 18, fontFamily: fonts.extraBold, letterSpacing: -0.3 },
    heroSub: { color: 'rgba(255,255,255,0.88)', fontSize: 13, fontFamily: fonts.medium, marginTop: 4 },
    heroArrow: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: layout.screenPadding,
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    statCard: { width: '48.5%', marginBottom: 0 },
    statIcon: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    statValue: { fontSize: 19, fontFamily: fonts.extraBold, letterSpacing: -0.4, marginBottom: 2 },
    section: { paddingHorizontal: layout.screenPadding, marginBottom: spacing.lg },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
    actionBtn: { alignItems: 'center', width: '23%' },
    actionIcon: {
      width: 58,
      height: 58,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    summaryRow: {
      flexDirection: 'row',
      paddingHorizontal: layout.screenPadding,
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    summaryCard: {
      flex: 1,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      alignItems: 'center',
      borderWidth: 1,
    },
    summaryNum: { fontSize: 24, fontFamily: fonts.extraBold, letterSpacing: -0.5 },
    recentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      marginBottom: spacing.sm,
      gap: spacing.md,
    },
    recentIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
