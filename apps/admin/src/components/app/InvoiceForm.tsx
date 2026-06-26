'use client';

import { useEffect, useRef, useState } from 'react';
import { clientsApi, invoicesApi, productsApi, type Client, type LineItem, type Product } from '@/lib/appApi';
import { templates } from '@/lib/constants';
import { getLastClientId, saveLastClientId } from '@/lib/invoicePrefs';
import { Card } from '@/components/ui/Card';
import { LineItemsEditor } from '@/components/ui/LineItemsEditor';
import { useAuth } from '@/contexts/AuthContext';
import { useAppLocale } from '@/lib/i18n/AppLocaleContext';

export type InvoiceFormValues = {
  clientId: string;
  documentType: string;
  dueDate: string;
  notes: string;
  terms: string;
  templateId: string;
  depositPercent: string;
  depositAmount: string;
  recurringRule: string;
  linkedInvoiceId: string;
  lineItems: LineItem[];
};

type Props = {
  initial?: Partial<InvoiceFormValues>;
  invoiceId?: string;
  onSubmit: (values: InvoiceFormValues) => Promise<void>;
  submitLabel: string;
  onClientSaved?: (clientId: string) => void;
};

export function InvoiceForm({ initial, invoiceId, onSubmit, submitLabel, onClientSaved }: Props) {
  const { user } = useAuth();
  const { t } = useAppLocale();
  const currency = user?.currency || 'USD';
  const isPro = user?.plan === 'pro' || user?.plan === 'business';
  const formRef = useRef<HTMLFormElement>(null);

  const settings = user?.settings as { templateId?: string; defaultPaymentTerms?: number } | undefined;
  const defaultTermsDays = settings?.defaultPaymentTerms ?? 30;
  const defaultDueDate = new Date(Date.now() + defaultTermsDays * 86400000).toISOString().slice(0, 10);

  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<{ id: string; documentNumber: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<InvoiceFormValues>({
    clientId: '',
    documentType: 'INVOICE',
    dueDate: defaultDueDate,
    notes: '',
    terms: 'Payment due within 30 days.',
    templateId: settings?.templateId || 'modern',
    depositPercent: '',
    depositAmount: '',
    recurringRule: '',
    linkedInvoiceId: '',
    lineItems: [{ description: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0 }],
    ...initial,
  });

  useEffect(() => {
    const docType = form.documentType;
    Promise.all([
      clientsApi.list(),
      productsApi.list(),
      docType === 'CREDIT_NOTE' ? invoicesApi.list({ type: 'INVOICE' }) : Promise.resolve([]),
    ]).then(([c, p, inv]) => {
      setClients(c);
      setProducts(p);
      setInvoices(inv as { id: string; documentNumber: string }[]);
      if (!form.clientId && c.length) {
        const lastId = getLastClientId();
        const preferred = lastId && c.some((x) => x.id === lastId) ? lastId : c[0].id;
        setForm((f) => ({ ...f, clientId: preferred }));
      }
    });
    if (typeof window !== 'undefined') {
      const raw = sessionStorage.getItem('prefilledLineItems');
      if (raw) {
        try {
          const items = JSON.parse(raw) as LineItem[];
          if (items.length) setForm((f) => ({ ...f, lineItems: items }));
        } catch { /* ignore */ }
        sessionStorage.removeItem('prefilledLineItems');
      }
    }
  }, [form.documentType]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const addProduct = (product: Product) => {
    setForm((f) => ({
      ...f,
      lineItems: [
        ...f.lineItems,
        {
          description: product.name,
          quantity: 1,
          unitPrice: product.unitPrice,
          taxRate: product.taxRate || 0,
          discount: 0,
        },
      ],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSubmit(form);
      if (form.clientId) {
        saveLastClientId(form.clientId);
        onClientSaved?.(form.clientId);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      {!invoiceId ? (
        <p className="text-xs text-slate-500">{t('keyboardTip')}</p>
      ) : null}
      {error ? <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="if-label">{t('docType')}</label>
            <select
              value={form.documentType}
              onChange={(e) => setForm({ ...form, documentType: e.target.value })}
              className="if-input"
              disabled={!!invoiceId}
            >
              <option value="INVOICE">{t('docInvoice')}</option>
              <option value="ESTIMATE">{t('docEstimate')}</option>
              <option value="CREDIT_NOTE">{t('docCreditNote')}</option>
            </select>
          </div>
          <div>
            <label className="if-label">{t('client')}</label>
            <select
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              className="if-input"
              required
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          {form.documentType === 'INVOICE' ? (
            <div>
              <label className="if-label">{t('dueDate')}</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="if-input" />
            </div>
          ) : null}
          {form.documentType === 'CREDIT_NOTE' ? (
            <div>
              <label className="if-label">{t('linkedInvoice')}</label>
              <select value={form.linkedInvoiceId} onChange={(e) => setForm({ ...form, linkedInvoiceId: e.target.value })} className="if-input">
                <option value="">{t('selectInvoice')}</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>{inv.documentNumber}</option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      </Card>

      {products.length > 0 ? (
        <Card>
          <p className="mb-3 text-sm font-semibold text-slate-700">{t('quickAddCatalog')}</p>
          <div className="flex flex-wrap gap-2">
            {products.map((p) => (
              <button key={p.id} type="button" onClick={() => addProduct(p)} className="if-btn-secondary py-1.5 text-xs">
                + {p.name}
              </button>
            ))}
          </div>
        </Card>
      ) : null}

      <Card>
        <LineItemsEditor items={form.lineItems} onChange={(lineItems) => setForm({ ...form, lineItems })} currency={currency} />
      </Card>

      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="if-label">{t('template')}</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {templates.map((t) => {
                const locked = t.premium && !isPro;
                return (
                  <button
                    key={t.id}
                    type="button"
                    disabled={locked}
                    onClick={() => setForm({ ...form, templateId: t.id })}
                    className={`rounded-xl border p-3 text-left text-sm transition ${
                      form.templateId === t.id ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200' : 'border-slate-200 hover:border-indigo-200'
                    } ${locked ? 'opacity-50' : ''}`}
                  >
                    <span className="mb-1 inline-block h-3 w-3 rounded-full" style={{ backgroundColor: t.color }} />
                    <p className="font-semibold">{t.name}</p>
                    {t.premium ? <p className="text-[10px] text-violet-600">Pro</p> : null}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="if-label">{t('depositPercent')}</label>
              <input type="number" min={0} max={100} value={form.depositPercent} onChange={(e) => setForm({ ...form, depositPercent: e.target.value })} className="if-input" placeholder="50" />
            </div>
            <div>
              <label className="if-label">{t('flatDeposit')}</label>
              <input type="number" min={0} step={0.01} value={form.depositAmount} onChange={(e) => setForm({ ...form, depositAmount: e.target.value })} className="if-input" />
            </div>
            {!invoiceId ? (
              <div>
                <label className="if-label">{t('recurringOptional')}</label>
                <select value={form.recurringRule} onChange={(e) => setForm({ ...form, recurringRule: e.target.value })} className="if-input">
                  <option value="">{t('recurringOneTime')}</option>
                  <option value="weekly">{t('recurringWeekly')}</option>
                  <option value="monthly">{t('recurringMonthly')}</option>
                  <option value="quarterly">{t('recurringQuarterly')}</option>
                  <option value="yearly">{t('recurringYearly')}</option>
                </select>
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <label className="if-label">{t('notes')}</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} className="if-input" />
        </Card>
        <Card>
          <label className="if-label">{t('terms')}</label>
          <textarea value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} rows={4} className="if-input" />
        </Card>
      </div>

      <button type="submit" disabled={loading} className="if-btn-primary px-8 py-3">
        {loading ? t('saving') : submitLabel}
      </button>
    </form>
  );
}
