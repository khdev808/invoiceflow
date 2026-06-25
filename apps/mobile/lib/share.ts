import { Linking, Share } from 'react-native';
import { getPortalUrl } from './config';

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
  const portalUrl = getPortalUrl(invoice.id);
  const message = `Invoice ${invoice.documentNumber} for $${invoice.total.toFixed(2)}${paymentUrl ? `\nPay here: ${paymentUrl}` : ''}\nView: ${portalUrl}`;
  return shareViaWhatsApp(message);
}

export { getPortalUrl };
