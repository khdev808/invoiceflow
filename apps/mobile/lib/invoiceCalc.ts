/** Client-side invoice total calculations matching API logic */
export function calcLineTotals(
  lineItems: Array<{ quantity: string; unitPrice: string; taxRate: string; discount: string }>,
  creditNote = false,
) {
  let subtotal = 0;
  let taxTotal = 0;
  let discountTotal = 0;

  for (const item of lineItems) {
    const qty = parseFloat(item.quantity || '0');
    const price = parseFloat(item.unitPrice || '0');
    const disc = parseFloat(item.discount || '0');
    const tax = parseFloat(item.taxRate || '0');
    const base = qty * price;
    subtotal += base;
    discountTotal += disc;
    const afterDiscount = base - disc;
    taxTotal += afterDiscount * (tax / 100);
  }

  const total = subtotal - discountTotal + taxTotal;
  const sign = creditNote ? -1 : 1;
  return {
    subtotal: sign * Math.abs(subtotal),
    taxTotal: sign * Math.abs(taxTotal),
    discountTotal,
    total: sign * Math.abs(total),
  };
}
