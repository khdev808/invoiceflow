import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { clientsApi, invoicesApi, productsApi } from '@/lib/api';
import { queueOfflineOp } from '@/lib/offline';
import { SignaturePad } from '@/components/SignaturePad';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/hooks/useI18n';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { PaywallModal } from '@/components/PaywallModal';
import { formatCurrency } from '@/lib/format';
import { radius, spacing } from '@/constants/theme';

interface LineItem {
  description: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
  discount: string;
}

export default function CreateInvoiceScreen() {
  const { type, clientId: paramClientId, prefilled } = useLocalSearchParams<{ type?: string; clientId?: string; prefilled?: string }>();
  const { colors } = useTheme();
  const { t, lang } = useI18n();
  const currency = useUserCurrency();
  const docType = type === 'ESTIMATE' ? 'ESTIMATE' : type === 'CREDIT_NOTE' ? 'CREDIT_NOTE' : 'INVOICE';

  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clientId, setClientId] = useState('');
  const [linkedInvoiceId, setLinkedInvoiceId] = useState('');
  const [notes, setNotes] = useState('');
  const [signature, setSignature] = useState('');
  const [depositPercent, setDepositPercent] = useState('');
  const [recurring, setRecurring] = useState('');
  const [showSignature, setShowSignature] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: '1', unitPrice: '', taxRate: '0', discount: '0' },
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);

  useEffect(() => {
    Promise.all([
      clientsApi.list(),
      productsApi.list(),
      docType === 'CREDIT_NOTE' ? invoicesApi.list({ type: 'INVOICE' }) : Promise.resolve({ data: [] }),
    ]).then(([c, p, inv]) => {
      setClients(c.data);
      setProducts(p.data);
      setInvoices((inv.data || []).filter((i: any) => ['SENT', 'VIEWED', 'OVERDUE', 'PAID'].includes(i.status)));
      if (paramClientId && c.data.some((x: any) => x.id === paramClientId)) {
        setClientId(paramClientId);
      } else if (c.data.length > 0) {
        setClientId(c.data[0].id);
      }
    }).finally(() => setLoadingClients(false));
  }, [paramClientId, docType]);

  useEffect(() => {
    if (!prefilled) return;
    try {
      const items = JSON.parse(prefilled);
      if (Array.isArray(items) && items.length > 0) {
        setLineItems(items.map((i: any) => ({
          description: i.description || '',
          quantity: String(i.quantity ?? 1),
          unitPrice: String(i.unitPrice ?? 0),
          taxRate: String(i.taxRate ?? 0),
          discount: String(i.discount ?? 0),
        })));
      }
    } catch { /* ignore bad payload */ }
  }, [prefilled]);

  const addProductLine = (product: any) => {
    setLineItems([...lineItems, {
      description: product.name,
      quantity: '1',
      unitPrice: String(product.unitPrice),
      taxRate: String(product.taxRate || 0),
      discount: '0',
    }]);
  };

  const addLine = () => setLineItems([...lineItems, { description: '', quantity: '1', unitPrice: '', taxRate: '0', discount: '0' }]);

  const updateLine = (index: number, field: keyof LineItem, value: string) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const calcTotal = () => {
    const raw = lineItems.reduce((sum, item) => {
      const base = parseFloat(item.quantity || '0') * parseFloat(item.unitPrice || '0');
      const afterDiscount = base - parseFloat(item.discount || '0');
      const tax = afterDiscount * (parseFloat(item.taxRate || '0') / 100);
      return sum + afterDiscount + tax;
    }, 0);
    return docType === 'CREDIT_NOTE' ? -Math.abs(raw) : raw;
  };

  const handleSave = async (send = false) => {
    if (!clientId) { Alert.alert(t('error'), t('selectClient')); return; }
    const validItems = lineItems.filter((i) => i.description && i.unitPrice);
    if (validItems.length === 0) { Alert.alert(t('error'), t('addLineItemRequired')); return; }

    setLoading(true);
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const payload = {
        clientId,
        documentType: docType,
        dueDate: dueDate.toISOString(),
        notes,
        signature: signature || undefined,
        depositPercent: depositPercent ? parseFloat(depositPercent) : undefined,
        recurringRule: recurring || undefined,
        linkedInvoiceId: linkedInvoiceId || undefined,
        lineItems: validItems.map((i) => ({
          description: i.description,
          quantity: parseFloat(i.quantity),
          unitPrice: parseFloat(i.unitPrice),
          taxRate: parseFloat(i.taxRate),
          discount: parseFloat(i.discount),
        })),
      };

      let invoiceId: string;
      try {
        const { data } = await invoicesApi.create(payload);
        invoiceId = data.id;
      } catch (e: any) {
        if (!e.response) {
          await queueOfflineOp({ method: 'POST', url: '/invoices', body: payload });
          Alert.alert(t('savedOffline'), t('savedOfflineMsg'));
          router.back();
          return;
        }
        if (e.response?.status === 403) {
          setPaywall(true);
          return;
        }
        throw e;
      }

      if (send) await invoicesApi.send(invoiceId);
      router.replace(`/invoice/${invoiceId}`);
    } catch (e: any) {
      Alert.alert(t('error'), e.response?.data?.message || t('failedCreateInvoice'));
    } finally {
      setLoading(false);
    }
  };

  if (loadingClients) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />;

  const styles = makeStyles(colors);

  const screenTitle = docType === 'ESTIMATE' ? t('newEstimate') : docType === 'CREDIT_NOTE' ? t('newCreditNote') : t('newInvoice');

  return (
    <>
      <Stack.Screen options={{ title: screenTitle }} />
      <PaywallModal visible={paywall} onClose={() => setPaywall(false)} reason="limit" />
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>{t('client')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clientList}>
          {clients.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.clientChip, clientId === c.id && styles.clientChipActive]}
              onPress={() => setClientId(c.id)}
            >
              <Text style={[styles.clientChipText, clientId === c.id && styles.clientChipTextActive]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addClientChip} onPress={() => router.push('/client/create')}>
            <Ionicons name="add" size={18} color={colors.primary} />
          </TouchableOpacity>
        </ScrollView>

        {docType === 'CREDIT_NOTE' && invoices.length > 0 && (
          <>
            <Text style={styles.label}>{t('linkToInvoice')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clientList}>
              <TouchableOpacity
                style={[styles.clientChip, !linkedInvoiceId && styles.clientChipActive]}
                onPress={() => setLinkedInvoiceId('')}
              >
                <Text style={[styles.clientChipText, !linkedInvoiceId && styles.clientChipTextActive]}>—</Text>
              </TouchableOpacity>
              {invoices.map((inv) => (
                <TouchableOpacity
                  key={inv.id}
                  style={[styles.clientChip, linkedInvoiceId === inv.id && styles.clientChipActive]}
                  onPress={() => setLinkedInvoiceId(inv.id)}
                >
                  <Text style={[styles.clientChipText, linkedInvoiceId === inv.id && styles.clientChipTextActive]}>
                    {inv.documentNumber}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {products.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t('quickAddCatalog')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
              {products.slice(0, 8).map((p) => (
                <TouchableOpacity key={p.id} style={styles.productChip} onPress={() => addProductLine(p)}>
                  <Text style={styles.productChipText}>{p.name}</Text>
                  <Text style={styles.productPrice}>${p.unitPrice}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        <Text style={styles.sectionTitle}>{t('lineItems')}</Text>
        {lineItems.map((item, index) => (
          <View key={index} style={styles.lineCard}>
            <TextInput
              style={styles.input}
              placeholder={t('description')}
              placeholderTextColor={colors.textMuted}
              value={item.description}
              onChangeText={(v) => updateLine(index, 'description', v)}
            />
            <View style={styles.lineRow}>
              <View style={styles.lineField}>
                <Text style={styles.fieldLabel}>{t('qty')}</Text>
                <TextInput style={styles.smallInput} value={item.quantity} onChangeText={(v) => updateLine(index, 'quantity', v)} keyboardType="decimal-pad" />
              </View>
              <View style={styles.lineField}>
                <Text style={styles.fieldLabel}>{t('price')}</Text>
                <TextInput style={styles.smallInput} value={item.unitPrice} onChangeText={(v) => updateLine(index, 'unitPrice', v)} keyboardType="decimal-pad" placeholder="0.00" />
              </View>
              <View style={styles.lineField}>
                <Text style={styles.fieldLabel}>{t('tax')}</Text>
                <TextInput style={styles.smallInput} value={item.taxRate} onChangeText={(v) => updateLine(index, 'taxRate', v)} keyboardType="decimal-pad" />
              </View>
              <View style={styles.lineField}>
                <Text style={styles.fieldLabel}>{t('discount')}</Text>
                <TextInput style={styles.smallInput} value={item.discount} onChangeText={(v) => updateLine(index, 'discount', v)} keyboardType="decimal-pad" />
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addLineBtn} onPress={addLine}>
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.addLineText}>{t('addLineItem')}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>{t('depositRequest')}</Text>
        <TextInput style={styles.input} value={depositPercent} onChangeText={setDepositPercent} keyboardType="decimal-pad" placeholder={t('depositPlaceholder')} placeholderTextColor={colors.textMuted} />

        {docType === 'INVOICE' && (
          <>
            <Text style={styles.label}>{t('recurringSchedule')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.sm }}>
              {['', 'weekly', 'monthly', 'quarterly', 'yearly'].map((f) => (
                <TouchableOpacity key={f || 'none'} style={[styles.freqChip, recurring === f && styles.freqActive]} onPress={() => setRecurring(f)}>
                  <Text style={[styles.freqText, recurring === f && styles.freqTextActive]}>
                    {f === '' ? t('oneTime') : t(f as 'weekly' | 'monthly' | 'quarterly' | 'yearly')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        <TouchableOpacity style={styles.sigToggle} onPress={() => setShowSignature(!showSignature)}>
          <Ionicons name="create-outline" size={20} color={colors.primary} />
          <Text style={styles.sigToggleText}>{signature ? t('signatureAdded') : t('addSignature')}</Text>
        </TouchableOpacity>
        {showSignature && <SignaturePad onSave={(s) => { setSignature(s); setShowSignature(false); }} />}

        <Text style={styles.label}>{t('notes')}</Text>
        <TextInput style={[styles.input, styles.notes]} value={notes} onChangeText={setNotes} multiline placeholder={t('notesPlaceholder')} placeholderTextColor={colors.textMuted} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{t('total')}</Text>
          <Text style={[styles.totalValue, docType === 'CREDIT_NOTE' && { color: colors.danger }]}>
            {formatCurrency(calcTotal(), currency, lang)}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave(false)} disabled={loading}>
            <Text style={styles.saveBtnText}>{t('saveDraft')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendBtn} onPress={() => handleSave(true)} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendBtnText}>{t('saveAndSend')}</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  label: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
  clientList: { marginBottom: spacing.md },
  clientChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
  clientChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  clientChipText: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  clientChipTextActive: { color: '#fff' },
  addClientChip: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.primary, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  lineCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  input: { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, padding: spacing.sm, fontSize: 15, color: colors.text, marginBottom: spacing.sm },
  lineRow: { flexDirection: 'row', gap: spacing.sm },
  lineField: { flex: 1 },
  fieldLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 2 },
  smallInput: { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, padding: spacing.sm, fontSize: 14, color: colors.text, textAlign: 'center' },
  addLineBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  addLineText: { color: colors.primary, fontWeight: '600' },
  notes: { minHeight: 80, textAlignVertical: 'top' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.md },
  totalLabel: { fontSize: 18, fontWeight: '700', color: colors.text },
  totalValue: { fontSize: 28, fontWeight: '800', color: colors.primary },
  actions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xxl },
  saveBtn: { flex: 1, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primary, alignItems: 'center' },
  saveBtnText: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  sendBtn: { flex: 1, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center' },
  sendBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  productChip: { backgroundColor: colors.surface, padding: spacing.sm, borderRadius: radius.md, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border, minWidth: 90, alignItems: 'center' },
  productChipText: { fontSize: 13, fontWeight: '600', color: colors.text },
  productPrice: { fontSize: 12, color: colors.primary, marginTop: 2 },
  freqChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
  freqActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  freqText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  freqTextActive: { color: '#fff' },
  sigToggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  sigToggleText: { color: colors.primary, fontWeight: '600' },
});
