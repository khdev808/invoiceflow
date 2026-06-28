import Link from 'next/link';

export function PageHeader({
  title,
  subtitle,
  backHref,
  actions,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4 animate-fade-in">
      <div>
        {backHref ? (
          <Link href={backHref} className="mb-2 inline-block text-sm font-medium hover:underline" style={{ color: 'var(--if-accent-dark)' }}>
            ← Back
          </Link>
        ) : null}
        <h1 className="if-page-title">{title}</h1>
        {subtitle ? <p className="if-subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
