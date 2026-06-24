import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { mileageApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/format';
import { spacing } from '@/constants/theme';
import { Alert } from 'react-native';

export default function CreateMileageScreen() {
  const { colors } = useTheme();
  const currency = useUserCurrency();
  const [description, setDescription] = useState('');
  const [miles, setMiles] = useState('');
  const [rate, setRate] = useState('0.67');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!description || !miles) { Alert.alert('Error', 'Description and miles required'); return; }
    setLoading(true);
    try {
      await mileageApi.create({ description, miles: parseFloat(miles), rate: parseFloat(rate) });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to log mileage');
    } finally {
      setLoading(false);
    }
  };

  const deduction = miles && rate ? parseFloat(miles) * parseFloat(rate) : 0;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ padding: spacing.lg }}>
        <FormField label="Trip Description" value={description} onChangeText={setDescription} placeholder="Client site visit" />
        <FormField label="Miles" value={miles} onChangeText={setMiles} keyboardType="decimal-pad" placeholder="42.5" />
        <FormField label="Rate per Mile" value={rate} onChangeText={setRate} keyboardType="decimal-pad" />
        {deduction > 0 && (
          <Text style={[styles.preview, { color: '#7C3AED' }]}>Deduction: {formatCurrency(deduction, currency)}</Text>
        )}
        <Button label="Log Mileage" onPress={handleSave} loading={loading} fullWidth icon="car-outline" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  preview: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginVertical: spacing.lg },
});
