export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    typeof value === 'string' ? new Date(value) : value,
  );
}

export function formatDateTime(value: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(typeof value === 'string' ? new Date(value) : value);
}

export function calcLineTotal(item: { quantity: number; unitPrice: number; taxRate?: number; discount?: number }) {
  const sub = item.quantity * item.unitPrice;
  const discount = sub * ((item.discount || 0) / 100);
  const afterDiscount = sub - discount;
  const tax = afterDiscount * ((item.taxRate || 0) / 100);
  return afterDiscount + tax;
}
