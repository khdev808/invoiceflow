import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { expensesApi, ocrApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { expenseCategories, radius, spacing } from '@/constants/theme';
import { TouchableOpacity, Alert } from 'react-native';

export default function CreateExpenseScreen() {
  const { receiptUri } = useLocalSearchParams<{ receiptUri?: string }>();
  const { colors } = useTheme();
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
      await expensesApi.create({ description, amount: parseFloat(amount), category, vendor: vendor || undefined, receiptUrl: receiptUri });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">
      <View style={{ padding: spacing.lg }}>
        {receiptUri ? <Image source={{ uri: receiptUri }} style={styles.receipt} /> : null}
        {scanning ? <Text style={[styles.scanning, { color: colors.primary }]}>Scanning receipt with OCR...</Text> : null}

        <FormField label="Description" value={description} onChangeText={setDescription} placeholder="What was this expense for?" />
        <FormField label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" />
        <FormField label="Vendor" value={vendor} onChangeText={setVendor} placeholder="Store or vendor name" />

        <Text style={[styles.label, { color: colors.text }]}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
          {expenseCategories.map((c) => (
            <TouchableOpacity key={c} style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.surface }, category === c && { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={() => setCategory(c)}>
              <Text style={[styles.chipText, { color: colors.textSecondary }, category === c && { color: '#fff' }]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Button label="Save Expense" onPress={handleSave} loading={loading} fullWidth icon="receipt-outline" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  receipt: { width: '100%', height: 160, borderRadius: radius.lg, marginBottom: spacing.md },
  scanning: { textAlign: 'center', marginBottom: spacing.md, fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1, marginRight: spacing.sm },
  chipText: { fontSize: 13, fontWeight: '600' },
});
