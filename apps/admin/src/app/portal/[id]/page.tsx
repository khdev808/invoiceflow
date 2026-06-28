'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Lock, Check } from 'lucide-react';
import { showBranding } from '@/lib/constants';
import { PortalStripePay } from '@/components/portal/PortalStripePay';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function resolveAssetUrl(path: string) {
  if (path.startsWith('data:') || path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

function formatMoney(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    SENT: 'Awaiting payment',
    VIEWED: 'Opened by client',
    PAID: 'Paid',
    OVERDUE: 'Overdue',
    DRAFT: 'Draft',
  };
  return map[status] || status.replace('_', ' ');
}

export default function ClientPortalPage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<any>(null);
  const [payAmount, setPayAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [paidBanner, setPaidBanner] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);

  const branding = showBranding(invoice?.user?.plan);

  useEffect(() => {
    fetch(`${API_URL}/invoices/public/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then((data) => {
        if (data.statusCode) throw new Error('not found');
        setInvoice(data);
        fetch(`${API_URL}/invoices/public/${id}/view`, { method: 'PATCH' });
        return fetch(`${API_URL}/payments/public/link/${id}`).then((r) => r.json());
      })
      .then((link) => { if (link?.amount) setPayAmount(link.amount); })
      .catch(() => setInvoice(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (new URLSearchParams(window.location.search).get('paid') === '1') {
      setPaidBanner(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = canvasWrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = window.devicePixelRatio || 1;
    const width = wrap.clientWidth;
    const height = 140;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [invoice]);

  const getPos = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    drawing.current = true;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#0F1419';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  };

  const stopDraw = () => { drawing.current = false; };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const submitSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSigning(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/invoices/public/${id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature: canvas.toDataURL(), signerName: invoice?.client?.name }),
      });
      if (!res.ok) throw new Error('Signature failed');
      setSigned(true);
    } catch {
      setError('Could not submit signature. Please try again.');
    } finally {
      setSigning(false);
    }
  };

  const payStripe = async () => {
    setPaying(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/payments/public/link/${id}`);
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.alreadyPaid ? 'This invoice is already paid.' : (data.message || 'Card payments are not available.'));
    } finally { setPaying(false); }
  };

  const payPayPal = async () => {
    setPaying(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/payments/public/paypal/${id}`);
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.alreadyPaid ? 'This invoice is already paid.' : (data.message || 'PayPal is not available.'));
    } finally { setPaying(false); }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--if-bg)' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--if-accent)', borderTopColor: 'transparent' }} />
      </div>
    );
  }
  if (!invoice) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center" style={{ background: 'var(--if-bg)' }}>
        <p className="text-lg font-semibold" style={{ color: 'var(--if-text)' }}>Invoice not found</p>
        <p className="text-sm" style={{ color: 'var(--if-muted)' }}>This link may have expired or the invoice is not available.</p>
      </div>
    );
  }

  const biz = invoice.user;
  const currency = invoice.currency || 'USD';
  const dueNow = payAmount ?? invoice.total;
  const depositDue = invoice.depositPercent && !invoice.depositPaid
    ? invoice.total * invoice.depositPercent / 100
    : null;
  const isPaid = invoice.status === 'PAID';
  const canPay = !isPaid && invoice.documentType === 'INVOICE';
  const pdfUrl = `${API_URL}/invoices/public/${id}/pdf`;

  return (
    <div className="min-h-screen pb-28 md:pb-12" style={{ background: 'var(--if-bg)' }}>
      {/* Trust header */}
      <div className="flex items-center justify-center gap-2 border-b py-3 text-xs font-medium tracking-wide" style={{ borderColor: 'var(--if-border)', color: 'var(--if-muted)', background: 'var(--if-surface)' }}>
        <Lock className="h-3.5 w-3.5" strokeWidth={2} />
        Secured by InvoiceFlow
      </div>

      {paidBanner ? (
        <div className="border-b px-4 py-3 text-center text-sm font-semibold" style={{ borderColor: 'var(--if-border)', background: 'var(--if-success-soft)', color: 'var(--if-success)' }}>
          <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4" /> Thank you! Your payment was received.</span>
        </div>
      ) : null}

      <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
        <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--if-border)', background: 'var(--if-surface)', boxShadow: 'var(--if-shadow)' }}>
          {/* Invoice header */}
          <div className="border-b px-6 py-8 md:px-10" style={{ borderColor: 'var(--if-border)' }}>
            {biz?.businessLogo ? (
              <img src={resolveAssetUrl(biz.businessLogo)} alt="" className="mb-5 h-10 max-w-[160px] object-contain" />
            ) : null}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--if-muted)' }}>
                  {invoice.documentType.replace('_', ' ')}
                </p>
                <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight md:text-4xl" style={{ color: 'var(--if-text)' }}>
                  {invoice.documentNumber}
                </h1>
                <p className="mt-2 text-base" style={{ color: 'var(--if-muted)' }}>{biz?.businessName || biz?.name}</p>
              </div>
              <div className="text-right">
                {isPaid ? (
                  <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'var(--if-success-soft)', color: 'var(--if-success)' }}>
                    <Check className="h-3 w-3" /> Paid in full
                  </span>
                ) : (
                  <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'var(--if-accent-soft)', color: 'var(--if-accent-dark)' }}>
                    {statusLabel(invoice.status)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-8 md:px-10">
            {error ? (
              <div className="mb-6 rounded-lg px-4 py-3 text-sm" style={{ background: 'var(--if-danger-soft)', color: 'var(--if-danger)' }}>{error}</div>
            ) : null}

            <div className="mb-8 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--if-muted)' }}>Bill to</p>
                <p className="mt-1 text-lg font-semibold" style={{ color: 'var(--if-text)' }}>{invoice.client.name}</p>
                {invoice.client.email ? <p className="text-sm" style={{ color: 'var(--if-muted)' }}>{invoice.client.email}</p> : null}
              </div>
              <div className="sm:text-right">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--if-muted)' }}>Due date</p>
                <p className="mt-1 font-medium" style={{ color: 'var(--if-text)' }}>
                  {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'On receipt'}
                </p>
                <a href={pdfUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-medium hover:underline" style={{ color: 'var(--if-accent-dark)' }}>
                  Download PDF ↓
                </a>
              </div>
            </div>

            {/* Ledger-style line items table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--if-border)' }}>
                    <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--if-muted)' }}>Description</th>
                    <th className="pb-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--if-muted)' }}>Qty</th>
                    <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--if-muted)' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item: { id: string; description: string; quantity: number; total: number }) => (
                    <tr key={item.id} className="border-b" style={{ borderColor: 'var(--if-border)' }}>
                      <td className="py-4 pr-4 font-medium" style={{ color: 'var(--if-text)' }}>{item.description}</td>
                      <td className="py-4 text-center tabular-nums" style={{ color: 'var(--if-muted)' }}>{item.quantity}</td>
                      <td className="py-4 text-right font-semibold tabular-nums" style={{ color: 'var(--if-text)' }}>{formatMoney(item.total, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-6 space-y-1 border-t pt-6 text-right" style={{ borderColor: 'var(--if-border)' }}>
              {depositDue != null ? (
                <p className="text-sm" style={{ color: 'var(--if-muted)' }}>
                  Deposit ({invoice.depositPercent}%): <strong style={{ color: 'var(--if-text)' }}>{formatMoney(depositDue, currency)}</strong>
                </p>
              ) : null}
              {invoice.lateFeeAmount > 0 ? (
                <p className="text-sm" style={{ color: 'var(--if-danger)' }}>
                  Late fee: <strong>{formatMoney(invoice.lateFeeAmount, currency)}</strong>
                </p>
              ) : null}
              <p className="font-display text-2xl font-semibold sm:text-3xl" style={{ color: 'var(--if-text)' }}>
                {formatMoney(invoice.total, currency)}
              </p>
              {canPay && dueNow < invoice.total ? (
                <p className="text-base font-semibold" style={{ color: 'var(--if-success)' }}>
                  Due now: {formatMoney(dueNow, currency)}
                </p>
              ) : null}
            </div>

            {invoice.notes ? (
              <div className="mt-8 border-t pt-6 text-sm" style={{ borderColor: 'var(--if-border)', color: 'var(--if-muted)' }}>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide">Notes</p>
                <p>{invoice.notes}</p>
              </div>
            ) : null}
            {invoice.terms ? (
              <div className="mt-4 text-sm" style={{ color: 'var(--if-muted)' }}>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide">Terms</p>
                <p>{invoice.terms}</p>
              </div>
            ) : null}

            {canPay ? (
              <PortalStripePay invoiceId={id} onPaid={() => setPaidBanner(true)} />
            ) : null}

            {/* Desktop pay buttons (fallback / PayPal) */}
            {canPay ? (
              <div className="mt-8 hidden space-y-3 md:block">
                <button
                  type="button"
                  onClick={payStripe}
                  disabled={paying}
                  className="w-full rounded-lg py-4 text-lg font-semibold text-white transition disabled:opacity-60"
                  style={{ background: 'var(--if-accent)' }}
                >
                  {paying ? 'Loading…' : `Pay with card — ${formatMoney(dueNow, currency)}`}
                </button>
                <button
                  type="button"
                  onClick={payPayPal}
                  disabled={paying}
                  className="w-full rounded-lg border py-3.5 text-sm font-semibold transition disabled:opacity-60"
                  style={{ borderColor: 'var(--if-border)', color: 'var(--if-text)' }}
                >
                  Pay with PayPal
                </button>
              </div>
            ) : null}

            {invoice.documentType === 'ESTIMATE' && !signed && !invoice.clientSignature ? (
              <div className="mt-8 rounded-xl border p-5" style={{ borderColor: 'var(--if-border)', background: 'var(--if-bg)' }}>
                <p className="mb-1 font-semibold" style={{ color: 'var(--if-text)' }}>Sign to approve this estimate</p>
                <p className="mb-3 text-sm" style={{ color: 'var(--if-muted)' }}>Draw your signature below with finger or mouse.</p>
                <div ref={canvasWrapRef} className="w-full">
                  <canvas
                    ref={canvasRef}
                    className="w-full cursor-crosshair rounded-lg border-2 border-dashed bg-white touch-none"
                    style={{ borderColor: 'var(--if-border)' }}
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={stopDraw}
                  />
                </div>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={clearSignature} className="flex-1 rounded-lg border py-3 text-sm font-semibold" style={{ borderColor: 'var(--if-border)', color: 'var(--if-muted)' }}>
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={submitSignature}
                    disabled={signing}
                    className="flex-[2] rounded-lg py-3 font-semibold text-white disabled:opacity-60"
                    style={{ background: 'var(--if-accent)' }}
                  >
                    {signing ? 'Submitting…' : 'Submit signature'}
                  </button>
                </div>
              </div>
            ) : null}

            {(signed || invoice.clientSignature) ? (
              <div className="mt-6 rounded-xl border p-5 text-center font-semibold" style={{ borderColor: 'var(--if-border)', background: 'var(--if-success-soft)', color: 'var(--if-success)' }}>
                <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4" /> Signed by client</span>
              </div>
            ) : null}
          </div>

          {branding ? (
            <div className="border-t px-6 py-4 text-center text-xs" style={{ borderColor: 'var(--if-border)', color: 'var(--if-muted)' }}>
              Powered by <a href="/" className="font-semibold hover:underline" style={{ color: 'var(--if-accent-dark)' }}>InvoiceFlow</a>
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile sticky pay bar */}
      {canPay ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t p-4 backdrop-blur-md md:hidden" style={{ borderColor: 'var(--if-border)', background: 'rgba(255,255,255,0.95)', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <p className="mb-2 text-center text-xs font-semibold" style={{ color: 'var(--if-muted)' }}>Amount due: {formatMoney(dueNow, currency)}</p>
          <button
            type="button"
            onClick={payStripe}
            disabled={paying}
            className="w-full rounded-lg py-3.5 text-base font-semibold text-white disabled:opacity-60"
            style={{ background: 'var(--if-accent)' }}
          >
            {paying ? 'Loading…' : 'Pay with card'}
          </button>
          <button
            type="button"
            onClick={payPayPal}
            disabled={paying}
            className="mt-2 w-full rounded-lg border py-2.5 text-sm font-semibold disabled:opacity-60"
            style={{ borderColor: 'var(--if-border)', color: 'var(--if-text)' }}
          >
            Pay with PayPal
          </button>
        </div>
      ) : null}
    </div>
  );
}
