'use client';

type Point = { period: string; count: number };

type Props = {
  title: string;
  subtitle?: string;
  data: Point[];
  variant?: 'users' | 'invoices';
};

export function GrowthChart({ title, subtitle, data, variant = 'users' }: Props) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const barColor = variant === 'users' ? '#4F46E5' : '#059669';

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-8 text-center text-sm text-slate-500">No data yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-900">
            {data.reduce((sum, d) => sum + d.count, 0)}
          </p>
          <p className="text-xs text-slate-500">total in range</p>
        </div>
      </div>

      <div className="flex h-44 items-end gap-1.5 border-b border-slate-100 pb-2">
        {data.map((point) => {
          const height = Math.max(8, (point.count / max) * 100);
          const label =
            point.period.length > 7
              ? point.period.slice(5)
              : point.period.slice(2);
          return (
            <div key={point.period} className="group flex flex-1 flex-col items-center gap-2">
              <div className="relative flex h-36 w-full items-end justify-center">
                <div
                  className="w-full max-w-[28px] rounded-t-md transition-opacity group-hover:opacity-80"
                  style={{ height: `${height}%`, backgroundColor: barColor }}
                  title={`${point.period}: ${point.count}`}
                />
                <span className="pointer-events-none absolute -top-6 hidden rounded bg-slate-900 px-2 py-0.5 text-[10px] text-white group-hover:block">
                  {point.count}
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-400">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
