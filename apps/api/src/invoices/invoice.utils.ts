function calcLineTotal(item: { quantity: number; unitPrice: number; taxRate?: number; discount?: number }) {
  const base = item.quantity * item.unitPrice;
  const afterDiscount = base - (item.discount || 0);
  const tax = afterDiscount * ((item.taxRate || 0) / 100);
  return Math.round((afterDiscount + tax) * 100) / 100;
}

export function calcInvoiceTotals(lineItems: Array<{ quantity: number; unitPrice: number; taxRate?: number; discount?: number }>) {
  let subtotal = 0;
  let taxTotal = 0;
  let discountTotal = 0;

  for (const item of lineItems) {
    const base = item.quantity * item.unitPrice;
    subtotal += base;
    discountTotal += item.discount || 0;
    const afterDiscount = base - (item.discount || 0);
    taxTotal += afterDiscount * ((item.taxRate || 0) / 100);
  }

  const total = subtotal - discountTotal + taxTotal;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxTotal: Math.round(taxTotal * 100) / 100,
    discountTotal: Math.round(discountTotal * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

export { calcLineTotal };
