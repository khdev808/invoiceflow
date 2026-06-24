import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { supportedLanguages, setLanguage, t } from '@/lib/i18n';
import { usersApi } from '@/lib/api';
import { colors, radius, spacing } from '@/constants/theme';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function LanguageSettingsScreen() {
  const [selected, setSelected] = useState('en');

  const handleSelect = async (code: string) => {
    setSelected(code);
    setLanguage(code);
    try {
      await usersApi.updateProfile({ language: code });
      Alert.alert('Language Updated', `App language set to ${supportedLanguages.find((l) => l.code === code)?.name}`);
    } catch { /* local only */ }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>InvoiceFlow supports 5 languages — matching Invoice Fly</Text>
      {supportedLanguages.map((lang) => (
        <TouchableOpacity key={lang.code} style={[styles.card, selected === lang.code && styles.cardActive]} onPress={() => handleSelect(lang.code)}>
          <Text style={styles.name}>{lang.name}</Text>
          {selected === lang.code && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
        </TouchableOpacity>
      ))}
      <Text style={styles.preview}>Preview: {t('createInvoice')} • {t('revenue')} • {t('clients')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  subtitle: { fontSize: 15, color: colors.textSecondary, marginBottom: spacing.lg },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm, borderWidth: 2, borderColor: 'transparent' },
  cardActive: { borderColor: colors.primary },
  name: { fontSize: 17, fontWeight: '600', color: colors.text },
  preview: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
});
