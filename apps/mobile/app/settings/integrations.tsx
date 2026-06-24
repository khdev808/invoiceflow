import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Stack } from 'expo-router';
import { integrationsApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/hooks/useI18n';
import { radius, spacing } from '@/constants/theme';

export default function IntegrationsScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [url, setUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!url.startsWith('http')) {
      Alert.alert('Invalid URL', 'Webhook URL must start with http:// or https://');
      return;
    }
    setSaving(true);
    try {
      await integrationsApi.setWebhook(url);
      Alert.alert('Saved', 'Webhook URL updated. Events: invoice.sent, payment.received');
    } catch {
      Alert.alert('Error', 'Failed to save webhook');
    } finally {
      setSaving(false);
    }
  };

  const styles = makeStyles(colors);

  return (
    <>
      <Stack.Screen options={{ title: t('integrations') }} />
      <View style={styles.container}>
        <Text style={styles.help}>
          Receive POST requests when invoices are sent or payments received. Useful for Zapier, Make, or custom backends.
        </Text>
        <Text style={styles.label}>{t('webhookUrl')}</Text>
        <TextInput
          style={styles.input}
          placeholder="https://hooks.example.com/invoiceflow"
          placeholderTextColor={colors.textMuted}
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          keyboardType="url"
        />
        <TouchableOpacity style={styles.btn} onPress={save} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{t('save')}</Text>}
        </TouchableOpacity>
      </View>
    </>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
    help: { color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 22 },
    label: { fontWeight: '700', color: colors.textMuted, marginBottom: spacing.sm },
    input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, color: colors.text },
    btn: { marginTop: spacing.lg, backgroundColor: colors.primary, padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: '700' },
  });
}
