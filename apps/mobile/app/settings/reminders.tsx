import { View, Text, StyleSheet, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from '@/contexts/ThemeContext';
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
      Alert.alert('Saved', 'Reminder and late fee settings updated');
    } catch {
      Alert.alert('Error', 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll edges={[]}>
      <View style={{ padding: spacing.lg }}>
        <Card style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>Payment Reminders</Text>
            <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>Auto-remind clients before and after due date</Text>
          </View>
          <Switch value={enableReminders} onValueChange={setEnableReminders} trackColor={{ true: colors.primary }} />
        </Card>

        <FormField label="Days before due date" value={reminderBefore} onChangeText={setReminderBefore} keyboardType="number-pad" />
        <FormField label="Days after overdue to re-remind" value={reminderAfter} onChangeText={setReminderAfter} keyboardType="number-pad" />

        <Card style={[styles.toggleRow, { marginTop: spacing.md }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>Automated Late Fees</Text>
            <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>Apply fee when invoice becomes overdue</Text>
          </View>
          <Switch value={enableLateFees} onValueChange={setEnableLateFees} trackColor={{ true: colors.primary }} />
        </Card>

        <FormField label="Late fee percentage" value={lateFeePercent} onChangeText={setLateFeePercent} keyboardType="decimal-pad" />

        <Button label="Save Settings" onPress={handleSave} loading={loading} fullWidth icon="save-outline" style={{ marginTop: spacing.md }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  toggleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  rowTitle: { fontSize: 16, fontWeight: '700' },
  rowDesc: { fontSize: 13, marginTop: 2, lineHeight: 18 },
});
