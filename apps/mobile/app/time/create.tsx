import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { timeApi } from '@/lib/api';
import { colors, radius, spacing } from '@/constants/theme';

export default function CreateTimeScreen() {
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

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Description</Text>
      <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="What did you work on?" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>Hours</Text>
      <TextInput style={styles.input} value={hours} onChangeText={setHours} keyboardType="decimal-pad" placeholder="2.5" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>Hourly Rate ($)</Text>
      <TextInput style={styles.input} value={rate} onChangeText={setRate} keyboardType="decimal-pad" placeholder="75" placeholderTextColor={colors.textMuted} />

      {hours && rate && (
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>Total</Text>
          <Text style={styles.previewValue}>${(parseFloat(hours) * parseFloat(rate)).toFixed(2)}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log Time</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, fontSize: 16, color: colors.text, borderWidth: 1, borderColor: colors.border },
  preview: { alignItems: 'center', padding: spacing.lg, marginTop: spacing.md },
  previewLabel: { fontSize: 14, color: colors.textSecondary },
  previewValue: { fontSize: 32, fontWeight: '800', color: colors.accent },
  button: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
