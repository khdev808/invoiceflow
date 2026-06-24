import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native';
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
    const name = supportedLanguages.find((l) => l.code === code)?.nativeName || code;
    Alert.alert(t('languageUpdated'), `${t('appLanguageSetTo')} ${name}`);
  };

  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>{t('languagesSupported', { count: supportedLanguages.length })}</Text>
      <FlatList
        data={supportedLanguages}
        keyExtractor={(l) => l.code}
        renderItem={({ item: l }) => (
          <TouchableOpacity
            key={l.code}
            style={[styles.card, lang === l.code && styles.cardActive]}
            onPress={() => handleSelect(l.code)}
          >
            <View>
              <Text style={styles.name}>{l.nativeName}</Text>
              <Text style={styles.englishName}>{l.name}</Text>
            </View>
            {lang === l.code && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
          </TouchableOpacity>
        )}
      />
      <Text style={styles.preview}>
        {t('createInvoice')} • {t('revenue')} • {t('clients')}
      </Text>
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
    subtitle: { fontSize: 15, color: colors.textSecondary, marginBottom: spacing.lg },
    card: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: radius.md,
      marginBottom: spacing.sm,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    cardActive: { borderColor: colors.primary },
    name: { fontSize: 17, fontWeight: '600', color: colors.text },
    englishName: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    preview: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
  });
}
