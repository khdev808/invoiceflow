'use client';

import { useEffect, useRef, useState } from 'react';
import { clientsApi, invoicesApi, productsApi, type Client, type LineItem, type Product } from '@/lib/appApi';
import { templates } from '@/lib/constants';
import { getLastClientId, saveLastClientId } from '@/lib/invoicePrefs';
import { Card } from '@/components/ui/Card';
import { LineItemsEditor } from '@/components/ui/LineItemsEditor';
import { useAuth } from '@/contexts/AuthContext';
import { useAppLocale } from '@/lib/i18n/AppLocaleContext';
import { formatCurrency } from '@/lib/format';

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

const STEPS = [
  { id: 1, label: 'Client & dates' },
  { id: 2, label: 'Line items' },
  { id: 3, label: 'Review & send' },
] as const;

function lineItemTotal(item: LineItem) {
  const sub = item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100);
  return sub * (1 + (item.taxRate || 0) / 100);
}

export function InvoiceForm({ initial, invoiceId, onSubmit, submitLabel, onClientSaved }: Props) {
  const { user } = useAuth();
  const { t } = useAppLocale();
  const currency = user?.currency || 'USD';
  const isPro = user?.plan === 'pro' || user?.plan === 'business';
  const formRef = useRef<HTMLFormElement>(null);

  const settings = user?.settings as { templateId?: string; defaultPaymentTerms?: number } | undefined;
  const defaultTermsDays = settings?.defaultPaymentTerms ?? 30;
  const defaultDueDate = new Date(Date.now() + defaultTermsDays * 86400000).toISOString().slice(0, 10);

  const [step, setStep] = useState(1);
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

  const selectedClient = clients.find((c) => c.id === form.clientId);
  const grandTotal = form.lineItems.reduce((sum, item) => sum + lineItemTotal(item), 0);

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
        if (step === 3) formRef.current?.requestSubmit();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [step]);

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

  const validateStep = (currentStep: number) => {
    if (currentStep === 1 && !form.clientId) {
      setError('Please select a client.');
      return false;
    }
    if (currentStep === 2 && !form.lineItems.some((item) => item.description.trim())) {
      setError('Add at least one line item with a description.');
      return false;
    }
    setError('');
    return true;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, 3));
  };

  const goBack = () => {
    setError('');
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 3) return;
    if (!validateStep(2)) {
      setStep(2);
      return;
    }
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
        <p className="text-xs" style={{ color: 'var(--if-muted)' }}>{t('keyboardTip')}</p>
      ) : null}

      {/* Step indicator */}
      <nav aria-label="Progress" className="flex items-center justify-center gap-2 sm:gap-4">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => { if (s.id < step) { setError(''); setStep(s.id); } }}
              disabled={s.id > step}
              className="flex items-center gap-2 disabled:cursor-default"
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition"
                style={{
                  background: step >= s.id ? 'var(--if-accent)' : 'var(--if-bg)',
                  color: step >= s.id ? '#fff' : 'var(--if-muted)',
                  border: step >= s.id ? 'none' : '1px solid var(--if-border)',
                }}
              >
                {s.id}
              </span>
              <span
                className="hidden text-sm font-medium sm:inline"
                style={{ color: step >= s.id ? 'var(--if-text)' : 'var(--if-muted)' }}
              >
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 ? (
              <div className="h-px w-6 sm:w-12" style={{ background: step > s.id ? 'var(--if-accent)' : 'var(--if-border)' }} />
            ) : null}
          </div>
        ))}
      </nav>

      {error ? (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--if-danger-soft)', color: 'var(--if-danger)' }}>{error}</div>
      ) : null}

      {/* Step 1: Client & dates */}
      {step === 1 ? (
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
      ) : null}

      {/* Step 2: Line items */}
      {step === 2 ? (
        <>
          {products.length > 0 ? (
            <Card>
              <p className="mb-3 text-sm font-semibold" style={{ color: 'var(--if-text)' }}>{t('quickAddCatalog')}</p>
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
        </>
      ) : null}

      {/* Step 3: Review & send */}
      {step === 3 ? (
        <>
          <Card>
            <p className="mb-4 text-sm font-semibold" style={{ color: 'var(--if-text)' }}>Summary</p>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--if-muted)' }}>Client</dt>
                <dd className="mt-0.5 font-medium">{selectedClient?.name || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--if-muted)' }}>Document</dt>
                <dd className="mt-0.5 font-medium">{form.documentType.replace('_', ' ')}</dd>
              </div>
              {form.documentType === 'INVOICE' ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--if-muted)' }}>{t('dueDate')}</dt>
                  <dd className="mt-0.5 font-medium">{form.dueDate ? new Date(form.dueDate).toLocaleDateString() : '—'}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--if-muted)' }}>Total</dt>
                <dd className="mt-0.5 font-display text-xl font-semibold">{formatCurrency(grandTotal, currency)}</dd>
              </div>
            </dl>
            <div className="mt-4 border-t pt-4" style={{ borderColor: 'var(--if-border)' }}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--if-muted)' }}>Line items ({form.lineItems.filter((i) => i.description.trim()).length})</p>
              <ul className="space-y-1 text-sm">
                {form.lineItems.filter((i) => i.description.trim()).map((item, idx) => (
                  <li key={idx} className="flex justify-between gap-4">
                    <span>{item.description}</span>
                    <span className="shrink-0 font-medium tabular-nums">{formatCurrency(lineItemTotal(item), currency)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Card>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="if-label">{t('template')}</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {templates.map((tpl) => {
                    const locked = tpl.premium && !isPro;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        disabled={locked}
                        onClick={() => setForm({ ...form, templateId: tpl.id })}
                        className={`rounded-xl border p-3 text-left text-sm transition ${
                          form.templateId === tpl.id ? 'ring-2' : ''
                        } ${locked ? 'opacity-50' : ''}`}
                        style={{
                          borderColor: form.templateId === tpl.id ? 'var(--if-accent)' : 'var(--if-border)',
                          background: form.templateId === tpl.id ? 'var(--if-accent-soft)' : 'var(--if-surface)',
                          boxShadow: form.templateId === tpl.id ? '0 0 0 2px rgba(201,162,39,0.2)' : undefined,
                        }}
                      >
                        <span className="mb-1 inline-block h-3 w-3 rounded-full" style={{ backgroundColor: tpl.color }} />
                        <p className="font-semibold">{tpl.name}</p>
                        {tpl.premium ? <p className="text-[10px]" style={{ color: 'var(--if-accent-dark)' }}>Pro</p> : null}
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
        </>
      ) : null}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        {step > 1 ? (
          <button type="button" onClick={goBack} className="if-btn-secondary">
            Back
          </button>
        ) : (
          <span />
        )}
        {step < 3 ? (
          <button type="button" onClick={goNext} className="if-btn-primary px-8">
            Next
          </button>
        ) : (
          <button type="submit" disabled={loading} className="if-btn-primary px-8 py-3">
            {loading ? t('saving') : submitLabel}
          </button>
        )}
      </div>
    </form>
  );
}
