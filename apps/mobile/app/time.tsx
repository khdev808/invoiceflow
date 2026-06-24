import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { timeApi } from '@/lib/api';
import { colors, radius, spacing, shadows } from '@/constants/theme';
import { Alert } from 'react-native';

export default function TimeScreen() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = async () => {
    try {
      const { data } = await timeApi.list();
      setEntries(data);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const totalBillable = entries.filter((e) => e.billable && !e.invoiced).reduce((s, e) => s + e.hours * e.rate, 0);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const billSelected = async () => {
    if (selected.size === 0) { Alert.alert('Select entries', 'Tap entries to select, then bill them'); return; }
    try {
      const { data: lineItems } = await timeApi.toLineItems([...selected]);
      router.push({ pathname: '/invoice/create', params: { prefilled: JSON.stringify(lineItems) } });
    } catch { Alert.alert('Error', 'Failed to convert time entries'); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Unbilled Time</Text>
        <Text style={styles.summaryValue}>${totalBillable.toFixed(2)}</Text>
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/time/create')}>
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addText}>Log Time Entry</Text>
      </TouchableOpacity>

      {selected.size > 0 && (
        <TouchableOpacity style={styles.billBtn} onPress={billSelected}>
          <Ionicons name="document-text" size={20} color="#fff" />
          <Text style={styles.addText}>Bill {selected.size} entries to Invoice</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg }}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.card, selected.has(item.id) && styles.cardSelected]} onPress={() => !item.invoiced && toggleSelect(item.id)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.desc}>{item.description}</Text>
                <Text style={styles.meta}>{item.client?.name || 'No client'} • {item.hours}h @ ${item.rate}/hr</Text>
                <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
              </View>
              <View>
                <Text style={styles.amount}>${(item.hours * item.rate).toFixed(2)}</Text>
                {item.invoiced && <Text style={styles.invoiced}>Invoiced</Text>}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  summary: { backgroundColor: colors.accent, padding: spacing.lg, alignItems: 'center' },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  summaryValue: { color: '#fff', fontSize: 36, fontWeight: '800' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary, margin: spacing.lg, padding: spacing.md, borderRadius: radius.md },
  addText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  billBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.accent, marginHorizontal: spacing.lg, marginBottom: spacing.sm, padding: spacing.md, borderRadius: radius.md },
  card: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm },
  cardSelected: { borderWidth: 2, borderColor: colors.primary },
  desc: { fontSize: 15, fontWeight: '600', color: colors.text },
  meta: { fontSize: 13, color: colors.textSecondary },
  date: { fontSize: 12, color: colors.textMuted },
  amount: { fontSize: 18, fontWeight: '800', color: colors.text, textAlign: 'right' },
  invoiced: { fontSize: 11, color: colors.accent, fontWeight: '700', textAlign: 'right' },
});
