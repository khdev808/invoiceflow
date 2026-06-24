import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { planApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/hooks/useI18n';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { hapticLight } from '@/lib/haptics';
import { devLogAction, devPress } from '@/lib/devLog';
import { getTabHeaderTopSpacing } from '@/lib/safeArea';
import { fonts, layout, radius, shadows, spacing } from '@/constants/theme';

export default function MoreScreen() {
  const { user, logout } = useAuthStore();
  const { colors } = useTheme();
  const { t } = useI18n();
  const [planLabel, setPlanLabel] = useState(t('freePlan'));

  useEffect(() => {
    planApi.usage().then(({ data }) => {
      setPlanLabel(`${String(data.plan).toUpperCase()} · ${data.used}/${data.limit} ${t('invoicesUsed')}`);
    }).catch(() => {});
  }, []);

  const MENU_SECTIONS = [
    {
      title: t('business'),
      items: [
        { label: t('expenses'), icon: 'receipt', route: '/expenses', color: colors.warning },
        { label: t('timeTracking'), icon: 'timer', route: '/time', color: colors.primary },
        { label: t('reports'), icon: 'bar-chart', route: '/reports', color: colors.accent },
        { label: t('recurring'), icon: 'repeat', route: '/recurring', color: '#7C3AED' },
        { label: t('estimates'), icon: 'document-text', route: '/invoice/create?type=ESTIMATE', color: '#7C3AED' },
        { label: t('creditNotes'), icon: 'remove-circle', route: '/invoice/create?type=CREDIT_NOTE', color: colors.danger },
        { label: t('products'), icon: 'pricetag', route: '/products', color: '#0F766E' },
        { label: t('mileage'), icon: 'car', route: '/mileage', color: '#7C3AED' },
      ],
    },
    {
      title: t('settings'),
      items: [
        { label: t('businessProfile'), icon: 'business', route: '/settings/profile', color: colors.text },
        { label: t('invoiceTemplates'), icon: 'color-palette', route: '/settings/templates', color: colors.primary },
        { label: t('paymentMethods'), icon: 'card', route: '/settings/payments', color: colors.accent },
        { label: t('plan'), icon: 'pie-chart', route: '/settings/plan', color: colors.primary },
        { label: t('integrations'), icon: 'git-network', route: '/settings/integrations', color: colors.text },
        { label: t('remindersLateFees'), icon: 'alarm', route: '/settings/reminders', color: colors.danger },
        { label: t('language'), icon: 'language', route: '/settings/language', color: colors.primary },
      ],
    },
  ];

  const handleLogout = () => {
    devLogAction('auth:logout-prompt');
    Alert.alert(t('signOut'), t('signOutConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('signOut'), style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  const styles = makeStyles(colors);

  return (
    <Screen scroll tabSafe edges={['top']}>
      <View style={[styles.profileCard, { marginTop: getTabHeaderTopSpacing() }]}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileGradient}
        >
          <View style={styles.profileGlow} />
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <TouchableOpacity onPress={devPress('more:plan', () => router.push('/settings/plan'))}>
              <View style={styles.planBadge}>
                <Ionicons name="diamond-outline" size={12} color="#fff" />
                <Text style={styles.planText}>{planLabel}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {MENU_SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text variant="micro" color="muted" style={styles.sectionTitle}>{section.title}</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {section.items.map((item, idx) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.menuItem,
                  idx < section.items.length - 1 && { borderBottomColor: colors.borderLight, borderBottomWidth: 1 },
                ]}
                onPress={() => { hapticLight(`more:${item.label}`); router.push(item.route as any); }}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIcon, { backgroundColor: item.color + '12' }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text variant="bodyBold" style={{ flex: 1, fontFamily: fonts.semiBold }}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: colors.dangerSoft, borderColor: colors.danger + '22' }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={[styles.logoutText, { color: colors.danger }]}>{t('signOut')}</Text>
      </TouchableOpacity>

      <Text variant="micro" color="muted" style={styles.version}>InvoiceFlow v1.0.0</Text>
    </Screen>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    profileCard: {
      marginHorizontal: layout.screenPadding,
      marginBottom: spacing.lg,
      borderRadius: radius.xl,
      overflow: 'hidden',
      ...shadows.lg,
    },
    profileGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      overflow: 'hidden',
    },
    profileGlow: {
      position: 'absolute',
      top: -30,
      right: -10,
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: 'rgba(255,255,255,0.1)',
    },
    avatar: {
      width: 58,
      height: 58,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.22)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.35)',
    },
    avatarText: { color: '#fff', fontSize: 24, fontFamily: fonts.extraBold },
    profileName: { color: '#fff', fontSize: 20, fontFamily: fonts.extraBold, letterSpacing: -0.3 },
    profileEmail: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontFamily: fonts.medium, marginTop: 2 },
    planBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 10,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: radius.full,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignSelf: 'flex-start',
    },
    planText: { color: '#fff', fontSize: 12, fontFamily: fonts.semiBold },
    section: { marginBottom: spacing.md, paddingHorizontal: layout.screenPadding },
    sectionTitle: { textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing.sm, marginLeft: 4 },
    sectionCard: { borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden', ...shadows.sm },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: spacing.md },
    menuIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      marginHorizontal: layout.screenPadding,
      marginTop: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
    },
    logoutText: { fontSize: 16, fontFamily: fonts.semiBold },
    version: { textAlign: 'center', marginTop: spacing.lg, marginBottom: spacing.md },
  });
}
