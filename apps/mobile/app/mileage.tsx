import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { mileageApi } from '@/lib/api';
import { colors, radius, spacing, shadows } from '@/constants/theme';

export default function MileageScreen() {
  const [entries, setEntries] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [listRes, sumRes] = await Promise.all([mileageApi.list(), mileageApi.summary()]);
      setEntries(listRes.data);
      setSummary(sumRes.data);
    } catch { setEntries([]); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Mileage Deduction (IRS ${summary?.totalMiles ? (summary.totalDeduction / summary.totalMiles).toFixed(2) : '0.67'}/mi)</Text>
        <Text style={styles.summaryValue}>${(summary?.totalDeduction || 0).toFixed(2)}</Text>
        <Text style={styles.summarySub}>{(summary?.totalMiles || 0).toFixed(1)} miles logged</Text>
      </View>
      <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/mileage/create')}>
        <Ionicons name="car" size={20} color="#fff" />
        <Text style={styles.addText}>Log Mileage</Text>
      </TouchableOpacity>
      {loading ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} /> : (
        <FlatList data={entries} keyExtractor={(i) => i.id} contentContainerStyle={{ padding: spacing.lg }}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.desc}>{item.description}</Text>
                <Text style={styles.meta}>{item.miles} mi × ${item.rate}/mi • {new Date(item.date).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.amount}>${(item.miles * item.rate).toFixed(2)}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  summary: { backgroundColor: '#7C3AED', padding: spacing.lg, alignItems: 'center' },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  summaryValue: { color: '#fff', fontSize: 36, fontWeight: '800' },
  summarySub: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary, margin: spacing.lg, padding: spacing.md, borderRadius: radius.md },
  addText: { color: '#fff', fontWeight: '700' },
  card: { flexDirection: 'row', backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm, ...shadows.sm },
  desc: { fontSize: 15, fontWeight: '600', color: colors.text },
  meta: { fontSize: 13, color: colors.textSecondary },
  amount: { fontSize: 16, fontWeight: '800', color: colors.text },
});
