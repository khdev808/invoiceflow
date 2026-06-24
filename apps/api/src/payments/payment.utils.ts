export function getDepositDue(invoice: {
  total: number;
  depositPercent?: number | null;
  depositAmount?: number | null;
  depositPaid?: boolean;
}) {
  if (invoice.depositPaid) return 0;
  if (invoice.depositAmount && invoice.depositAmount > 0) return invoice.depositAmount;
  if (invoice.depositPercent && invoice.depositPercent > 0) {
    return Math.round(invoice.total * (invoice.depositPercent / 100) * 100) / 100;
  }
  return 0;
}

export function getAmountDue(
  invoice: {
    total: number;
    depositPercent?: number | null;
    depositAmount?: number | null;
    depositPaid?: boolean;
  },
  paidTotal: number,
) {
  const depositDue = getDepositDue(invoice);
  if (depositDue > 0) return depositDue;
  return Math.max(0, Math.round((invoice.total - paidTotal) * 100) / 100);
}

export function isFullyPaid(invoice: { total: number; depositPaid?: boolean }, paidTotal: number) {
  return paidTotal >= invoice.total;
}
