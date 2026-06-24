import { Linking, Share, Platform } from 'react-native';

export async function shareViaWhatsApp(message: string, phone?: string) {
  const encoded = encodeURIComponent(message);
  const url = phone
    ? `whatsapp://send?phone=${phone.replace(/\D/g, '')}&text=${encoded}`
    : `whatsapp://send?text=${encoded}`;

  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
    return true;
  }
  await Share.share({ message });
  return false;
}

export async function shareInvoice(invoice: { documentNumber: string; total: number; id: string }, paymentUrl?: string) {
  const portalUrl = `http://localhost:3000/portal/${invoice.id}`;
  const message = `Invoice ${invoice.documentNumber} for $${invoice.total.toFixed(2)}${paymentUrl ? `\nPay here: ${paymentUrl}` : ''}\nView: ${portalUrl}`;
  return shareViaWhatsApp(message);
}

export function getPortalUrl(invoiceId: string) {
  return `${Platform.OS === 'web' ? '' : 'http://localhost:3000'}/portal/${invoiceId}`;
}
