import { View, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { productsApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { spacing } from '@/constants/theme';
import { Alert } from 'react-native';

export default function CreateProductScreen() {
  const { colors } = useTheme();
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
    } catch {
      Alert.alert('Error', 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ padding: spacing.lg }}>
        <FormField label="Name *" value={name} onChangeText={setName} placeholder="Consulting Hour" />
        <FormField label="Description" value={description} onChangeText={setDescription} placeholder="Optional details" />
        <FormField label="Unit Price *" value={unitPrice} onChangeText={setUnitPrice} keyboardType="decimal-pad" placeholder="75.00" />
        <FormField label="Tax Rate %" value={taxRate} onChangeText={setTaxRate} keyboardType="decimal-pad" placeholder="8.25" />
        <FormField label="SKU" value={sku} onChangeText={setSku} placeholder="SVC-001" />
        <Button label="Save Product" onPress={handleSave} loading={loading} fullWidth icon="pricetag-outline" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
