import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Switch } from 'react-native';
import { useState, useCallback, useMemo } from 'react';
import { router, useLocalSearchParams, Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { clientsApi, invoicesApi } from '@/lib/api';
import { SignaturePad } from '@/components/SignaturePad';
import { TemplatePicker } from '@/components/TemplatePicker';
import { PaywallModal } from '@/components/PaywallModal';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/hooks/useI18n';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { useAuthStore } from '@/stores/auth';
import { formatCurrency } from '@/lib/format';
import { previewInvoicePdf } from '@/lib/exportInvoicePdf';
import { calcLineTotals } from '@/lib/invoiceCalc';
import { paymentTermOptions, templates } from '@/constants/theme';
import { radius, spacing } from '@/constants/theme';

interface LineItem {
  description: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
  discount: string;
}

export default function EditInvoiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { t, lang } = useI18n();
  const currency = useUserCurrency();
  const user = useAuthStore((s) => s.user);
  const isPro = user?.plan === 'pro' || user?.plan === 'business';
  const defaultTax = String(user?.settings?.defaultTaxRate ?? 0);

  const [clients, setClients] = useState<any[]>([]);
  const [clientId, setClientId] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [signature, setSignature] = useState('');
  const [templateId, setTemplateId] = useState('modern');
  const [paymentTermDays, setPaymentTermDays] = useState(30);
  const [depositMode, setDepositMode] = useState<'percent' | 'flat'>('percent');
  const [depositPercent, setDepositPercent] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [advancedMode, setAdvancedMode] = useState(true);
  const [showSignature, setShowSignature] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [docType, setDocType] = useState('INVOICE');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const load = async () => {
    try {
      const [invoiceRes, clientsRes] = await Promise.all([
        invoicesApi.get(id),
        clientsApi.list(),
      ]);
      const inv = invoiceRes.data;
      if (inv.status !== 'DRAFT') {
        Alert.alert(t('error'), 'Only draft invoices can be edited.');
        router.back();
        return;
      }
      setDocType(inv.documentType);
      setClientId(inv.clientId);
      setNotes(inv.notes || '');
      setTerms(inv.terms || '');
      setSignature(inv.signature || '');
      setTemplateId(inv.templateId || 'modern');
      if (inv.depositAmount) {
        setDepositMode('flat');
        setDepositAmount(String(inv.depositAmount));
      } else if (inv.depositPercent) {
        setDepositMode('percent');
        setDepositPercent(String(inv.depositPercent));
      }
      if (inv.dueDate && inv.issueDate) {
        const due = new Date(inv.dueDate);
        const issue = new Date(inv.issueDate);
        const days = Math.round((due.getTime() - issue.getTime()) / (1000 * 60 * 60 * 24));
        const match = paymentTermOptions.find((o) => o.days === days);
        if (match) setPaymentTermDays(match.days);
      }
      setLineItems(
        inv.lineItems.map((i: any) => ({
          description: i.description,
          quantity: String(i.quantity),
          unitPrice: String(Math.abs(i.unitPrice)),
          taxRate: String(i.taxRate || 0),
          discount: String(i.discount || 0),
        })),
      );
      setClients(clientsRes.data);
    } catch {
      Alert.alert(t('error'), t('failed'));
      router.back();
    } finally {
      setLoadingData(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, [id]));

  const selectedClient = clients.find((c) => c.id === clientId);
  const totals = useMemo(() => calcLineTotals(lineItems, docType === 'CREDIT_NOTE'), [lineItems, docType]);

  const updateLine = (index: number, field: keyof LineItem, value: string) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const addLine = () => setLineItems([...lineItems, { description: '', quantity: '1', unitPrice: '', taxRate: defaultTax, discount: '0' }]);
  const removeLine = (index: number) => setLineItems(lineItems.filter((_, i) => i !== index));

  const buildDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + paymentTermDays);
    return d.toISOString();
  };

  const buildPreviewInvoice = (validItems: LineItem[]) => ({
    documentType: docType,
    documentNumber: 'PREVIEW',
    issueDate: new Date(),
    dueDate: buildDueDate(),
    ...totals,
    currency,
    notes,
    terms,
    templateId,
    signature,
    depositPercent: depositMode === 'percent' && depositPercent ? parseFloat(depositPercent) : null,
    depositAmount: depositMode === 'flat' && depositAmount ? parseFloat(depositAmount) : null,
    client: selectedClient || { name: 'Client' },
    lineItems: validItems.map((i) => {
      const qty = parseFloat(i.quantity || '0');
      const price = parseFloat(i.unitPrice || '0');
      const disc = parseFloat(i.discount || '0');
      const tax = parseFloat(i.taxRate || '0');
      const base = qty * price - disc;
      const total = base + base * (tax / 100);
      return { description: i.description, quantity: qty, unitPrice: price, taxRate: tax, discount: disc, total };
    }),
    user,
  });

  const handlePreviewPdf = async () => {
    const validItems = lineItems.filter((i) => i.description && i.unitPrice);
    if (validItems.length === 0) {
      Alert.alert(t('error'), t('addLineItemRequired'));
      return;
    }
    try {
      await previewInvoicePdf(buildPreviewInvoice(validItems) as any);
    } catch {
      Alert.alert(t('error'), t('failed'));
    }
  };

  const handleSave = async () => {
    const validItems = lineItems.filter((i) => i.description && i.unitPrice);
    if (validItems.length === 0) {
      Alert.alert(t('error'), t('addLineItemRequired'));
      return;
    }

    setLoading(true);
    try {
      await invoicesApi.update(id, {
        clientId,
        dueDate: buildDueDate(),
        notes,
        terms: terms || undefined,
        signature: signature || undefined,
        templateId,
        depositPercent: depositMode === 'percent' && depositPercent ? parseFloat(depositPercent) : undefined,
        depositAmount: depositMode === 'flat' && depositAmount ? parseFloat(depositAmount) : undefined,
        lineItems: validItems.map((i) => ({
          description: i.description,
          quantity: parseFloat(i.quantity),
          unitPrice: parseFloat(i.unitPrice),
          taxRate: parseFloat(i.taxRate),
          discount: parseFloat(i.discount),
        })),
      });
      router.replace(`/invoice/${id}`);
    } catch (e: any) {
      if (e.response?.status === 403) {
        setPaywall(true);
        return;
      }
      Alert.alert(t('error'), e.response?.data?.message || t('failed'));
    } finally {
      setLoading(false);
    }
  };

  const styles = makeStyles(colors);
  const tplName = templates.find((x) => x.id === templateId)?.name;

  if (loadingData) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />;

  return (
    <>
      <Stack.Screen options={{ title: t('editInvoice') }} />
      <PaywallModal visible={paywall} onClose={() => setPaywall(false)} reason="general" />
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.modeRow}>
          <Text style={[styles.modeLabel, { color: colors.text }]}>{t('simpleMode')}</Text>
          <Switch value={advancedMode} onValueChange={setAdvancedMode} trackColor={{ true: colors.primary }} />
          <Text style={[styles.modeLabel, { color: colors.text }]}>{t('advancedMode')}</Text>
        </View>

        <Text style={styles.label}>{t('client')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clientList}>
          {clients.map((c) => (
            <TouchableOpacity key={c.id} style={[styles.clientChip, clientId === c.id && styles.clientChipActive]} onPress={() => setClientId(c.id)}>
              <Text style={[styles.clientChipText, clientId === c.id && styles.clientChipTextActive]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TemplatePicker selected={templateId} onSelect={setTemplateId} onPremiumRequired={() => setPaywall(true)} isPro={isPro} />

        <Text style={styles.sectionTitle}>{t('lineItems')}</Text>
        {lineItems.map((item, index) => (
          <View key={index} style={styles.lineCard}>
            <View style={styles.lineHeader}>
              <Text style={[styles.lineNum, { color: colors.textMuted }]}>#{index + 1}</Text>
              {lineItems.length > 1 && (
                <TouchableOpacity onPress={() => removeLine(index)}>
                  <Text style={{ color: colors.danger, fontSize: 13, fontWeight: '600' }}>{t('removeLine')}</Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput style={styles.input} placeholder={t('description')} placeholderTextColor={colors.textMuted} value={item.description} onChangeText={(v) => updateLine(index, 'description', v)} />
            <View style={styles.lineRow}>
              <View style={styles.lineField}><Text style={styles.fieldLabel}>{t('qty')}</Text><TextInput style={styles.smallInput} value={item.quantity} onChangeText={(v) => updateLine(index, 'quantity', v)} keyboardType="decimal-pad" /></View>
              <View style={styles.lineField}><Text style={styles.fieldLabel}>{t('price')}</Text><TextInput style={styles.smallInput} value={item.unitPrice} onChangeText={(v) => updateLine(index, 'unitPrice', v)} keyboardType="decimal-pad" /></View>
              {advancedMode && (
                <>
                  <View style={styles.lineField}><Text style={styles.fieldLabel}>{t('tax')}</Text><TextInput style={styles.smallInput} value={item.taxRate} onChangeText={(v) => updateLine(index, 'taxRate', v)} keyboardType="decimal-pad" /></View>
                  <View style={styles.lineField}><Text style={styles.fieldLabel}>{t('discount')}</Text><TextInput style={styles.smallInput} value={item.discount} onChangeText={(v) => updateLine(index, 'discount', v)} keyboardType="decimal-pad" /></View>
                </>
              )}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addLineBtn} onPress={addLine}>
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.addLineText}>{t('addLineItem')}</Text>
        </TouchableOpacity>

        {advancedMode && (
          <>
            <Text style={styles.label}>{t('paymentTerms')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
              {paymentTermOptions.map((opt) => (
                <TouchableOpacity key={opt.days} style={[styles.freqChip, paymentTermDays === opt.days && styles.freqActive]} onPress={() => setPaymentTermDays(opt.days)}>
                  <Text style={[styles.freqText, paymentTermDays === opt.days && styles.freqTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>{t('depositRequest')}</Text>
            <View style={styles.depositModeRow}>
              <TouchableOpacity style={[styles.freqChip, depositMode === 'percent' && styles.freqActive]} onPress={() => setDepositMode('percent')}>
                <Text style={[styles.freqText, depositMode === 'percent' && styles.freqTextActive]}>{t('percentDeposit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.freqChip, depositMode === 'flat' && styles.freqActive]} onPress={() => setDepositMode('flat')}>
                <Text style={[styles.freqText, depositMode === 'flat' && styles.freqTextActive]}>{t('flatDeposit')}</Text>
              </TouchableOpacity>
            </View>
            {depositMode === 'percent' ? (
              <TextInput style={styles.input} value={depositPercent} onChangeText={setDepositPercent} keyboardType="decimal-pad" placeholder={t('depositPlaceholder')} placeholderTextColor={colors.textMuted} />
            ) : (
              <TextInput style={styles.input} value={depositAmount} onChangeText={setDepositAmount} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.textMuted} />
            )}

            <TouchableOpacity style={styles.sigToggle} onPress={() => setShowSignature(!showSignature)}>
              <Ionicons name="create-outline" size={20} color={colors.primary} />
              <Text style={styles.sigToggleText}>{signature ? t('signatureAdded') : t('addSignature')}</Text>
            </TouchableOpacity>
            {showSignature && <SignaturePad onSave={(s) => { setSignature(s); setShowSignature(false); }} />}

            <Text style={styles.label}>{t('termsLabel')}</Text>
            <TextInput style={[styles.input, styles.notes]} value={terms} onChangeText={setTerms} multiline placeholderTextColor={colors.textMuted} />
          </>
        )}

        <Text style={styles.label}>{t('notes')}</Text>
        <TextInput style={[styles.input, styles.notes]} multiline value={notes} onChangeText={setNotes} placeholder={t('notesPlaceholder')} placeholderTextColor={colors.textMuted} />

        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>{t('total')}</Text>
              {tplName && <Text style={{ fontSize: 12, color: colors.textMuted }}>{tplName} theme</Text>}
            </View>
            <Text style={[styles.totalValue, docType === 'CREDIT_NOTE' && { color: colors.danger }]}>{formatCurrency(totals.total, currency, lang)}</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.previewBtn, { borderColor: colors.primary }]} onPress={handlePreviewPdf}>
          <Ionicons name="document-outline" size={20} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('previewPdf')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{t('saveChanges')}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
    modeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.md },
    modeLabel: { fontSize: 13, fontWeight: '600' },
    label: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm, marginTop: spacing.sm },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
    clientList: { marginBottom: spacing.md },
    clientChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
    clientChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    clientChipText: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
    clientChipTextActive: { color: '#fff' },
    lineCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
    lineHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
    lineNum: { fontSize: 12, fontWeight: '700' },
    input: { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, padding: spacing.sm, fontSize: 15, color: colors.text, marginBottom: spacing.sm },
    lineRow: { flexDirection: 'row', gap: spacing.sm },
    lineField: { flex: 1 },
    fieldLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 2 },
    smallInput: { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, padding: spacing.sm, fontSize: 14, color: colors.text, textAlign: 'center' },
    addLineBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
    addLineText: { color: colors.primary, fontWeight: '600' },
    notes: { minHeight: 80, textAlignVertical: 'top' },
    summaryCard: { borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, marginTop: spacing.md },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 18, fontWeight: '700', color: colors.text },
    totalValue: { fontSize: 28, fontWeight: '800', color: colors.primary },
    previewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, marginTop: spacing.md },
    saveBtn: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: radius.md, alignItems: 'center', marginVertical: spacing.lg },
    saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    freqChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
    freqActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    freqText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
    freqTextActive: { color: '#fff' },
    depositModeRow: { flexDirection: 'row', marginBottom: spacing.sm },
    sigToggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
    sigToggleText: { color: colors.primary, fontWeight: '600' },
  });
}
