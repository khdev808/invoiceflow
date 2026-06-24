import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/auth';
import { colors, radius, spacing, shadows } from '@/constants/theme';

const MENU_SECTIONS = [
  {
    title: 'Business',
    items: [
      { label: 'Expenses', icon: 'receipt', route: '/expenses', color: colors.warning },
      { label: 'Time Tracking', icon: 'timer', route: '/time', color: colors.primary },
      { label: 'Reports', icon: 'bar-chart', route: '/reports', color: colors.accent },
      { label: 'Estimates', icon: 'document-text', route: '/invoice/create?type=ESTIMATE', color: '#7C3AED' },
      { label: 'Credit Notes', icon: 'remove-circle', route: '/invoice/create?type=CREDIT_NOTE', color: colors.danger },
      { label: 'Products', icon: 'pricetag', route: '/products', color: '#0F766E' },
      { label: 'Mileage', icon: 'car', route: '/mileage', color: '#7C3AED' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { label: 'Business Profile', icon: 'business', route: '/settings/profile', color: colors.text },
      { label: 'Invoice Templates', icon: 'color-palette', route: '/settings/templates', color: colors.primary },
      { label: 'Payment Methods', icon: 'card', route: '/settings/payments', color: colors.accent },
      { label: 'Reminders & Late Fees', icon: 'alarm', route: '/settings/reminders', color: colors.danger },
      { label: 'Language', icon: 'language', route: '/settings/language', color: colors.primary },
    ],
  },
];

export default function MoreScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
        </View>
        <View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.planBadge}><Text style={styles.planText}>Free Plan</Text></View>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  profile: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md, backgroundColor: colors.surface, marginBottom: spacing.md },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '700', color: colors.text },
  email: { fontSize: 14, color: colors.textSecondary },
  planBadge: { backgroundColor: colors.primary + '15', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm, alignSelf: 'flex-start', marginTop: spacing.xs },
  planText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.xs, gap: spacing.md, ...shadows.sm },
  menuIcon: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.text },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, margin: spacing.lg, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.danger + '40' },
  logoutText: { fontSize: 16, fontWeight: '600', color: colors.danger },
  version: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginBottom: spacing.xl },
});
