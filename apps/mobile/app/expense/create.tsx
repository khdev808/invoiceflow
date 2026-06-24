import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { expensesApi, ocrApi } from '@/lib/api';
import { colors, radius, spacing, expenseCategories } from '@/constants/theme';

export default function CreateExpenseScreen() {
  const { receiptUri } = useLocalSearchParams<{ receiptUri?: string }>();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [vendor, setVendor] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (receiptUri) {
      setScanning(true);
      ocrApi.parseReceipt(receiptUri).then(({ data }) => {
        setDescription(data.description);
        setAmount(String(data.amount));
        setVendor(data.vendor);
        setCategory(data.category);
      }).catch(() => {}).finally(() => setScanning(false));
    }
  }, [receiptUri]);

  const handleSave = async () => {
    if (!description || !amount) { Alert.alert('Error', 'Description and amount required'); return; }
    setLoading(true);
    try {
      await expensesApi.create({
        description,
        amount: parseFloat(amount),
        category,
        vendor: vendor || undefined,
        receiptUrl: receiptUri,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {receiptUri && <Image source={{ uri: receiptUri }} style={styles.receipt} />}
      {scanning && <Text style={styles.scanning}>Scanning receipt with OCR...</Text>}

      <Text style={styles.label}>Description</Text>
      <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="What was this expense for?" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>Amount</Text>
      <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>Vendor</Text>
      <TextInput style={styles.input} value={vendor} onChangeText={setVendor} placeholder="Store or vendor name" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
        {expenseCategories.map((c) => (
          <TouchableOpacity key={c} style={[styles.categoryChip, category === c && styles.categoryActive]} onPress={() => setCategory(c)}>
            <Text style={[styles.categoryText, category === c && styles.categoryTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Expense</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  receipt: { width: '100%', height: 200, borderRadius: radius.md, marginBottom: spacing.md },
  scanning: { color: colors.primary, fontWeight: '600', marginBottom: spacing.md, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, fontSize: 16, color: colors.text, borderWidth: 1, borderColor: colors.border },
  categoryList: { marginVertical: spacing.sm },
  categoryChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
  categoryActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  categoryTextActive: { color: '#fff' },
  button: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.xxl },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
