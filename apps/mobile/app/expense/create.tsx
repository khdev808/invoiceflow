import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { expensesApi, ocrApi, uploadsApi } from '@/lib/api';
import { queueOfflineOp } from '@/lib/offline';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/hooks/useI18n';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { expenseCategories, radius, spacing } from '@/constants/theme';
import { TouchableOpacity, Alert } from 'react-native';

export default function CreateExpenseScreen() {
  const { receiptUri, id } = useLocalSearchParams<{ receiptUri?: string; id?: string }>();
  const { colors } = useTheme();
  const { t } = useI18n();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [vendor, setVendor] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>();

  useEffect(() => {
    if (!id) return;
    expensesApi.list().then(({ data }) => {
      const exp = data.find((e: any) => e.id === id);
      if (exp) {
        setDescription(exp.description);
        setAmount(String(exp.amount));
        setCategory(exp.category);
        setVendor(exp.vendor || '');
        setReceiptUrl(exp.receiptUrl);
      }
    });
  }, [id]);

  useEffect(() => {
    if (!receiptUri) return;
    (async () => {
      setScanning(true);
      try {
        const base64 = await FileSystem.readAsStringAsync(receiptUri, { encoding: FileSystem.EncodingType.Base64 });
        const mimeType = receiptUri.endsWith('.png') ? 'image/png' : 'image/jpeg';
        const { data: ocr } = await ocrApi.parseReceipt(receiptUri, base64, mimeType);
        setDescription(ocr.description);
        setAmount(String(ocr.amount));
        setVendor(ocr.vendor);
        setCategory(ocr.category);
        try {
          const uploadRes = await uploadsApi.receipt(`data:${mimeType};base64,${base64}`, mimeType);
          setReceiptUrl(uploadRes.data?.url || uploadRes.data);
        } catch {
          setReceiptUrl(receiptUri);
        }
      } catch (e: any) {
        if (e.response?.status === 403) {
          Alert.alert(t('error'), t('ocrProOnly'));
        }
      } finally {
        setScanning(false);
      }
    })();
  }, [receiptUri, t]);

  const handleSave = async () => {
    if (!description || !amount) {
      Alert.alert(t('error'), t('descriptionAmountRequired'));
      return;
    }
    setLoading(true);
    const payload = {
      description,
      amount: parseFloat(amount),
      category,
      vendor: vendor || undefined,
      receiptUrl: receiptUrl || receiptUri,
    };
    try {
      if (id) {
        await expensesApi.update(id as string, payload);
      } else {
        await expensesApi.create(payload);
      }
      router.back();
    } catch (e: any) {
      if (!e.response && !id) {
        await queueOfflineOp({ method: 'POST', url: '/expenses', body: payload });
        Alert.alert(t('savedOffline'), t('savedOfflineMsg'));
        router.back();
        return;
      }
      Alert.alert(t('error'), t('failedSaveExpense'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">
      <View style={{ padding: spacing.lg }}>
        {receiptUri ? <Image source={{ uri: receiptUri }} style={styles.receipt} /> : null}
        {scanning ? <Text style={[styles.scanning, { color: colors.primary }]}>{t('scanningReceipt')}</Text> : null}

        <FormField label={t('description')} value={description} onChangeText={setDescription} placeholder={t('whatWasExpense')} />
        <FormField label={t('amount')} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" />
        <FormField label={t('vendor')} value={vendor} onChangeText={setVendor} placeholder={t('storeVendor')} />

        <Text style={[styles.label, { color: colors.text }]}>{t('category')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
          {expenseCategories.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.surface }, category === c && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => setCategory(c)}
            >
              <Text style={[styles.chipText, { color: colors.textSecondary }, category === c && { color: '#fff' }]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Button label={id ? t('save') : t('saveExpense')} onPress={handleSave} loading={loading} fullWidth icon="receipt-outline" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  receipt: { width: '100%', height: 160, borderRadius: radius.lg, marginBottom: spacing.md },
  scanning: { textAlign: 'center', marginBottom: spacing.md, fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1, marginRight: spacing.sm },
  chipText: { fontSize: 13, fontWeight: '600' },
});
