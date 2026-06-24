import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { templates, FREE_TEMPLATE_IDS } from '@/constants/theme';
import { usersApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/hooks/useI18n';
import { useAuthStore } from '@/stores/auth';
import { Screen } from '@/components/ui/Screen';
import { PaywallModal } from '@/components/PaywallModal';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing } from '@/constants/theme';
import { hapticLight, hapticSuccess } from '@/lib/haptics';

export default function TemplatesScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const isPro = user?.plan === 'pro' || user?.plan === 'business';
  const [selected, setSelected] = useState(user?.settings?.templateId || 'modern');
  const [paywall, setPaywall] = useState(false);

  useEffect(() => {
    if (user?.settings?.templateId) {
      setSelected(user.settings.templateId);
    }
  }, [user?.settings?.templateId]);

  const handleSelect = async (id: string, premium: boolean) => {
    if (premium && !isPro && !FREE_TEMPLATE_IDS.has(id)) {
      setPaywall(true);
      return;
    }
    hapticLight(`template:select:${id}`);
    setSelected(id);
    try {
      const tpl = templates.find((x) => x.id === id);
      await usersApi.updateSettings({ templateId: id, primaryColor: tpl?.color });
      if (user) {
        setUser({
          ...user,
          settings: { ...user.settings, templateId: id, primaryColor: tpl?.color },
        });
      }
      hapticSuccess();
      Alert.alert(t('saved'), t('templateSavedMsg'));
    } catch {
      Alert.alert(t('error'), t('failed'));
    }
  };

  return (
    <Screen scroll edges={[]}>
      <PaywallModal visible={paywall} onClose={() => setPaywall(false)} reason="general" />
      <View style={{ padding: spacing.lg }}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('templateSettingsDesc')}</Text>
        {templates.map((tpl) => {
          const locked = tpl.premium && !isPro;
          return (
            <TouchableOpacity
              key={tpl.id}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: selected === tpl.id ? tpl.color : colors.border }]}
              onPress={() => handleSelect(tpl.id, tpl.premium)}
              activeOpacity={0.85}
            >
              <View style={[styles.preview, { backgroundColor: tpl.color }]}>
                {tpl.layout === 'professional' && <View style={[styles.stripe, { backgroundColor: tpl.accentColor }]} />}
                {tpl.layout === 'creative' && <View style={[styles.gradientOverlay, { backgroundColor: tpl.accentColor + '55' }]} />}
                <Text style={styles.previewText}>INVOICE</Text>
                <View style={styles.previewLine} />
                <View style={[styles.previewLine, { width: '60%' }]} />
              </View>
              <View style={styles.cardInfo}>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.cardName, { color: colors.text }]}>{tpl.name}</Text>
                    {tpl.premium && (
                      <View style={[styles.badge, { backgroundColor: locked ? colors.textMuted + '22' : colors.primary + '18' }]}>
                        {locked ? <Ionicons name="lock-closed" size={12} color={colors.textMuted} /> : <Text style={[styles.badgeText, { color: colors.primary }]}>PRO</Text>}
                      </View>
                    )}
                  </View>
                  <Text style={[styles.desc, { color: colors.textMuted }]}>{tpl.description}</Text>
                </View>
                {selected === tpl.id && <Ionicons name="checkmark-circle" size={28} color={tpl.color} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: spacing.lg },
  card: { borderRadius: radius.lg, marginBottom: spacing.md, overflow: 'hidden', borderWidth: 2 },
  preview: { height: 100, padding: spacing.md, justifyContent: 'flex-end', overflow: 'hidden' },
  stripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 6 },
  gradientOverlay: { position: 'absolute', right: 0, top: 0, width: '45%', height: '100%' },
  previewText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  previewLine: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, marginTop: 4, width: '80%' },
  cardInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, gap: spacing.sm },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardName: { fontSize: 16, fontWeight: '700' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full },
  badgeText: { fontSize: 10, fontWeight: '800' },
  desc: { fontSize: 13, marginTop: 4, lineHeight: 18 },
});
