const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-[var(--if-border)] text-[var(--if-muted)]',
  SENT: 'bg-[var(--if-accent-soft)] text-[var(--if-text)]',
  VIEWED: 'bg-[var(--if-warning-soft)] text-[var(--if-warning)]',
  PAID: 'bg-[var(--if-success-soft)] text-[var(--if-success)]',
  OVERDUE: 'bg-[var(--if-danger-soft)] text-[var(--if-danger)]',
  CANCELLED: 'bg-[var(--if-border)] text-[var(--if-muted)]',
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || 'bg-[var(--if-border)] text-[var(--if-muted)]';
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${style}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
