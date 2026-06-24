import { View, Text, StyleSheet, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/hooks/useI18n';
import { Screen } from '@/components/ui/Screen';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from 'react-native';
import { spacing } from '@/constants/theme';
import { hapticSuccess } from '@/lib/haptics';

export default function RemindersSettingsScreen() {
  const { user, loadUser } = useAuthStore();
  const { colors } = useTheme();
  const { t } = useI18n();
  const s = user?.settings || {};
  const [enableReminders, setEnableReminders] = useState(s.enablePaymentReminders ?? true);
  const [enableLateFees, setEnableLateFees] = useState(s.enableLateFees ?? false);
  const [reminderBefore, setReminderBefore] = useState(String(s.reminderDaysBefore ?? 3));
  const [reminderAfter, setReminderAfter] = useState(String(s.reminderDaysAfter ?? 7));
  const [lateFeePercent, setLateFeePercent] = useState(String(s.lateFeePercent ?? 5));
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadUser(); }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await usersApi.updateSettings({
        enablePaymentReminders: enableReminders,
        enableLateFees,
        reminderDaysBefore: parseInt(reminderBefore, 10),
        reminderDaysAfter: parseInt(reminderAfter, 10),
        lateFeePercent: parseFloat(lateFeePercent),
      });
      await loadUser();
      hapticSuccess();
      Alert.alert(t('success'), t('settingsSaved'));
    } catch {
      Alert.alert(t('error'), t('failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll edges={[]}>
      <View style={{ padding: spacing.lg }}>
        <Card style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>{t('enableReminders')}</Text>
            <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>{t('reminderDaysBefore')}</Text>
          </View>
          <Switch value={enableReminders} onValueChange={setEnableReminders} trackColor={{ true: colors.primary }} />
        </Card>

        <FormField label={t('reminderDaysBefore')} value={reminderBefore} onChangeText={setReminderBefore} keyboardType="number-pad" />
        <FormField label={t('reminderDaysAfter')} value={reminderAfter} onChangeText={setReminderAfter} keyboardType="number-pad" />

        <Card style={{ ...styles.toggleRow, marginTop: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>{t('enableLateFees')}</Text>
            <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>{t('lateFeeAmount')}</Text>
          </View>
          <Switch value={enableLateFees} onValueChange={setEnableLateFees} trackColor={{ true: colors.primary }} />
        </Card>

        <FormField label={t('lateFeePercent')} value={lateFeePercent} onChangeText={setLateFeePercent} keyboardType="decimal-pad" />

        <Button label={t('save')} onPress={handleSave} loading={loading} fullWidth icon="save-outline" style={{ marginTop: spacing.md }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  toggleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  rowTitle: { fontSize: 16, fontWeight: '700' },
  rowDesc: { fontSize: 13, marginTop: 2, lineHeight: 18 },
});
