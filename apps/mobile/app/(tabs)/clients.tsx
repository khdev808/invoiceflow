import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useCallback, useState, useEffect } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { clientsApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/hooks/useI18n';
import { Screen } from '@/components/ui/Screen';
import { AppHeader } from '@/components/ui/AppHeader';
import { IconButton } from '@/components/ui/IconButton';
import { SearchBar } from '@/components/ui/SearchBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { hapticLight, hapticSuccess } from '@/lib/haptics';
import { devLogAction, devPress } from '@/lib/devLog';
import { radius, spacing } from '@/constants/theme';

export default function ClientsScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (q?: string) => {
    try {
      const { data } = await clientsApi.list(q);
      setClients(data);
      const { cacheClients } = await import('@/lib/offline');
      await cacheClients(data);
    } catch {
      const { getCachedClients } = await import('@/lib/offline');
      const cached = await getCachedClients();
      setClients((cached as any[]) || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(search); }, []));

  useEffect(() => {
    const timer = setTimeout(() => load(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const importFromContacts = async () => {
    devLogAction('clients:import-contacts');
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow contacts access to import clients.');
      return;
    }
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.Emails, Contacts.Fields.PhoneNumbers, Contacts.Fields.Company],
    });
    const contact = data.find((c) => c.name);
    if (!contact) {
      Alert.alert('No contacts', 'No contacts found on this device.');
      return;
    }
    await clientsApi.create({
      name: contact.name || 'Unknown',
      email: contact.emails?.[0]?.email,
      phone: contact.phoneNumbers?.[0]?.number,
      company: contact.company,
      contactId: contact.id,
    });
    hapticSuccess();
    load(search);
  };

  const styles = makeStyles(colors);

  return (
    <Screen edges={['top']}>
      <AppHeader
        isTabScreen
        title={t('clients')}
        subtitle={`${clients.length} total`}
        right={
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <TouchableOpacity
              style={[styles.importBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={importFromContacts}
            >
              <Ionicons name="people" size={20} color={colors.primary} />
            </TouchableOpacity>
            <IconButton action="client:create" onPress={() => router.push('/client/create')} />
          </View>
        }
      />

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search clients..."
        onClear={() => setSearch('')}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 48 }} color={colors.primary} />
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg, paddingTop: 0, flexGrow: 1 }}
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(search); }}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="No clients yet"
              message="Add clients manually or import from your contacts."
              actionLabel="Add Client"
              onAction={() => router.push('/client/create')}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => { hapticLight(`client:open:${item.name}`); router.push(`/client/${item.id}`); }}
              activeOpacity={0.7}
            >
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                {item.company ? <Text style={[styles.company, { color: colors.textSecondary }]}>{item.company}</Text> : null}
                {item.email ? <Text style={[styles.email, { color: colors.textMuted }]}>{item.email}</Text> : null}
              </View>
              <View style={[styles.countBadge, { backgroundColor: colors.primary + '12' }]}>
                <Text style={[styles.countText, { color: colors.primary }]}>{item._count?.invoices || 0}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        />
      )}
    </Screen>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    importBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    card: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.md, borderWidth: 1 },
    avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
    name: { fontSize: 16, fontWeight: '700' },
    company: { fontSize: 13, marginTop: 1 },
    email: { fontSize: 12, marginTop: 2 },
    countBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm },
    countText: { fontSize: 12, fontWeight: '800' },
  });
}
