import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { buildInvoicePdfHtml, pdfFilename, type InvoicePdfData } from './invoicePdf';

export async function exportInvoicePdf(invoice: InvoicePdfData, action: 'share' | 'save' = 'share') {
  const html = buildInvoicePdfHtml(invoice);
  const { uri } = await Print.printToFileAsync({ html });
  const filename = pdfFilename(invoice);

  if (action === 'share' && (await Sharing.isAvailableAsync())) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: filename });
  }

  return { uri, filename };
}

export async function previewInvoicePdf(invoice: InvoicePdfData) {
  const html = buildInvoicePdfHtml(invoice);
  await Print.printAsync({ html });
}
