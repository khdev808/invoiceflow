import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { productsApi } from '@/lib/api';
import { colors, radius, spacing } from '@/constants/theme';

export default function CreateProductScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [taxRate, setTaxRate] = useState('0');
  const [sku, setSku] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !unitPrice) { Alert.alert('Error', 'Name and price required'); return; }
    setLoading(true);
    try {
      await productsApi.create({ name, description, unitPrice: parseFloat(unitPrice), taxRate: parseFloat(taxRate), sku: sku || undefined });
      router.back();
    } catch { Alert.alert('Error', 'Failed to save product'); }
    finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      {[
        { label: 'Name *', value: name, set: setName, placeholder: 'Consulting Hour' },
        { label: 'Description', value: description, set: setDescription, placeholder: 'Optional details' },
        { label: 'Unit Price *', value: unitPrice, set: setUnitPrice, placeholder: '75.00', keyboard: 'decimal-pad' },
        { label: 'Tax Rate %', value: taxRate, set: setTaxRate, placeholder: '8.25', keyboard: 'decimal-pad' },
        { label: 'SKU', value: sku, set: setSku, placeholder: 'SVC-001' },
      ].map((f) => (
        <View key={f.label}>
          <Text style={styles.label}>{f.label}</Text>
          <TextInput style={styles.input} value={f.value} onChangeText={f.set} placeholder={f.placeholder} keyboardType={f.keyboard as any} placeholderTextColor={colors.textMuted} />
        </View>
      ))}
      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Product</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, fontSize: 16, color: colors.text, borderWidth: 1, borderColor: colors.border },
  button: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
