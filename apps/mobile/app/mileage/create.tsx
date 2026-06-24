import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { mileageApi } from '@/lib/api';
import { queueOfflineOp } from '@/lib/offline';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { useI18n } from '@/hooks/useI18n';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/format';
import { spacing } from '@/constants/theme';
import { Alert } from 'react-native';

export default function CreateMileageScreen() {
  const { colors } = useTheme();
  const { t, lang } = useI18n();
  const currency = useUserCurrency();
  const user = useAuthStore((s) => s.user);
  const defaultRate = user?.settings?.mileageRate ?? 0.67;
  const [description, setDescription] = useState('');
  const [miles, setMiles] = useState('');
  const [rate, setRate] = useState(String(defaultRate));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    mileageApi.summary().then(({ data }) => {
      if (data?.defaultRate) setRate(String(data.defaultRate));
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!description || !miles) {
      Alert.alert(t('error'), t('descriptionMilesRequired'));
      return;
    }
    setLoading(true);
    const payload = { description, miles: parseFloat(miles), rate: parseFloat(rate) };
    try {
      await mileageApi.create(payload);
      router.back();
    } catch (e: any) {
      if (!e.response) {
        await queueOfflineOp({ method: 'POST', url: '/mileage', body: payload });
        Alert.alert(t('savedOffline'), t('savedOfflineMsg'));
        router.back();
        return;
      }
      Alert.alert(t('error'), t('failedLogMileage'));
    } finally {
      setLoading(false);
    }
  };

  const deduction = miles && rate ? parseFloat(miles) * parseFloat(rate) : 0;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ padding: spacing.lg }}>
        <FormField label={t('tripDescription')} value={description} onChangeText={setDescription} placeholder={t('clientSiteVisit')} />
        <FormField label={t('miles')} value={miles} onChangeText={setMiles} keyboardType="decimal-pad" placeholder="42.5" />
        <FormField label={t('ratePerMile')} value={rate} onChangeText={setRate} keyboardType="decimal-pad" />
        {deduction > 0 && (
          <Text style={[styles.preview, { color: '#7C3AED' }]}>
            {t('deduction')}: {formatCurrency(deduction, currency, lang)}
          </Text>
        )}
        <Button label={t('logMileage')} onPress={handleSave} loading={loading} fullWidth icon="car-outline" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  preview: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginVertical: spacing.lg },
});
