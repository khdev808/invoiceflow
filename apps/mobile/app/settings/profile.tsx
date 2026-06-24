import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { usersApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { Screen } from '@/components/ui/Screen';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { currencies } from '@/constants/theme';
import { radius, spacing } from '@/constants/theme';
import { hapticSuccess } from '@/lib/haptics';

export default function ProfileSettingsScreen() {
  const { user, setUser } = useAuthStore();
  const { colors } = useTheme();
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
      hapticSuccess();
      Alert.alert('Saved', 'Business profile updated');
    } catch {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll edges={[]}>
      <View style={{ padding: spacing.lg }}>
        <Text style={[styles.intro, { color: colors.textSecondary }]}>This info appears on invoices, estimates, and your client portal.</Text>

        <FormField label="Your Name" value={form.name} onChangeText={(v) => update('name', v)} />
        <FormField label="Business Name" value={form.businessName} onChangeText={(v) => update('businessName', v)} />
        <FormField label="Phone" value={form.businessPhone} onChangeText={(v) => update('businessPhone', v)} keyboardType="phone-pad" />
        <FormField label="Email" value={form.businessEmail} onChangeText={(v) => update('businessEmail', v)} keyboardType="email-address" autoCapitalize="none" />
        <FormField label="Address" value={form.businessAddress} onChangeText={(v) => update('businessAddress', v)} />
        <FormField label="Tax ID / EIN" value={form.taxId} onChangeText={(v) => update('taxId', v)} />

        <Text style={[styles.label, { color: colors.text }]}>Default Currency</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
          {currencies.map((c) => (
            <TouchableOpacity
              key={c.code}
              style={[styles.currencyChip, { borderColor: colors.border, backgroundColor: colors.surface }, form.currency === c.code && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => update('currency', c.code)}
            >
              <Text style={[styles.currencyText, { color: colors.textSecondary }, form.currency === c.code && styles.currencyTextActive]}>{c.symbol} {c.code}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Button label="Save Profile" onPress={handleSave} loading={loading} fullWidth icon="save-outline" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 15, lineHeight: 22, marginBottom: spacing.lg },
  label: { fontSize: 14, fontWeight: '600', marginBottom: spacing.sm },
  currencyChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1, marginRight: spacing.sm },
  currencyText: { fontSize: 14, fontWeight: '600' },
  currencyTextActive: { color: '#fff' },
});
