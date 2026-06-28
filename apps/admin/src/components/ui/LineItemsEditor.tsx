'use client';

import { type LineItem } from '@/lib/appApi';
import { calcLineTotal, formatCurrency } from '@/lib/format';
import { useAppLocale } from '@/lib/i18n/AppLocaleContext';

export function LineItemsEditor({
  items,
  onChange,
  currency = 'USD',
}: {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  currency?: string;
}) {
  const { t } = useAppLocale();

  const update = (index: number, patch: Partial<LineItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const add = () => onChange([...items, { description: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0 }]);
  const remove = (index: number) => {
    if (items.length <= 1) return;
    onChange(items.filter((_, i) => i !== index));
  };

  const total = items.reduce((s, item) => s + calcLineTotal(item), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">{t('lineItems')}</h3>
        <button type="button" onClick={add} className="text-sm font-semibold hover:underline" style={{ color: 'var(--if-accent-dark)' }}>
          + {t('addLine')}
        </button>
      </div>
      {items.map((line, i) => (
        <div key={i} className="grid gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3 md:grid-cols-12">
          <input
            placeholder={t('description')}
            value={line.description}
            onChange={(e) => update(i, { description: e.target.value })}
            className="if-input md:col-span-4"
            required
          />
          <input
            type="number"
            min={0}
            step={0.01}
            placeholder={t('qty')}
            value={line.quantity}
            onChange={(e) => update(i, { quantity: Number(e.target.value) })}
            className="if-input md:col-span-2"
          />
          <input
            type="number"
            min={0}
            step={0.01}
            placeholder={t('price')}
            value={line.unitPrice}
            onChange={(e) => update(i, { unitPrice: Number(e.target.value) })}
            className="if-input md:col-span-2"
          />
          <input
            type="number"
            min={0}
            step={0.01}
            placeholder={t('taxPercent')}
            value={line.taxRate ?? 0}
            onChange={(e) => update(i, { taxRate: Number(e.target.value) })}
            className="if-input md:col-span-2"
          />
          <div className="flex items-center justify-between md:col-span-2">
            <span className="text-sm font-semibold text-slate-800">{formatCurrency(calcLineTotal(line), currency)}</span>
            <button type="button" onClick={() => remove(i)} className="text-xs font-medium text-red-600 hover:underline">
              {t('removeLine')}
            </button>
          </div>
        </div>
      ))}
      <p className="text-right text-lg font-bold" style={{ color: 'var(--if-accent-dark)' }}>{t('lineTotal')}: {formatCurrency(total, currency)}</p>
    </div>
  );
}
