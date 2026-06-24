import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { planApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/hooks/useI18n';
import { Screen } from '@/components/ui/Screen';
import { hapticLight } from '@/lib/haptics';
import { radius, spacing } from '@/constants/theme';

export default function MoreScreen() {
  const { user, logout } = useAuthStore();
  const { colors } = useTheme();
  const { t } = useI18n();
  const [planLabel, setPlanLabel] = useState(t('freePlan'));

  useEffect(() => {
    planApi.usage().then(({ data }) => {
      setPlanLabel(`${String(data.plan).toUpperCase()} · ${data.used}/${data.limit} invoices`);
    }).catch(() => {});
  }, []);

  const MENU_SECTIONS = [
    {
      title: 'Business',
      items: [
        { label: t('expenses'), icon: 'receipt', route: '/expenses', color: colors.warning },
        { label: 'Time Tracking', icon: 'timer', route: '/time', color: colors.primary },
        { label: 'Reports', icon: 'bar-chart', route: '/reports', color: colors.accent },
        { label: t('recurring'), icon: 'repeat', route: '/recurring', color: '#7C3AED' },
        { label: 'Estimates', icon: 'document-text', route: '/invoice/create?type=ESTIMATE', color: '#7C3AED' },
        { label: 'Credit Notes', icon: 'remove-circle', route: '/invoice/create?type=CREDIT_NOTE', color: colors.danger },
        { label: 'Products', icon: 'pricetag', route: '/products', color: '#0F766E' },
        { label: 'Mileage', icon: 'car', route: '/mileage', color: '#7C3AED' },
      ],
    },
    {
      title: t('settings'),
      items: [
        { label: 'Business Profile', icon: 'business', route: '/settings/profile', color: colors.text },
        { label: 'Invoice Templates', icon: 'color-palette', route: '/settings/templates', color: colors.primary },
        { label: 'Payment Methods', icon: 'card', route: '/settings/payments', color: colors.accent },
        { label: t('plan'), icon: 'pie-chart', route: '/settings/plan', color: colors.primary },
        { label: t('integrations'), icon: 'git-network', route: '/settings/integrations', color: colors.text },
        { label: 'Reminders & Late Fees', icon: 'alarm', route: '/settings/reminders', color: colors.danger },
        { label: 'Language', icon: 'language', route: '/settings/language', color: colors.primary },
      ],
    },
  ];

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  const styles = makeStyles(colors);

  return (
    <Screen scroll edges={['top']}>
      <View style={[styles.profile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.text }]}>{user?.name}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
          <TouchableOpacity onPress={() => router.push('/settings/plan')}>
            <View style={[styles.planBadge, { backgroundColor: colors.primary + '12' }]}>
              <Text style={[styles.planText, { color: colors.primary }]}>{planLabel}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {MENU_SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{section.title}</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {section.items.map((item, idx) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, idx < section.items.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}
                onPress={() => { hapticLight(); router.push(item.route as any); }}
              >
                <View style={[styles.menuIcon, { backgroundColor: item.color + '14' }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color={colors.danger} />
        <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={[styles.version, { color: colors.textMuted }]}>InvoiceFlow v1.0.0</Text>
    </Screen>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginHorizontal: spacing.lg, marginTop: spacing.sm, marginBottom: spacing.lg, padding: spacing.lg, borderRadius: radius.xl, borderWidth: 1 },
    avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
    name: { fontSize: 18, fontWeight: '800' },
    email: { fontSize: 14, marginTop: 2 },
    planBadge: { marginTop: 8, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full, alignSelf: 'flex-start' },
    planText: { fontSize: 12, fontWeight: '700' },
    section: { marginBottom: spacing.md, paddingHorizontal: spacing.lg },
    sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
    sectionCard: { borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: spacing.md },
    menuIcon: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
    menuLabel: { flex: 1, fontSize: 16, fontWeight: '600' },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, margin: spacing.lg, padding: spacing.md },
    logoutText: { fontSize: 16, fontWeight: '600' },
    version: { textAlign: 'center', fontSize: 12, marginBottom: spacing.xxl },
  });
}
