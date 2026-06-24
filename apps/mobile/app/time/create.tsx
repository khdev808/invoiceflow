import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { timeApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/format';
import { spacing } from '@/constants/theme';
import { Alert } from 'react-native';

export default function CreateTimeScreen() {
  const { colors } = useTheme();
  const currency = useUserCurrency();
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('');
  const [rate, setRate] = useState('75');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!description || !hours) { Alert.alert('Error', 'Description and hours required'); return; }
    setLoading(true);
    try {
      await timeApi.create({ description, hours: parseFloat(hours), rate: parseFloat(rate) });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to log time');
    } finally {
      setLoading(false);
    }
  };

  const total = hours && rate ? parseFloat(hours) * parseFloat(rate) : 0;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ padding: spacing.lg }}>
        <FormField label="Description" value={description} onChangeText={setDescription} placeholder="What did you work on?" />
        <FormField label="Hours" value={hours} onChangeText={setHours} keyboardType="decimal-pad" placeholder="2.5" />
        <FormField label="Hourly Rate" value={rate} onChangeText={setRate} keyboardType="decimal-pad" placeholder="75" />
        {total > 0 && (
          <View style={styles.preview}>
            <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Total</Text>
            <Text style={[styles.previewValue, { color: colors.accent }]}>{formatCurrency(total, currency)}</Text>
          </View>
        )}
        <Button label="Log Time" onPress={handleSave} loading={loading} fullWidth icon="timer-outline" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  preview: { alignItems: 'center', padding: spacing.lg },
  previewLabel: { fontSize: 14 },
  previewValue: { fontSize: 32, fontWeight: '800', marginTop: 4 },
});
