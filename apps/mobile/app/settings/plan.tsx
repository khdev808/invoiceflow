import { View, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { planApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/hooks/useI18n';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { PaywallModal } from '@/components/PaywallModal';
import { radius, spacing } from '@/constants/theme';

export default function PlanScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paywall, setPaywall] = useState(false);

  const load = () => {
    planApi.usage().then(({ data }) => setUsage(data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const styles = makeStyles(colors);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />;

  const pct = usage ? Math.min(100, Math.round((usage.used / usage.limit) * 100)) : 0;
  const isFree = usage?.plan === 'free';

  return (
    <>
      <Stack.Screen options={{ title: t('plan') }} />
      <PaywallModal visible={paywall} onClose={() => setPaywall(false)} reason="general" onUpgraded={load} />
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.planName}>{String(usage?.plan || 'free').toUpperCase()}</Text>
          <Text style={styles.label}>{t('invoicesThisMonth')}</Text>
          <Text style={styles.count}>{usage?.used ?? 0} / {usage?.limit ?? 25}</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: pct >= 90 ? colors.danger : colors.primary }]} />
          </View>
          {usage?.remaining === 0 && (
            <Text style={styles.warning}>{t('monthlyLimitReached')}</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>{t('choosePlan')}</Text>

        <View style={[styles.tierCard, isFree && styles.tierActive]}>
          <Text style={styles.tierName}>{t('freePlan')}</Text>
          <Text style={styles.tierPrice}>$0</Text>
          <Text style={styles.tierDesc}>{t('freeTierDesc')}</Text>
          {isFree && <Text style={styles.currentBadge}>{t('currentPlan')}</Text>}
        </View>

        <View style={[styles.tierCard, usage?.plan === 'pro' && styles.tierActive]}>
          <Text style={styles.tierName}>{t('proPlan')}</Text>
          <Text style={styles.tierPrice}>$9.99{t('perMonth')}</Text>
          <Text style={styles.tierDesc}>{t('proTierDesc')}</Text>
          {usage?.plan === 'pro' ? (
            <Text style={styles.currentBadge}>{t('currentPlan')}</Text>
          ) : (
            <Button label={t('upgradeNow')} onPress={() => setPaywall(true)} fullWidth />
          )}
        </View>

        <View style={[styles.tierCard, usage?.plan === 'business' && styles.tierActive]}>
          <Text style={styles.tierName}>{t('businessPlan')}</Text>
          <Text style={styles.tierPrice}>$19.99{t('perMonth')}</Text>
          <Text style={styles.tierDesc}>{t('businessTierDesc')}</Text>
          {usage?.plan === 'business' ? (
            <Text style={styles.currentBadge}>{t('currentPlan')}</Text>
          ) : (
            <Button label={t('upgradeNow')} onPress={() => setPaywall(true)} variant="secondary" fullWidth />
          )}
        </View>
      </ScrollView>
    </>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
    card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
    planName: { fontSize: 14, fontWeight: '700', color: colors.primary, textTransform: 'uppercase' },
    label: { marginTop: spacing.md, color: colors.textSecondary },
    count: { fontSize: 32, fontWeight: '800', color: colors.text, marginVertical: spacing.sm },
    barBg: { height: 8, backgroundColor: colors.surfaceAlt, borderRadius: radius.full, overflow: 'hidden' },
    barFill: { height: 8, borderRadius: radius.full },
    warning: { marginTop: spacing.md, color: colors.danger, fontWeight: '600' },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
    tierCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 2, borderColor: colors.border },
    tierActive: { borderColor: colors.primary },
    tierName: { fontSize: 16, fontWeight: '800', color: colors.text },
    tierPrice: { fontSize: 28, fontWeight: '800', color: colors.primary, marginVertical: spacing.sm },
    tierDesc: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.md },
    currentBadge: { color: colors.accent, fontWeight: '700', textAlign: 'center' },
  });
}
