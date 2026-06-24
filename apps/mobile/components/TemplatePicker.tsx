import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { templates, FREE_TEMPLATE_IDS } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/hooks/useI18n';
import { radius, spacing } from '@/constants/theme';

interface TemplatePickerProps {
  selected: string;
  onSelect: (id: string) => void;
  onPremiumRequired?: () => void;
  isPro?: boolean;
  compact?: boolean;
}

export function TemplatePicker({ selected, onSelect, onPremiumRequired, isPro = false, compact }: TemplatePickerProps) {
  const { colors } = useTheme();
  const { t } = useI18n();

  const handlePress = (id: string, premium: boolean) => {
    if (premium && !isPro && !FREE_TEMPLATE_IDS.has(id)) {
      onPremiumRequired?.();
      return;
    }
    onSelect(id);
  };

  return (
    <View>
      {!compact && (
        <Text style={[styles.label, { color: colors.text }]}>{t('invoiceTheme')}</Text>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {templates.map((tpl) => {
          const active = selected === tpl.id;
          const locked = tpl.premium && !isPro;
          return (
            <TouchableOpacity
              key={tpl.id}
              style={[
                styles.card,
                { borderColor: active ? tpl.color : colors.border, backgroundColor: colors.surface },
                active && { borderWidth: 2 },
              ]}
              onPress={() => handlePress(tpl.id, tpl.premium)}
              activeOpacity={0.85}
            >
              <View style={[styles.preview, { backgroundColor: tpl.color }]}>
                {tpl.layout === 'professional' && <View style={[styles.stripe, { backgroundColor: tpl.accentColor }]} />}
                {tpl.layout === 'creative' && <View style={[styles.gradientOverlay, { backgroundColor: tpl.accentColor + '55' }]} />}
                <Text style={styles.previewTitle}>INV</Text>
                <View style={styles.previewLine} />
                <View style={[styles.previewLine, { width: '55%' }]} />
              </View>
              <View style={styles.meta}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{tpl.name}</Text>
                {tpl.premium ? (
                  <View style={[styles.badge, { backgroundColor: locked ? colors.textMuted + '22' : colors.primary + '18' }]}>
                    {locked ? (
                      <Ionicons name="lock-closed" size={10} color={colors.textMuted} />
                    ) : (
                      <Text style={[styles.badgeText, { color: colors.primary }]}>PRO</Text>
                    )}
                  </View>
                ) : null}
              </View>
              {!compact && (
                <Text style={[styles.desc, { color: colors.textMuted }]} numberOfLines={2}>{tpl.description}</Text>
              )}
              {active && (
                <View style={[styles.check, { backgroundColor: tpl.color }]}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '700', marginBottom: spacing.sm },
  scroll: { marginBottom: spacing.md },
  card: {
    width: 132,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginRight: spacing.sm,
    overflow: 'hidden',
    paddingBottom: spacing.sm,
  },
  preview: { height: 72, padding: spacing.sm, justifyContent: 'flex-end', overflow: 'hidden' },
  stripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  gradientOverlay: { position: 'absolute', right: 0, top: 0, width: '50%', height: '100%' },
  previewTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  previewLine: { height: 3, backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 2, marginTop: 4, width: '75%' },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.sm, marginTop: spacing.sm },
  name: { fontSize: 13, fontWeight: '700', flex: 1 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.full },
  badgeText: { fontSize: 9, fontWeight: '800' },
  desc: { fontSize: 10, lineHeight: 14, paddingHorizontal: spacing.sm, marginTop: 4 },
  check: { position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
});
