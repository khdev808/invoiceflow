import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useCallback, useState } from 'react';
import { useLocalSearchParams, useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { clientsApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency } from '@/lib/format';
import { radius, spacing } from '@/constants/theme';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    clientsApi.get(id).then(({ data }) => setClient(data)).finally(() => setLoading(false));
  }, [id]));

  const styles = makeStyles(colors);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />;
  if (!client) return <Text style={{ textAlign: 'center', marginTop: 40, color: colors.text }}>Client not found</Text>;

  return (
    <Screen scroll>
      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{client.name.charAt(0)}</Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{client.name}</Text>
        {client.company ? <Text style={[styles.company, { color: colors.textSecondary }]}>{client.company}</Text> : null}
      </View>

      <Card style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md }}>
        {client.email ? <InfoRow colors={colors} icon="mail" label="Email" value={client.email} /> : null}
        {client.phone ? <InfoRow colors={colors} icon="call" label="Phone" value={client.phone} /> : null}
        {client.address ? (
          <InfoRow
            colors={colors}
            icon="location"
            label="Address"
            value={`${client.address}${client.city ? `, ${client.city}` : ''}${client.state ? ` ${client.state}` : ''}`}
          />
        ) : null}
      </Card>

      <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.lg }}>
        <Button
          label={`New Invoice for ${client.name.split(' ')[0]}`}
          icon="add-circle"
          onPress={() => router.push({ pathname: '/invoice/create', params: { clientId: id } })}
          fullWidth
        />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Invoices</Text>
      {client.invoices?.length === 0 && (
        <Text style={[styles.empty, { color: colors.textMuted }]}>No invoices yet for this client.</Text>
      )}
      {client.invoices?.map((inv: any) => (
        <TouchableOpacity
          key={inv.id}
          style={[styles.invCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => router.push(`/invoice/${inv.id}`)}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.invNum, { color: colors.text }]}>{inv.documentNumber}</Text>
            <StatusBadge status={inv.status} />
          </View>
          <Text style={[styles.invAmount, { color: colors.text }]}>{formatCurrency(inv.total)}</Text>
        </TouchableOpacity>
      ))}
    </Screen>
  );
}

function InfoRow({ icon, label, value, colors }: { icon: string; label: string; value: string; colors: any }) {
  return (
    <View style={[infoStyles.row, { borderBottomColor: colors.border }]}>
      <Ionicons name={icon as any} size={18} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={[infoStyles.label, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[infoStyles.value, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1 },
  label: { fontSize: 12, fontWeight: '600' },
  value: { fontSize: 15, fontWeight: '500', marginTop: 2 },
});

function makeStyles(colors: any) {
  return StyleSheet.create({
    header: { alignItems: 'center', padding: spacing.xl, marginHorizontal: spacing.lg, marginTop: spacing.sm, borderRadius: radius.xl, borderWidth: 1, marginBottom: spacing.md },
    avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
    avatarText: { color: '#fff', fontSize: 28, fontWeight: '800' },
    name: { fontSize: 24, fontWeight: '800' },
    company: { fontSize: 16, marginTop: 4 },
    sectionTitle: { fontSize: 18, fontWeight: '700', paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
    empty: { textAlign: 'center', padding: spacing.lg },
    invCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.lg, marginBottom: spacing.sm, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, gap: spacing.md },
    invNum: { fontWeight: '700', fontSize: 15, marginBottom: 4 },
    invAmount: { fontWeight: '800', fontSize: 16 },
  });
}
