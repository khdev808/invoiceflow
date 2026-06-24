import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { mileageApi } from '@/lib/api';
import { colors, radius, spacing } from '@/constants/theme';

export default function CreateMileageScreen() {
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
    } catch { Alert.alert('Error', 'Failed to log mileage'); }
    finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Trip Description</Text>
      <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Client site visit - Dallas" placeholderTextColor={colors.textMuted} />
      <Text style={styles.label}>Miles</Text>
      <TextInput style={styles.input} value={miles} onChangeText={setMiles} keyboardType="decimal-pad" placeholder="42.5" placeholderTextColor={colors.textMuted} />
      <Text style={styles.label}>Rate per Mile ($)</Text>
      <TextInput style={styles.input} value={rate} onChangeText={setRate} keyboardType="decimal-pad" placeholderTextColor={colors.textMuted} />
      {miles && <Text style={styles.preview}>Deduction: ${(parseFloat(miles) * parseFloat(rate)).toFixed(2)}</Text>}
      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log Mileage</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, fontSize: 16, color: colors.text, borderWidth: 1, borderColor: colors.border },
  preview: { fontSize: 20, fontWeight: '800', color: '#7C3AED', textAlign: 'center', marginTop: spacing.lg },
  button: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
