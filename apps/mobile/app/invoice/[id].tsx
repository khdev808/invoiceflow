import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Share, Linking } from 'react-native';
import { useState, useCallback } from 'react';
import { useLocalSearchParams, useFocusEffect, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { invoicesApi, paymentsApi, PORTAL_BASE } from '@/lib/api';
import { shareInvoice } from '@/lib/share';
import { buildInvoicePdfHtml } from '@/lib/invoicePdf';
import { PaymentQRCode } from '@/components/PaymentQRCode';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/hooks/useI18n';
import { devLogAction, devPress } from '@/lib/devLog';
import { radius, spacing, shadows } from '@/constants/theme';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { t } = useI18n();
  const STATUS_COLORS: Record<string, string> = {
    DRAFT: colors.textMuted, SENT: colors.primary, VIEWED: colors.warning, PAID: colors.accent, OVERDUE: colors.danger,
  };
  const [invoice, setInvoice] = useState<any>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    try {
      const { data } = await invoicesApi.get(id);
      setInvoice(data);
    } catch {
      Alert.alert('Error', 'Could not load invoice');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, [id]));

  const handleSend = async () => {
    devLogAction('invoice:send', { id });
    setActionLoading(true);
    try {
      await invoicesApi.send(id);
      load();
      Alert.alert('Sent!', 'Invoice has been sent to your client.');
    } catch {
      Alert.alert('Error', 'Failed to send invoice');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvert = async () => {
    devLogAction('invoice:convert', { id });
    setActionLoading(true);
    try {
      const { data } = await invoicesApi.convert(id);
      Alert.alert('Converted!', `Created invoice ${data.documentNumber}`);
      load();
    } catch {
      Alert.alert('Error', 'Failed to convert estimate');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePaymentLink = async () => {
    devLogAction('invoice:payment-link', { id });
    setActionLoading(true);
    try {
      const { data } = await paymentsApi.createLink(id);
      setPaymentUrl(data.url || data.qrData);
      if (data.url) {
        await Share.share({ message: `Pay invoice ${invoice.documentNumber}: ${data.url}`, url: data.url });
      }
    } catch {
      Alert.alert('Error', 'Failed to create payment link');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayPal = async () => {
    devLogAction('invoice:paypal', { id });
    setActionLoading(true);
    try {
      const { data } = await paymentsApi.publicPayPal(id);
      if (data.url) await Linking.openURL(data.url);
      else Alert.alert('Paid', 'Invoice is already paid.');
    } catch {
      Alert.alert('Error', 'PayPal link unavailable');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWhatsApp = async () => {
    devLogAction('invoice:whatsapp', { id });
    setActionLoading(true);
    try {
      let paymentUrl;
      try {
        const { data } = await paymentsApi.createLink(id);
        paymentUrl = data.url;
      } catch { /* optional */ }
      await shareInvoice(invoice, paymentUrl);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSharePortal = async () => {
    devLogAction('invoice:share-portal', { id });
    const url = `${PORTAL_BASE}/${id}`;
    await Share.share({ message: `View invoice ${invoice.documentNumber}: ${url}`, url });
  };

  const handleSharePDF = async () => {
    devLogAction('invoice:share-pdf', { id });
    if (!invoice) return;
    const html = buildInvoicePdfHtml(invoice);
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  const handleMarkPaid = async () => {
    devLogAction('invoice:mark-paid', { id });
    setActionLoading(true);
    try {
      const depositDue = invoice.depositPercent && !invoice.depositPaid
        ? invoice.total * invoice.depositPercent / 100
        : invoice.total;
      await invoicesApi.recordPayment(id, { amount: depositDue, method: 'CASH' });
      load();
    } catch {
      Alert.alert('Error', 'Failed to record payment');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />;
  if (!invoice) return <Text style={{ textAlign: 'center', marginTop: 40, color: colors.text }}>Invoice not found</Text>;

  const styles = makeStyles(colors);

  return (
    <>
      <Stack.Screen options={{ title: invoice.documentNumber }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.docType}>{invoice.documentType}</Text>
            <Text style={styles.docNum}>{invoice.documentNumber}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[invoice.status] + '20' }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[invoice.status] }]}>{invoice.status}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Bill To</Text>
          <Text style={styles.clientName}>{invoice.client.name}</Text>
          {invoice.client.email && <Text style={styles.clientDetail}>{invoice.client.email}</Text>}
          {invoice.client.company && <Text style={styles.clientDetail}>{invoice.client.company}</Text>}
        </View>

        <View style={styles.card}>
          {invoice.lineItems.map((item: any) => (
            <View key={item.id} style={styles.lineItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.lineDesc}>{item.description}</Text>
                <Text style={styles.lineMeta}>{item.quantity} × ${item.unitPrice}{item.taxRate > 0 ? ` + ${item.taxRate}% tax` : ''}</Text>
              </View>
              <Text style={styles.lineTotal}>${item.total.toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.totals}>
            <View style={styles.totalRow}><Text>Subtotal</Text><Text>${invoice.subtotal.toFixed(2)}</Text></View>
            {invoice.discountTotal > 0 && <View style={styles.totalRow}><Text>Discount</Text><Text>-${invoice.discountTotal.toFixed(2)}</Text></View>}
            {invoice.taxTotal > 0 && <View style={styles.totalRow}><Text>Tax</Text><Text>${invoice.taxTotal.toFixed(2)}</Text></View>}
            {invoice.depositPercent > 0 && <View style={styles.totalRow}><Text>Deposit Required ({invoice.depositPercent}%)</Text><Text>${(invoice.total * invoice.depositPercent / 100).toFixed(2)}{invoice.depositPaid ? ` (${t('depositPaid')})` : ''}</Text></View>}
            {invoice.lateFeeAmount > 0 && <View style={styles.totalRow}><Text style={{ color: colors.danger }}>Late Fee</Text><Text style={{ color: colors.danger }}>${invoice.lateFeeAmount.toFixed(2)}</Text></View>}
            <View style={[styles.totalRow, styles.grandTotal]}><Text style={styles.grandLabel}>Total</Text><Text style={styles.grandValue}>${invoice.total.toFixed(2)}</Text></View>
          </View>
        </View>

        {invoice.activities?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Activity</Text>
            {invoice.activities.map((a: any) => (
              <View key={a.id} style={styles.activity}>
                <Ionicons name={a.action === 'VIEWED' ? 'eye' : 'send'} size={16} color={colors.primary} />
                <Text style={styles.activityText}>{a.action} — {new Date(a.createdAt).toLocaleString()}</Text>
              </View>
            ))}
          </View>
        )}

        {paymentUrl && invoice.status !== 'PAID' && (
          <View style={styles.card}>
            <PaymentQRCode value={paymentUrl} label={t('scanToPay')} />
          </View>
        )}

        <View style={styles.actions}>
          {invoice.status === 'DRAFT' && (
            <>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={devPress('invoice:edit', () => router.push(`/invoice/edit/${id}`))}
              >
                <Ionicons name="create-outline" size={20} color={colors.primary} />
                <Text style={styles.secondaryBtnText}>{t('editInvoice')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleSend} disabled={actionLoading}>
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Send Invoice</Text>
            </TouchableOpacity>
            </>
          )}
          {invoice.documentType === 'ESTIMATE' && invoice.status !== 'PAID' && (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleConvert} disabled={actionLoading}>
              <Ionicons name="swap-horizontal" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Convert to Invoice</Text>
            </TouchableOpacity>
          )}
          {invoice.status !== 'PAID' && (
            <>
              <TouchableOpacity style={styles.secondaryBtn} onPress={handlePaymentLink} disabled={actionLoading}>
                <Ionicons name="link" size={20} color={colors.primary} />
                <Text style={styles.secondaryBtnText}>Payment Link</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={handlePayPal} disabled={actionLoading}>
                <Ionicons name="logo-paypal" size={20} color="#0070BA" />
                <Text style={[styles.secondaryBtnText, { color: '#0070BA' }]}>{t('payWithPayPal')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleMarkPaid} disabled={actionLoading}>
                <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                <Text style={[styles.secondaryBtnText, { color: colors.accent }]}>Mark Paid</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleWhatsApp}>
            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
            <Text style={[styles.secondaryBtnText, { color: '#25D366' }]}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleSharePortal}>
            <Ionicons name="globe-outline" size={20} color={colors.primary} />
            <Text style={styles.secondaryBtnText}>Client Portal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleSharePDF}>
            <Ionicons name="share-outline" size={20} color={colors.text} />
            <Text style={styles.secondaryBtnText}>Share PDF</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const makeStyles = (colors: typeof import('@/constants/theme').colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: spacing.lg },
  docType: { fontSize: 12, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase' },
  docNum: { fontSize: 24, fontWeight: '800', color: colors.text },
  statusBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full },
  statusText: { fontSize: 13, fontWeight: '700' },
  card: { backgroundColor: colors.surface, marginHorizontal: spacing.lg, marginBottom: spacing.md, borderRadius: radius.md, padding: spacing.md, ...shadows.sm },
  cardLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', marginBottom: spacing.sm },
  clientName: { fontSize: 18, fontWeight: '700', color: colors.text },
  clientDetail: { fontSize: 14, color: colors.textSecondary },
  lineItem: { flexDirection: 'row', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  lineDesc: { fontSize: 15, fontWeight: '600', color: colors.text },
  lineMeta: { fontSize: 13, color: colors.textMuted },
  lineTotal: { fontSize: 16, fontWeight: '700', color: colors.text },
  totals: { marginTop: spacing.md },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  grandTotal: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.sm, paddingTop: spacing.sm },
  grandLabel: { fontSize: 18, fontWeight: '700' },
  grandValue: { fontSize: 22, fontWeight: '800', color: colors.primary },
  activity: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 4 },
  activityText: { fontSize: 13, color: colors.textSecondary },
  actions: { padding: spacing.lg, gap: spacing.sm, marginBottom: spacing.xxl },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary, padding: spacing.md, borderRadius: radius.md },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  secondaryBtnText: { fontSize: 16, fontWeight: '600', color: colors.primary },
});
