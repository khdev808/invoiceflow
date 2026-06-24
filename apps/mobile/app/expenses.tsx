import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { expensesApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { Screen } from '@/components/ui/Screen';
import { IconButton } from '@/components/ui/IconButton';
import { formatCurrency } from '@/lib/format';
import { hapticLight } from '@/lib/haptics';
import { devLogAction } from '@/lib/devLog';
import { radius, spacing } from '@/constants/theme';

export default function ExpensesScreen() {
  const { colors } = useTheme();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [listRes, summaryRes] = await Promise.all([expensesApi.list(), expensesApi.summary()]);
      setExpenses(listRes.data);
      setSummary(summaryRes.data);
    } catch {
      setExpenses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const scanReceipt = async () => {
    devLogAction('expenses:scan-receipt');
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access required for receipt scanning');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      hapticLight('expenses:scan-complete');
      router.push({ pathname: '/expense/create', params: { receiptUri: result.assets[0].uri } });
    }
  };

  const styles = makeStyles(colors);

  return (
    <Screen edges={[]}>
      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.summary}>
        <Text style={styles.summaryLabel}>Total Expenses</Text>
        <Text style={styles.summaryValue}>{formatCurrency(summary?.total || 0)}</Text>
        <Text style={styles.summaryCount}>{summary?.count || 0} expenses tracked</Text>
      </LinearGradient>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.scanBtn, { backgroundColor: colors.warning }]} onPress={scanReceipt}>
          <Ionicons name="camera" size={20} color="#fff" />
          <Text style={styles.scanText}>Scan Receipt</Text>
        </TouchableOpacity>
        <IconButton action="expense:create" icon="add" onPress={() => router.push('/expense/create')} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg }}
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(); }}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: colors.textMuted }]}>No expenses yet. Scan a receipt to get started.</Text>
          }
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.cardIcon, { backgroundColor: colors.warning + '15' }]}>
                <Ionicons name="receipt" size={20} color={colors.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.desc, { color: colors.text }]}>{item.description}</Text>
                <Text style={[styles.meta, { color: colors.textMuted }]}>{item.category} · {item.vendor || 'No vendor'}</Text>
              </View>
              <Text style={[styles.amount, { color: colors.text }]}>{formatCurrency(item.amount)}</Text>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    summary: { padding: spacing.xl, alignItems: 'center' },
    summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' },
    summaryValue: { color: '#fff', fontSize: 36, fontWeight: '800', marginTop: 4 },
    summaryCount: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
    actions: { flexDirection: 'row', padding: spacing.lg, gap: spacing.sm, alignItems: 'center' },
    scanBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.lg },
    scanText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    card: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.md, borderWidth: 1 },
    cardIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    desc: { fontSize: 15, fontWeight: '600' },
    meta: { fontSize: 12, marginTop: 2 },
    amount: { fontSize: 16, fontWeight: '800' },
    empty: { textAlign: 'center', marginTop: 40, fontSize: 15, lineHeight: 22 },
  });
}
