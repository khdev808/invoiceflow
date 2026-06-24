import { View, Text, StyleSheet, Switch, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { colors, radius, spacing } from '@/constants/theme';

export default function RemindersSettingsScreen() {
  const { user, loadUser } = useAuthStore();
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
        reminderDaysBefore: parseInt(reminderBefore),
        reminderDaysAfter: parseInt(reminderAfter),
        lateFeePercent: parseFloat(lateFeePercent),
      });
      await loadUser();
      Alert.alert('Saved', 'Reminder and late fee settings updated');
    } catch { Alert.alert('Error', 'Failed to save'); }
    finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}><Text style={styles.rowTitle}>Payment Reminders</Text><Text style={styles.rowDesc}>Auto-remind clients before and after due date</Text></View>
        <Switch value={enableReminders} onValueChange={setEnableReminders} trackColor={{ true: colors.primary }} />
      </View>
      <Text style={styles.label}>Days before due date</Text>
      <TextInput style={styles.input} value={reminderBefore} onChangeText={setReminderBefore} keyboardType="number-pad" />
      <Text style={styles.label}>Days after overdue to re-remind</Text>
      <TextInput style={styles.input} value={reminderAfter} onChangeText={setReminderAfter} keyboardType="number-pad" />

      <View style={[styles.row, { marginTop: spacing.lg }]}>
        <View style={{ flex: 1 }}><Text style={styles.rowTitle}>Automated Late Fees</Text><Text style={styles.rowDesc}>Apply fee when invoice becomes overdue</Text></View>
        <Switch value={enableLateFees} onValueChange={setEnableLateFees} trackColor={{ true: colors.primary }} />
      </View>
      <Text style={styles.label}>Late fee percentage</Text>
      <TextInput style={styles.input} value={lateFeePercent} onChangeText={setLateFeePercent} keyboardType="decimal-pad" />

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Settings</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md },
  rowTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  rowDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  input: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, fontSize: 16, color: colors.text, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  button: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.xxl },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
