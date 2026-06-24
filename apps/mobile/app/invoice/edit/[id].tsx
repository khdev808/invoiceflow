import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { router, useLocalSearchParams, Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { clientsApi, invoicesApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
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
  const [clients, setClients] = useState<any[]>([]);
  const [clientId, setClientId] = useState('');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [status, setStatus] = useState('DRAFT');

  const load = async () => {
    try {
      const [invoiceRes, clientsRes] = await Promise.all([
        invoicesApi.get(id),
        clientsApi.list(),
      ]);
      const inv = invoiceRes.data;
      if (inv.status !== 'DRAFT') {
        Alert.alert('Cannot Edit', 'Only draft invoices can be edited.');
        router.back();
        return;
      }
      setStatus(inv.status);
      setClientId(inv.clientId);
      setNotes(inv.notes || '');
      setLineItems(
        inv.lineItems.map((i: any) => ({
          description: i.description,
          quantity: String(i.quantity),
          unitPrice: String(i.unitPrice),
          taxRate: String(i.taxRate || 0),
          discount: String(i.discount || 0),
        })),
      );
      setClients(clientsRes.data);
    } catch {
      Alert.alert('Error', 'Could not load invoice');
      router.back();
    } finally {
      setLoadingData(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, [id]));

  const updateLine = (index: number, field: keyof LineItem, value: string) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const handleSave = async () => {
    const validItems = lineItems.filter((i) => i.description && i.unitPrice);
    if (validItems.length === 0) {
      Alert.alert('Error', 'Add at least one line item');
      return;
    }

    setLoading(true);
    try {
      await invoicesApi.update(id, {
        clientId,
        notes,
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
      Alert.alert('Error', e.response?.data?.message || 'Failed to update invoice');
    } finally {
      setLoading(false);
    }
  };

  const styles = makeStyles(colors);

  if (loadingData) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />;

  return (
    <>
      <Stack.Screen options={{ title: 'Edit Invoice' }} />
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
        </ScrollView>

        <Text style={styles.label}>Line Items</Text>
        {lineItems.map((item, index) => (
          <View key={index} style={styles.lineCard}>
            <TextInput
              style={styles.input}
              placeholder="Description"
              placeholderTextColor={colors.textMuted}
              value={item.description}
              onChangeText={(v) => updateLine(index, 'description', v)}
            />
            <View style={styles.row}>
              <TextInput style={[styles.input, styles.small]} placeholder="Qty" value={item.quantity} onChangeText={(v) => updateLine(index, 'quantity', v)} keyboardType="decimal-pad" />
              <TextInput style={[styles.input, styles.small]} placeholder="Price" value={item.unitPrice} onChangeText={(v) => updateLine(index, 'unitPrice', v)} keyboardType="decimal-pad" />
            </View>
          </View>
        ))}

        <Text style={styles.label}>Notes</Text>
        <TextInput style={[styles.input, styles.notes]} multiline value={notes} onChangeText={setNotes} placeholderTextColor={colors.textMuted} />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
    label: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: spacing.sm, marginTop: spacing.md },
    clientList: { marginBottom: spacing.sm },
    clientChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border },
    clientChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    clientChipText: { color: colors.text, fontWeight: '600' },
    clientChipTextActive: { color: '#fff' },
    lineCard: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm },
    input: { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, padding: spacing.sm, color: colors.text, marginBottom: spacing.sm },
    row: { flexDirection: 'row', gap: spacing.sm },
    small: { flex: 1 },
    notes: { minHeight: 80, textAlignVertical: 'top' },
    saveBtn: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: radius.md, alignItems: 'center', marginVertical: spacing.lg },
    saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  });
}
