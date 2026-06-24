import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { clientsApi, invoicesApi } from '@/lib/api';
import { colors, radius, spacing } from '@/constants/theme';

interface LineItem {
  description: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
  discount: string;
}

export default function CreateInvoiceScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const docType = type === 'ESTIMATE' ? 'ESTIMATE' : 'INVOICE';

  const [clients, setClients] = useState<any[]>([]);
  const [clientId, setClientId] = useState('');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: '1', unitPrice: '', taxRate: '0', discount: '0' },
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);

  useEffect(() => {
    clientsApi.list().then(({ data }) => {
      setClients(data);
      if (data.length > 0) setClientId(data[0].id);
    }).finally(() => setLoadingClients(false));
  }, []);

  const addLine = () => setLineItems([...lineItems, { description: '', quantity: '1', unitPrice: '', taxRate: '0', discount: '0' }]);

  const updateLine = (index: number, field: keyof LineItem, value: string) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const calcTotal = () => {
    return lineItems.reduce((sum, item) => {
      const base = parseFloat(item.quantity || '0') * parseFloat(item.unitPrice || '0');
      const afterDiscount = base - parseFloat(item.discount || '0');
      const tax = afterDiscount * (parseFloat(item.taxRate || '0') / 100);
      return sum + afterDiscount + tax;
    }, 0);
  };

  const handleSave = async (send = false) => {
    if (!clientId) { Alert.alert('Error', 'Select a client'); return; }
    const validItems = lineItems.filter((i) => i.description && i.unitPrice);
    if (validItems.length === 0) { Alert.alert('Error', 'Add at least one line item'); return; }

    setLoading(true);
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const { data } = await invoicesApi.create({
        clientId,
        documentType: docType,
        dueDate: dueDate.toISOString(),
        notes,
        lineItems: validItems.map((i) => ({
          description: i.description,
          quantity: parseFloat(i.quantity),
          unitPrice: parseFloat(i.unitPrice),
          taxRate: parseFloat(i.taxRate),
          discount: parseFloat(i.discount),
        })),
      });

      if (send) await invoicesApi.send(data.id);
      router.replace(`/invoice/${data.id}`);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  if (loadingClients) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />;

  return (
    <>
      <Stack.Screen options={{ title: docType === 'ESTIMATE' ? 'New Estimate' : 'New Invoice' }} />
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Client</Text>
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

        <Text style={styles.sectionTitle}>Line Items</Text>
        {lineItems.map((item, index) => (
          <View key={index} style={styles.lineCard}>
            <TextInput
              style={styles.input}
              placeholder="Description"
              placeholderTextColor={colors.textMuted}
              value={item.description}
              onChangeText={(v) => updateLine(index, 'description', v)}
            />
            <View style={styles.lineRow}>
              <View style={styles.lineField}>
                <Text style={styles.fieldLabel}>Qty</Text>
                <TextInput style={styles.smallInput} value={item.quantity} onChangeText={(v) => updateLine(index, 'quantity', v)} keyboardType="decimal-pad" />
              </View>
              <View style={styles.lineField}>
                <Text style={styles.fieldLabel}>Price</Text>
                <TextInput style={styles.smallInput} value={item.unitPrice} onChangeText={(v) => updateLine(index, 'unitPrice', v)} keyboardType="decimal-pad" placeholder="0.00" />
              </View>
              <View style={styles.lineField}>
                <Text style={styles.fieldLabel}>Tax %</Text>
                <TextInput style={styles.smallInput} value={item.taxRate} onChangeText={(v) => updateLine(index, 'taxRate', v)} keyboardType="decimal-pad" />
              </View>
              <View style={styles.lineField}>
                <Text style={styles.fieldLabel}>Disc</Text>
                <TextInput style={styles.smallInput} value={item.discount} onChangeText={(v) => updateLine(index, 'discount', v)} keyboardType="decimal-pad" />
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addLineBtn} onPress={addLine}>
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.addLineText}>Add Line Item</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Notes</Text>
        <TextInput style={[styles.input, styles.notes]} value={notes} onChangeText={setNotes} multiline placeholder="Payment terms, thank you note..." placeholderTextColor={colors.textMuted} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${calcTotal().toFixed(2)}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave(false)} disabled={loading}>
            <Text style={styles.saveBtnText}>Save Draft</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendBtn} onPress={() => handleSave(true)} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendBtnText}>Save & Send</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
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
});
