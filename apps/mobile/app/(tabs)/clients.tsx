import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useCallback, useState, useEffect } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Contacts from 'expo-contacts';
import { clientsApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/hooks/useI18n';
import { Screen } from '@/components/ui/Screen';
import { AppHeader } from '@/components/ui/AppHeader';
import { IconButton } from '@/components/ui/IconButton';
import { SearchBar } from '@/components/ui/SearchBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Text } from '@/components/ui/Text';
import { hapticLight, hapticSuccess } from '@/lib/haptics';
import { devLogAction } from '@/lib/devLog';
import { fonts, layout, radius, spacing } from '@/constants/theme';

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
    <Screen edges={['top']} tabSafe>
      <AppHeader
        isTabScreen
        title={t('clients')}
        subtitle={`${clients.length} total`}
        right={
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <IconButton
              icon="people"
              variant="soft"
              action="clients:import"
              onPress={importFromContacts}
            />
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
          contentContainerStyle={{ paddingHorizontal: layout.screenPadding, flexGrow: 1 }}
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(search); }}
          ListEmptyComponent={
            <EmptyState
              illustration="empty-clients.svg"
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
              activeOpacity={0.75}
            >
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text variant="bodyBold">{item.name}</Text>
                {item.company ? <Text variant="caption" color="secondary">{item.company}</Text> : null}
                {item.email ? <Text variant="micro" color="muted" style={{ marginTop: 2 }}>{item.email}</Text> : null}
              </View>
              <View style={[styles.countBadge, { backgroundColor: colors.primarySoft }]}>
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

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      gap: spacing.md,
      borderWidth: 1,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { color: '#fff', fontSize: 20, fontFamily: fonts.extraBold },
    countBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full },
    countText: { fontSize: 12, fontFamily: fonts.bold },
  });
}
