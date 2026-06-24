import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { notificationsApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatRelativeTime } from '@/lib/format';
import { hapticLight } from '@/lib/haptics';
import { radius, spacing } from '@/constants/theme';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await notificationsApi.list();
      setNotifications(data);
      await notificationsApi.markAllRead();
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const iconForType = (type: string) => {
    if (type.includes('payment')) return 'card';
    if (type.includes('viewed')) return 'eye';
    if (type.includes('signed')) return 'create';
    if (type.includes('sent')) return 'send';
    return 'notifications';
  };

  const iconColor = (type: string) => {
    if (type.includes('payment')) return colors.accent;
    if (type.includes('overdue')) return colors.danger;
    if (type.includes('viewed')) return colors.warning;
    return colors.primary;
  };

  const handlePress = (item: any) => {
    hapticLight(`notification:${item.type}`);
    const invoiceId = item.data?.invoiceId;
    if (invoiceId) router.push(`/invoice/${invoiceId}`);
  };

  return (
    <Screen edges={[]}>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 48 }} color={colors.primary} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }}
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(); }}
          ListEmptyComponent={
            <EmptyState
              icon="notifications-outline"
              title="All caught up"
              message="You'll see payment alerts, invoice views, and client signatures here."
            />
          }
          renderItem={({ item }) => {
            const tint = iconColor(item.type);
            return (
              <TouchableOpacity
                style={[
                  styles.card,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  !item.read && { borderLeftColor: colors.primary, borderLeftWidth: 3 },
                ]}
                onPress={() => handlePress(item)}
                activeOpacity={0.7}
              >
                <View style={[styles.icon, { backgroundColor: tint + '15' }]}>
                  <Ionicons name={iconForType(item.type) as any} size={20} color={tint} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.body, { color: colors.textSecondary }]}>{item.body}</Text>
                  <Text style={[styles.time, { color: colors.textMuted }]}>{formatRelativeTime(item.createdAt)}</Text>
                </View>
                {item.data?.invoiceId ? (
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                ) : null}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.md, borderWidth: 1 },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '700' },
  body: { fontSize: 14, marginTop: 2, lineHeight: 20 },
  time: { fontSize: 12, marginTop: 4 },
});
