import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { clientsApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { spacing } from '@/constants/theme';
import { hapticSuccess } from '@/lib/haptics';

export default function CreateClientScreen() {
  const { colors } = useTheme();
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', address: '', city: '', state: '', zip: '' });
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm({ ...form, [field]: value });

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('Error', 'Name is required'); return; }
    setLoading(true);
    try {
      await clientsApi.create(form);
      hapticSuccess();
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Name *', placeholder: 'John Smith' },
    { key: 'company', label: 'Company', placeholder: 'Smith Corp' },
    { key: 'email', label: 'Email', placeholder: 'john@company.com', keyboard: 'email-address' as const },
    { key: 'phone', label: 'Phone', placeholder: '+1 (555) 123-4567', keyboard: 'phone-pad' as const },
    { key: 'address', label: 'Address', placeholder: '123 Main St' },
    { key: 'city', label: 'City', placeholder: 'Austin' },
    { key: 'state', label: 'State', placeholder: 'TX' },
    { key: 'zip', label: 'ZIP', placeholder: '78701' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">
      <View style={{ padding: spacing.lg }}>
        {fields.map((field) => (
          <FormField
            key={field.key}
            label={field.label}
            value={(form as any)[field.key]}
            onChangeText={(v) => update(field.key, v)}
            placeholder={field.placeholder}
            keyboardType={field.keyboard}
            autoCapitalize={field.key === 'email' ? 'none' : 'words'}
          />
        ))}
        <Button label="Save Client" onPress={handleSave} loading={loading} fullWidth icon="person-add-outline" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
