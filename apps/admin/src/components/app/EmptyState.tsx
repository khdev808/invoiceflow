import Image from 'next/image';
import type { ReactNode } from 'react';

export function EmptyState({
  title,
  description,
  action,
  illustration,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  illustration?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-16 text-center" style={{ borderColor: 'var(--if-border)', background: 'var(--if-surface)' }}>
      {illustration ? (
        <Image src={illustration} alt="" width={180} height={140} className="mb-6 opacity-90" />
      ) : null}
      <p className="text-lg font-semibold" style={{ color: 'var(--if-text)' }}>{title}</p>
      {description ? <p className="mt-2 max-w-md text-sm" style={{ color: 'var(--if-muted)' }}>{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
