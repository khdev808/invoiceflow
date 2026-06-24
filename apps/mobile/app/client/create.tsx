import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { clientsApi } from '@/lib/api';
import { colors, radius, spacing } from '@/constants/theme';

export default function CreateClientScreen() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', address: '', city: '', state: '', zip: '' });
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm({ ...form, [field]: value });

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('Error', 'Name is required'); return; }
    setLoading(true);
    try {
      await clientsApi.create(form);
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {[
        { key: 'name', label: 'Name *', placeholder: 'John Smith' },
        { key: 'company', label: 'Company', placeholder: 'Smith Corp' },
        { key: 'email', label: 'Email', placeholder: 'john@company.com', keyboard: 'email-address' },
        { key: 'phone', label: 'Phone', placeholder: '+1 (555) 123-4567', keyboard: 'phone-pad' },
        { key: 'address', label: 'Address', placeholder: '123 Main St' },
        { key: 'city', label: 'City', placeholder: 'Austin' },
        { key: 'state', label: 'State', placeholder: 'TX' },
        { key: 'zip', label: 'ZIP', placeholder: '78701' },
      ].map((field) => (
        <View key={field.key}>
          <Text style={styles.label}>{field.label}</Text>
          <TextInput
            style={styles.input}
            value={(form as any)[field.key]}
            onChangeText={(v) => update(field.key, v)}
            placeholder={field.placeholder}
            placeholderTextColor={colors.textMuted}
            keyboardType={field.keyboard as any}
            autoCapitalize={field.key === 'email' ? 'none' : 'words'}
          />
        </View>
      ))}

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Client</Text>}
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
