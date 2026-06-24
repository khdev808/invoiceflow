import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { supportedLanguages } from '@/lib/i18n';
import { usersApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/hooks/useI18n';
import { radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { devLogAction } from '@/lib/devLog';

export default function LanguageSettingsScreen() {
  const { colors } = useTheme();
  const { t, lang, changeLanguage } = useI18n();

  const handleSelect = async (code: string) => {
    devLogAction('settings:language', { code });
    await changeLanguage(code);
    try {
      await usersApi.updateProfile({ language: code });
    } catch { /* local only */ }
    Alert.alert('Language Updated', `App language set to ${supportedLanguages.find((l) => l.code === code)?.name}`);
  };

  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>InvoiceFlow supports 5 languages</Text>
      {supportedLanguages.map((l) => (
        <TouchableOpacity key={l.code} style={[styles.card, lang === l.code && styles.cardActive]} onPress={() => handleSelect(l.code)}>
          <Text style={styles.name}>{l.name}</Text>
          {lang === l.code && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
        </TouchableOpacity>
      ))}
      <Text style={styles.preview}>Preview: {t('createInvoice')} • {t('revenue')} • {t('clients')}</Text>
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
    subtitle: { fontSize: 15, color: colors.textSecondary, marginBottom: spacing.lg },
    card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm, borderWidth: 2, borderColor: 'transparent' },
    cardActive: { borderColor: colors.primary },
    name: { fontSize: 17, fontWeight: '600', color: colors.text },
    preview: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
  });
}
