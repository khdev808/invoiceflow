export function Card({
  children,
  className = '',
  padding = true,
}: {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}) {
  return (
    <div className={`if-card ${padding ? 'p-6' : ''} ${className}`}>{children}</div>
  );
}
