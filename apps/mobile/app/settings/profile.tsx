import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { usersApi } from '@/lib/api';
import { colors, radius, spacing, currencies } from '@/constants/theme';

export default function ProfileSettingsScreen() {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    businessName: user?.businessName || '',
    businessPhone: (user as any)?.businessPhone || '',
    businessEmail: (user as any)?.businessEmail || '',
    businessAddress: (user as any)?.businessAddress || '',
    taxId: (user as any)?.taxId || '',
    currency: user?.currency || 'USD',
  });
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm({ ...form, [field]: value });

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await usersApi.updateProfile(form);
      setUser(data);
      Alert.alert('Saved', 'Business profile updated');
    } catch {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {[
        { key: 'name', label: 'Your Name' },
        { key: 'businessName', label: 'Business Name' },
        { key: 'businessPhone', label: 'Phone' },
        { key: 'businessEmail', label: 'Email', keyboard: 'email-address' },
        { key: 'businessAddress', label: 'Address' },
        { key: 'taxId', label: 'Tax ID / EIN' },
      ].map((field) => (
        <View key={field.key}>
          <Text style={styles.label}>{field.label}</Text>
          <TextInput style={styles.input} value={(form as any)[field.key]} onChangeText={(v) => update(field.key, v)} keyboardType={field.keyboard as any} />
        </View>
      ))}

      <Text style={styles.label}>Currency</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {currencies.map((c) => (
          <TouchableOpacity key={c.code} style={[styles.currencyChip, form.currency === c.code && styles.currencyActive]} onPress={() => update('currency', c.code)}>
            <Text style={[styles.currencyText, form.currency === c.code && styles.currencyTextActive]}>{c.symbol} {c.code}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Profile</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, fontSize: 16, color: colors.text, borderWidth: 1, borderColor: colors.border },
  currencyChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm, marginVertical: spacing.sm },
  currencyActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  currencyText: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  currencyTextActive: { color: '#fff' },
  button: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.xxl },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
