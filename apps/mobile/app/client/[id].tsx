import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useCallback, useState } from 'react';
import { useLocalSearchParams, useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { clientsApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Text } from '@/components/ui/Text';
import { formatCurrency } from '@/lib/format';
import { fonts, radius, spacing } from '@/constants/theme';

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
        <TouchableOpacity
          style={[styles.editBtn, { borderColor: colors.border }]}
          onPress={() => router.push({ pathname: '/client/create', params: { id, edit: '1' } })}
        >
          <Ionicons name="create-outline" size={18} color={colors.primary} />
          <Text style={{ color: colors.primary, fontFamily: fonts.semiBold, marginLeft: 6 }}>Edit client</Text>
        </TouchableOpacity>
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

function InfoRow({ colors, icon, label, value }: { colors: any; icon: string; label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 }}>
      <Ionicons name={icon as any} size={18} color={colors.textMuted} />
      <View>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>{label}</Text>
        <Text style={{ color: colors.text }}>{value}</Text>
      </View>
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    header: { alignItems: 'center', padding: spacing.xl, marginHorizontal: spacing.lg, marginBottom: spacing.md, borderRadius: radius.xl, borderWidth: 1 },
    avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
    avatarText: { color: '#fff', fontSize: 28, fontFamily: fonts.bold },
    name: { fontSize: 24, fontFamily: fonts.bold },
    company: { marginTop: 4 },
    editBtn: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1 },
    sectionTitle: { fontSize: 18, fontFamily: fonts.bold, marginHorizontal: spacing.lg, marginBottom: spacing.sm },
    empty: { textAlign: 'center', marginVertical: spacing.lg },
    invCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.lg, marginBottom: spacing.sm, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1 },
    invNum: { fontFamily: fonts.semiBold, marginBottom: 4 },
    invAmount: { fontFamily: fonts.bold, fontSize: 16 },
  });
}
