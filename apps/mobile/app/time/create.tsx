import { View, StyleSheet, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { timeApi, clientsApi } from '@/lib/api';
import { queueOfflineOp } from '@/lib/offline';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { useI18n } from '@/hooks/useI18n';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { formatCurrency } from '@/lib/format';
import { TouchableOpacity, Alert } from 'react-native';
import { spacing, radius } from '@/constants/theme';

export default function CreateTimeScreen() {
  const { colors } = useTheme();
  const { t, lang } = useI18n();
  const currency = useUserCurrency();
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('');
  const [rate, setRate] = useState('75');
  const [clientId, setClientId] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    clientsApi.list().then(({ data }) => setClients(data)).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!description || !hours) {
      Alert.alert(t('error'), t('descriptionHoursRequired'));
      return;
    }
    setLoading(true);
    const payload = {
      description,
      hours: parseFloat(hours),
      rate: parseFloat(rate),
      clientId: clientId || undefined,
    };
    try {
      await timeApi.create(payload);
      router.back();
    } catch (e: any) {
      if (!e.response) {
        await queueOfflineOp({ method: 'POST', url: '/time-entries', body: payload });
        Alert.alert(t('savedOffline'), t('savedOfflineMsg'));
        router.back();
        return;
      }
      Alert.alert(t('error'), t('failedLogTime'));
    } finally {
      setLoading(false);
    }
  };

  const total = hours && rate ? parseFloat(hours) * parseFloat(rate) : 0;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ padding: spacing.lg }}>
        <FormField label={t('description')} value={description} onChangeText={setDescription} placeholder={t('whatDidYouWorkOn')} />
        <FormField label={t('hours')} value={hours} onChangeText={setHours} keyboardType="decimal-pad" placeholder="2.5" />
        <FormField label={t('hourlyRate')} value={rate} onChangeText={setRate} keyboardType="decimal-pad" placeholder="75" />

        {clients.length > 0 && (
          <>
            <Text style={[styles.label, { color: colors.text }]}>{t('clientOptional')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
              <TouchableOpacity
                style={[styles.chip, { borderColor: colors.border }, !clientId && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                onPress={() => setClientId('')}
              >
                <Text style={{ color: !clientId ? '#fff' : colors.textSecondary, fontWeight: '600' }}>—</Text>
              </TouchableOpacity>
              {clients.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.chip, { borderColor: colors.border }, clientId === c.id && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                  onPress={() => setClientId(c.id)}
                >
                  <Text style={{ color: clientId === c.id ? '#fff' : colors.textSecondary, fontWeight: '600' }}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {total > 0 && (
          <View style={styles.preview}>
            <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>{t('total')}</Text>
            <Text style={[styles.previewValue, { color: colors.accent }]}>{formatCurrency(total, currency, lang)}</Text>
          </View>
        )}
        <Button label={t('logTime')} onPress={handleSave} loading={loading} fullWidth icon="timer-outline" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1, marginRight: spacing.sm },
  preview: { alignItems: 'center', padding: spacing.lg },
  previewLabel: { fontSize: 14 },
  previewValue: { fontSize: 32, fontWeight: '800', marginTop: 4 },
});
