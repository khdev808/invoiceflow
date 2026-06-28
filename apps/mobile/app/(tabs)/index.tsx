import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/auth';
import { invoicesApi, notificationsApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/hooks/useI18n';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { formatCurrency, formatDate } from '@/lib/format';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { hapticLight } from '@/lib/haptics';
import { devPress } from '@/lib/devLog';
import { getTabHeaderTopSpacing } from '@/lib/safeArea';
import { fonts, layout, radius, spacing } from '@/constants/theme';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const ATTENTION_STATUSES = new Set(['OVERDUE', 'SENT', 'VIEWED']);

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const { colors } = useTheme();
  const { t } = useI18n();
  const [stats, setStats] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currency = useUserCurrency();
  const firstName = user?.name?.split(' ')[0] || 'there';

  const needsAttention = useMemo(() => {
    return invoices
      .filter((inv) => ATTENTION_STATUSES.has(inv.status))
      .sort((a, b) => {
        if (a.status === 'OVERDUE' && b.status !== 'OVERDUE') return -1;
        if (b.status === 'OVERDUE' && a.status !== 'OVERDUE') return 1;
        return 0;
      })
      .slice(0, 3);
  }, [invoices]);

  const heroStat = useMemo(() => {
    const outstanding = stats?.outstandingAmount || 0;
    const revenue = stats?.totalRevenue || 0;
    if (outstanding > 0) {
      return { label: t('outstanding'), value: formatCurrency(outstanding, currency) };
    }
    return { label: t('revenue'), value: formatCurrency(revenue, currency) };
  }, [stats, currency, t]);

  const load = async () => {
    try {
      const [dashRes, notifRes, listRes] = await Promise.all([
        invoicesApi.dashboard(),
        notificationsApi.unreadCount().catch(() => ({ data: 0 })),
        invoicesApi.list().catch(() => ({ data: [] })),
      ]);
      setStats(dashRes.data);
      setUnread(typeof notifRes.data === 'number' ? notifRes.data : notifRes.data);
      setInvoices(listRes.data || []);
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
          <Text variant="caption" color="secondary" style={styles.greeting}>
            {getGreeting()}
          </Text>
          <Text variant="title">{firstName}</Text>
          {user?.businessName ? (
            <Text variant="caption" color="muted">{user.businessName}</Text>
          ) : null}
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

      <View style={[styles.heroStat, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text variant="caption" color="secondary">{heroStat.label}</Text>
        <Text style={styles.heroValue}>{loading ? '—' : heroStat.value}</Text>
      </View>

      <View style={styles.ctaWrap}>
        <Button
          label={t('createInvoice')}
          onPress={() => { hapticLight('home:create-invoice'); router.push('/invoice/create'); }}
          fullWidth
          size="lg"
          icon="add-outline"
        />
      </View>

      {needsAttention.length > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="Needs attention"
            actionLabel="See all"
            onAction={() => router.push('/(tabs)/invoices')}
          />
          {needsAttention.map((inv) => (
            <TouchableOpacity
              key={inv.id}
              style={[styles.attentionRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={devPress(`invoice:open:${inv.documentNumber}`, () => router.push(`/invoice/${inv.id}`))}
              activeOpacity={0.75}
            >
              <View style={{ flex: 1 }}>
                <Text variant="bodyBold">{inv.documentNumber}</Text>
                <Text variant="caption" color="secondary">
                  {inv.client?.name}
                  {inv.dueDate ? ` · Due ${formatDate(inv.dueDate)}` : ''}
                </Text>
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
    greeting: { marginBottom: 4 },
    notifBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: StyleSheet.hairlineWidth,
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
    badgeText: { color: '#fff', fontSize: 10, fontFamily: fonts.bold },
    heroStat: {
      marginHorizontal: layout.screenPadding,
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      padding: spacing.lg,
      marginBottom: spacing.lg,
    },
    heroValue: {
      fontSize: 36,
      fontFamily: fonts.display,
      color: colors.text,
      letterSpacing: -0.5,
      marginTop: spacing.xs,
    },
    ctaWrap: {
      paddingHorizontal: layout.screenPadding,
      marginBottom: spacing.xl,
    },
    section: { paddingHorizontal: layout.screenPadding, marginBottom: spacing.lg },
    attentionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      marginBottom: spacing.sm,
      gap: spacing.md,
    },
  });
}
