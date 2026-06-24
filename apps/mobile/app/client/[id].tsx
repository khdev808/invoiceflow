import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useCallback, useState } from 'react';
import { useLocalSearchParams, useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { clientsApi } from '@/lib/api';
import { colors, radius, spacing, shadows } from '@/constants/theme';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    clientsApi.get(id).then(({ data }) => setClient(data)).finally(() => setLoading(false));
  }, [id]));

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />;
  if (!client) return <Text style={{ textAlign: 'center', marginTop: 40 }}>Client not found</Text>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{client.name.charAt(0)}</Text></View>
        <Text style={styles.name}>{client.name}</Text>
        {client.company && <Text style={styles.company}>{client.company}</Text>}
      </View>

      <View style={styles.infoCard}>
        {client.email && <InfoRow icon="mail" label="Email" value={client.email} />}
        {client.phone && <InfoRow icon="call" label="Phone" value={client.phone} />}
        {client.address && <InfoRow icon="location" label="Address" value={`${client.address}${client.city ? `, ${client.city}` : ''}${client.state ? ` ${client.state}` : ''}`} />}
      </View>

      <TouchableOpacity style={styles.createBtn} onPress={() => router.push({ pathname: '/invoice/create', params: { clientId: id } })}>
        <Ionicons name="add-circle" size={22} color="#fff" />
        <Text style={styles.createBtnText}>New Invoice for {client.name.split(' ')[0]}</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recent Invoices</Text>
      {client.invoices?.length === 0 && <Text style={styles.empty}>No invoices yet</Text>}
      {client.invoices?.map((inv: any) => (
        <TouchableOpacity key={inv.id} style={styles.invCard} onPress={() => router.push(`/invoice/${inv.id}`)}>
          <Text style={styles.invNum}>{inv.documentNumber}</Text>
          <Text style={styles.invAmount}>${inv.total.toFixed(2)}</Text>
          <Text style={styles.invStatus}>{inv.status}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon as any} size={18} color={colors.primary} />
      <View><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', padding: spacing.xl, backgroundColor: colors.surface },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  name: { fontSize: 24, fontWeight: '800', color: colors.text },
  company: { fontSize: 16, color: colors.textSecondary },
  infoCard: { backgroundColor: colors.surface, margin: spacing.lg, borderRadius: radius.md, padding: spacing.md, ...shadows.sm },
  infoRow: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { fontSize: 12, color: colors.textMuted },
  infoValue: { fontSize: 15, color: colors.text, fontWeight: '500' },
  createBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary, marginHorizontal: spacing.lg, padding: spacing.md, borderRadius: radius.md },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, paddingHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.sm },
  empty: { textAlign: 'center', color: colors.textMuted, padding: spacing.lg },
  invCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, marginHorizontal: spacing.lg, marginBottom: spacing.sm, padding: spacing.md, borderRadius: radius.md, ...shadows.sm },
  invNum: { flex: 1, fontWeight: '700', color: colors.text },
  invAmount: { fontWeight: '800', color: colors.text, marginRight: spacing.md },
  invStatus: { fontSize: 12, color: colors.primary, fontWeight: '700' },
});
