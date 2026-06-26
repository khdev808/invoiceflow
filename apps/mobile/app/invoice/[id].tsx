import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Share, Linking } from 'react-native';
import { useState, useCallback } from 'react';
import { useLocalSearchParams, useFocusEffect, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { invoicesApi, paymentsApi, PORTAL_BASE } from '@/lib/api';
import { shareInvoice } from '@/lib/share';
import { exportInvoicePdf, previewInvoicePdf } from '@/lib/exportInvoicePdf';
import { PaymentQRCode } from '@/components/PaymentQRCode';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/hooks/useI18n';
import { useAuthStore } from '@/stores/auth';
import { formatCurrency } from '@/lib/format';
import { templates } from '@/constants/theme';
import { devLogAction, devPress } from '@/lib/devLog';
import { radius, spacing, shadows } from '@/constants/theme';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { t, lang } = useI18n();
  const user = useAuthStore((s) => s.user);
  const STATUS_COLORS: Record<string, string> = {
    DRAFT: colors.textMuted, SENT: colors.primary, VIEWED: colors.warning, PAID: colors.accent, OVERDUE: colors.danger,
  };
  const [invoice, setInvoice] = useState<any>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const load = async () => {
    try {
      const { data } = await invoicesApi.get(id);
      setInvoice(data);
    } catch {
      Alert.alert(t('error'), t('failed'));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, [id]));

  const pdfData = invoice ? {
    ...invoice,
    user: invoice.user || user,
  } : null;

  const currency = invoice?.currency || user?.currency || 'USD';
  const tplName = templates.find((x) => x.id === invoice?.templateId)?.name;

  const handleSend = async () => {
    devLogAction('invoice:send', { id });
    setActionLoading(true);
    try {
      await invoicesApi.send(id);
      load();
      Alert.alert(t('success'), t('sentSuccess'));
    } catch {
      Alert.alert(t('error'), t('failed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvert = async () => {
    devLogAction('invoice:convert', { id });
    setActionLoading(true);
    try {
      const { data } = await invoicesApi.convert(id);
      Alert.alert(t('success'), t('convertedSuccess'));
      load();
    } catch {
      Alert.alert(t('error'), t('failed'));
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
      Alert.alert(t('error'), t('failed'));
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
      else Alert.alert(t('paid'), t('alreadyPaid'));
    } catch {
      Alert.alert(t('error'), t('failed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleWhatsApp = async () => {
    devLogAction('invoice:whatsapp', { id });
    setActionLoading(true);
    try {
      let url;
      try {
        const { data } = await paymentsApi.createLink(id);
        url = data.url;
      } catch { /* optional */ }
      await shareInvoice(invoice, url);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicate = async () => {
    devLogAction('invoice:duplicate', { id });
    setActionLoading(true);
    try {
      const { data } = await invoicesApi.duplicate(id);
      router.replace(`/invoice/${data.id}`);
    } catch {
      Alert.alert(t('error'), t('failed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSharePortal = async () => {
    devLogAction('invoice:share-portal', { id });
    const url = `${PORTAL_BASE}/${id}`;
    await Share.share({ message: `View invoice ${invoice.documentNumber}: ${url}`, url });
  };

  const handleExportPdf = async () => {
    if (!pdfData) return;
    devLogAction('invoice:export-pdf', { id });
    setPdfLoading(true);
    try {
      await exportInvoicePdf(pdfData, 'share');
    } catch {
      Alert.alert(t('error'), t('failed'));
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePreviewPdf = async () => {
    if (!pdfData) return;
    devLogAction('invoice:preview-pdf', { id });
    setPdfLoading(true);
    try {
      await previewInvoicePdf(pdfData);
    } catch {
      Alert.alert(t('error'), t('failed'));
    } finally {
      setPdfLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    devLogAction('invoice:mark-paid', { id });
    setActionLoading(true);
    try {
      let amount = invoice.total;
      if (!invoice.depositPaid) {
        if (invoice.depositAmount) amount = invoice.depositAmount;
        else if (invoice.depositPercent) amount = invoice.total * invoice.depositPercent / 100;
      }
      await invoicesApi.recordPayment(id, { amount, method: 'CASH' });
      load();
    } catch {
      Alert.alert(t('error'), t('failed'));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />;
  if (!invoice) return <Text style={{ textAlign: 'center', marginTop: 40, color: colors.text }}>{t('notFound')}</Text>;

  const styles = makeStyles(colors);
  const tplColor = templates.find((x) => x.id === invoice.templateId)?.color || colors.primary;

  return (
    <>
      <Stack.Screen options={{ title: invoice.documentNumber }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.docType}>{invoice.documentType}</Text>
            <Text style={styles.docNum}>{invoice.documentNumber}</Text>
            {tplName && (
              <View style={[styles.themeBadge, { backgroundColor: tplColor + '18' }]}>
                <View style={[styles.themeDot, { backgroundColor: tplColor }]} />
                <Text style={[styles.themeText, { color: tplColor }]}>{tplName}</Text>
              </View>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[invoice.status] + '20' }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[invoice.status] }]}>{invoice.status}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>{t('billTo')}</Text>
          <Text style={styles.clientName}>{invoice.client.name}</Text>
          {invoice.client.email && <Text style={styles.clientDetail}>{invoice.client.email}</Text>}
          {invoice.client.company && <Text style={styles.clientDetail}>{invoice.client.company}</Text>}
        </View>

        <View style={styles.card}>
          {invoice.lineItems.map((item: any) => (
            <View key={item.id} style={styles.lineItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.lineDesc}>{item.description}</Text>
                <Text style={styles.lineMeta}>
                  {item.quantity} × {formatCurrency(item.unitPrice, currency, lang)}
                  {item.taxRate > 0 ? ` + ${item.taxRate}% ${t('tax')}` : ''}
                </Text>
              </View>
              <Text style={styles.lineTotal}>{formatCurrency(item.total, currency, lang)}</Text>
            </View>
          ))}
          <View style={styles.totals}>
            <View style={styles.totalRow}><Text>{t('subtotal')}</Text><Text>{formatCurrency(invoice.subtotal, currency, lang)}</Text></View>
            {invoice.discountTotal > 0 && <View style={styles.totalRow}><Text>{t('discount')}</Text><Text>-{formatCurrency(invoice.discountTotal, currency, lang)}</Text></View>}
            {invoice.taxTotal > 0 && <View style={styles.totalRow}><Text>{t('tax')}</Text><Text>{formatCurrency(invoice.taxTotal, currency, lang)}</Text></View>}
            {invoice.depositPercent > 0 && (
              <View style={styles.totalRow}>
                <Text>{t('depositRequest')} ({invoice.depositPercent}%)</Text>
                <Text>{formatCurrency(invoice.total * invoice.depositPercent / 100, currency, lang)}{invoice.depositPaid ? ` (${t('depositPaid')})` : ''}</Text>
              </View>
            )}
            {invoice.depositAmount > 0 && (
              <View style={styles.totalRow}>
                <Text>{t('depositRequest')}</Text>
                <Text>{formatCurrency(invoice.depositAmount, currency, lang)}{invoice.depositPaid ? ` (${t('depositPaid')})` : ''}</Text>
              </View>
            )}
            {invoice.lateFeeAmount > 0 && (
              <View style={styles.totalRow}>
                <Text style={{ color: colors.danger }}>{t('lateFee')}</Text>
                <Text style={{ color: colors.danger }}>{formatCurrency(invoice.lateFeeAmount, currency, lang)}</Text>
              </View>
            )}
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={styles.grandLabel}>{t('total')}</Text>
              <Text style={styles.grandValue}>{formatCurrency(invoice.total, currency, lang)}</Text>
            </View>
          </View>
        </View>

        {invoice.terms && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{t('termsLabel')}</Text>
            <Text style={styles.clientDetail}>{invoice.terms}</Text>
          </View>
        )}

        {invoice.notes && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{t('notes')}</Text>
            <Text style={styles.clientDetail}>{invoice.notes}</Text>
          </View>
        )}

        {invoice.activities?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{t('activity')}</Text>
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

        <View style={styles.pdfRow}>
          <TouchableOpacity style={[styles.pdfBtn, { borderColor: colors.primary }]} onPress={handlePreviewPdf} disabled={pdfLoading}>
            <Ionicons name="eye-outline" size={20} color={colors.primary} />
            <Text style={[styles.pdfBtnText, { color: colors.primary }]}>{t('previewPdf')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.primary }]} onPress={handleExportPdf} disabled={pdfLoading}>
            {pdfLoading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="download-outline" size={20} color="#fff" />
                <Text style={[styles.pdfBtnText, { color: '#fff' }]}>{t('exportPdf')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          {invoice.status === 'DRAFT' && (
            <>
              <TouchableOpacity style={styles.secondaryBtn} onPress={devPress('invoice:edit', () => router.push(`/invoice/edit/${id}`))}>
                <Ionicons name="create-outline" size={20} color={colors.primary} />
                <Text style={styles.secondaryBtnText}>{t('editInvoice')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleSend} disabled={actionLoading}>
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.primaryBtnText}>{t('sendInvoice')}</Text>
              </TouchableOpacity>
            </>
          )}
          {invoice.documentType === 'ESTIMATE' && invoice.status !== 'PAID' && (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleConvert} disabled={actionLoading}>
              <Ionicons name="swap-horizontal" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>{t('convertToInvoice')}</Text>
            </TouchableOpacity>
          )}
          {invoice.status !== 'PAID' && (
            <>
              <TouchableOpacity style={styles.secondaryBtn} onPress={handlePaymentLink} disabled={actionLoading}>
                <Ionicons name="link" size={20} color={colors.primary} />
                <Text style={styles.secondaryBtnText}>{t('paymentLink')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={handlePayPal} disabled={actionLoading}>
                <Ionicons name="logo-paypal" size={20} color="#0070BA" />
                <Text style={[styles.secondaryBtnText, { color: '#0070BA' }]}>{t('payWithPayPal')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleMarkPaid} disabled={actionLoading}>
                <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                <Text style={[styles.secondaryBtnText, { color: colors.accent }]}>{t('markPaid')}</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleWhatsApp}>
            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
            <Text style={[styles.secondaryBtnText, { color: '#25D366' }]}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleDuplicate} disabled={actionLoading}>
            <Ionicons name="copy-outline" size={20} color={colors.primary} />
            <Text style={styles.secondaryBtnText}>Duplicate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleSharePortal}>
            <Ionicons name="globe-outline" size={20} color={colors.primary} />
            <Text style={styles.secondaryBtnText}>{t('clientPortal')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleExportPdf} disabled={pdfLoading}>
            <Ionicons name="share-outline" size={20} color={colors.text} />
            <Text style={styles.secondaryBtnText}>{t('sharePdf')}</Text>
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
  themeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full, alignSelf: 'flex-start' },
  themeDot: { width: 8, height: 8, borderRadius: 4 },
  themeText: { fontSize: 12, fontWeight: '700' },
  statusBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full },
  statusText: { fontSize: 13, fontWeight: '700' },
  card: { backgroundColor: colors.surface, marginHorizontal: spacing.lg, marginBottom: spacing.md, borderRadius: radius.md, padding: spacing.md, ...shadows.sm },
  cardLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', marginBottom: spacing.sm },
  clientName: { fontSize: 18, fontWeight: '700', color: colors.text },
  clientDetail: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
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
  pdfRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  pdfBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1 },
  pdfBtnText: { fontSize: 15, fontWeight: '700' },
  actions: { padding: spacing.lg, gap: spacing.sm, marginBottom: spacing.xxl },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary, padding: spacing.md, borderRadius: radius.md },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  secondaryBtnText: { fontSize: 16, fontWeight: '600', color: colors.primary },
});
