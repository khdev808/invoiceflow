import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { planApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/hooks/useI18n';
import { radius, spacing } from '@/constants/theme';

export default function PlanScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    planApi.usage().then(({ data }) => setUsage(data)).finally(() => setLoading(false));
  }, []);

  const styles = makeStyles(colors);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />;

  const pct = usage ? Math.min(100, Math.round((usage.used / usage.limit) * 100)) : 0;

  return (
    <>
      <Stack.Screen options={{ title: t('plan') }} />
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.planName}>{usage?.plan || 'FREE'}</Text>
          <Text style={styles.label}>Invoices this month</Text>
          <Text style={styles.count}>{usage?.used ?? 0} / {usage?.limit ?? 25}</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: pct >= 90 ? colors.danger : colors.primary }]} />
          </View>
          {usage?.remaining === 0 && (
            <Text style={styles.warning}>Monthly limit reached. Upgrade to create more invoices.</Text>
          )}
        </View>
      </View>
    </>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
    card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
    planName: { fontSize: 14, fontWeight: '700', color: colors.primary, textTransform: 'uppercase' },
    label: { marginTop: spacing.md, color: colors.textSecondary },
    count: { fontSize: 32, fontWeight: '800', color: colors.text, marginVertical: spacing.sm },
    barBg: { height: 8, backgroundColor: colors.surfaceAlt, borderRadius: radius.full, overflow: 'hidden' },
    barFill: { height: 8, borderRadius: radius.full },
    warning: { marginTop: spacing.md, color: colors.danger, fontWeight: '600' },
  });
}
