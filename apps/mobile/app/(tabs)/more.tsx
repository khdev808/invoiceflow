import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { planApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/hooks/useI18n';
import { radius, spacing, shadows } from '@/constants/theme';

export default function MoreScreen() {
  const { user, logout } = useAuthStore();
  const { colors } = useTheme();
  const { t } = useI18n();
  const [planLabel, setPlanLabel] = useState(t('freePlan'));

  useEffect(() => {
    planApi.usage().then(({ data }) => {
      setPlanLabel(`${data.plan} — ${data.used}/${data.limit} invoices`);
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
    <ScrollView style={styles.container}>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
        </View>
        <View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <TouchableOpacity onPress={() => router.push('/settings/plan')}>
            <View style={styles.planBadge}><Text style={styles.planText}>{planLabel}</Text></View>
          </TouchableOpacity>
        </View>
      </View>

      {MENU_SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item) => (
            <TouchableOpacity key={item.label} style={styles.menuItem} onPress={() => router.push(item.route as any)}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color={colors.danger} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>InvoiceFlow v1.0.0</Text>
    </ScrollView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, backgroundColor: colors.surface, marginBottom: spacing.md },
    avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontSize: 24, fontWeight: '700' },
    name: { fontSize: 18, fontWeight: '700', color: colors.text },
    email: { fontSize: 14, color: colors.textSecondary },
    planBadge: { marginTop: 6, backgroundColor: colors.primary + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full, alignSelf: 'flex-start' },
    planText: { fontSize: 12, fontWeight: '700', color: colors.primary },
    section: { marginBottom: spacing.md },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.lg, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
    menuIcon: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
    menuLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.text },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, margin: spacing.lg, padding: spacing.md },
    logoutText: { fontSize: 16, fontWeight: '600', color: colors.danger },
    version: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginBottom: spacing.xxl },
  });
}
