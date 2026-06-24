import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { expensesApi } from '@/lib/api';
import { colors, radius, spacing, shadows } from '@/constants/theme';

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [listRes, summaryRes] = await Promise.all([expensesApi.list(), expensesApi.summary()]);
      setExpenses(listRes.data);
      setSummary(summaryRes.data);
    } catch {
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const scanReceipt = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Camera access required for receipt scanning'); return; }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      router.push({ pathname: '/expense/create', params: { receiptUri: result.assets[0].uri } });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Total Expenses</Text>
        <Text style={styles.summaryValue}>${(summary?.total || 0).toFixed(2)}</Text>
        <Text style={styles.summaryCount}>{summary?.count || 0} expenses tracked</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.scanBtn} onPress={scanReceipt}>
          <Ionicons name="camera" size={20} color="#fff" />
          <Text style={styles.scanText}>Scan Receipt</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/expense/create')}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg }}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardIcon}><Ionicons name="receipt" size={20} color={colors.warning} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.desc}>{item.description}</Text>
                <Text style={styles.meta}>{item.category} • {item.vendor || 'No vendor'} • {new Date(item.date).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  summary: { backgroundColor: colors.primary, padding: spacing.lg, alignItems: 'center' },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  summaryValue: { color: '#fff', fontSize: 36, fontWeight: '800' },
  summaryCount: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  actions: { flexDirection: 'row', padding: spacing.lg, gap: spacing.sm },
  scanBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.warning, padding: spacing.md, borderRadius: radius.md },
  scanText: { color: '#fff', fontWeight: '700' },
  addBtn: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.md, ...shadows.sm },
  cardIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.warning + '15', alignItems: 'center', justifyContent: 'center' },
  desc: { fontSize: 15, fontWeight: '600', color: colors.text },
  meta: { fontSize: 12, color: colors.textMuted },
  amount: { fontSize: 16, fontWeight: '800', color: colors.text },
});
