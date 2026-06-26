'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { showBranding } from '@/lib/constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function resolveAssetUrl(path: string) {
  if (path.startsWith('data:') || path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

const TEMPLATE_COLORS: Record<string, string> = {
  modern: '#4F46E5',
  classic: '#1E293B',
  minimal: '#64748B',
  bold: '#7C3AED',
  professional: '#0F766E',
  creative: '#DB2777',
};

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

  const headerColor = useMemo(
    () => TEMPLATE_COLORS[invoice?.templateId || 'modern'] || TEMPLATE_COLORS.modern,
    [invoice?.templateId],
  );

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
    ctx.strokeStyle = '#0F172A';
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }
  if (!invoice) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-6 text-center">
        <p className="text-lg font-semibold text-slate-800">Invoice not found</p>
        <p className="text-sm text-slate-500">This link may have expired or the invoice is not available.</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 pb-28 md:pb-12">
      {paidBanner ? (
        <div className="sticky top-0 z-50 border-b border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-800">
          ✓ Thank you! Your payment was received.
        </div>
      ) : null}

      <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-300/30">
          <div className="relative overflow-hidden p-6 text-white md:p-10" style={{ background: `linear-gradient(135deg, ${headerColor}, ${headerColor}dd)` }}>
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
            {biz?.businessLogo ? <img src={resolveAssetUrl(biz.businessLogo)} alt="" className="mb-4 h-10 max-w-[160px] object-contain" /> : null}
            <p className="text-xs font-bold uppercase tracking-widest text-white/70">{invoice.documentType.replace('_', ' ')}</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">{invoice.documentNumber}</h1>
            <p className="mt-2 text-base text-white/90 sm:text-lg">{biz?.businessName || biz?.name}</p>
            {isPaid ? (
              <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold">✓ Paid in full</span>
            ) : (
              <span className="mt-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-bold">{statusLabel(invoice.status)}</span>
            )}
          </div>

          <div className="p-5 md:p-10">
            {error ? <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

            <div className="mb-6 grid gap-4 sm:grid-cols-2 sm:gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Bill to</p>
                <p className="mt-1 text-lg font-bold">{invoice.client.name}</p>
                {invoice.client.email ? <p className="text-sm text-slate-600">{invoice.client.email}</p> : null}
              </div>
              <div className="sm:text-right">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Due date</p>
                <p className="mt-1 font-semibold">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'On receipt'}</p>
                <a href={pdfUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-semibold text-indigo-600 hover:underline">
                  Download PDF ↓
                </a>
              </div>
            </div>

            {/* Mobile line items */}
            <div className="space-y-3 md:hidden">
              {invoice.lineItems.map((item: { id: string; description: string; quantity: number; total: number }) => (
                <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <p className="font-medium text-slate-900">{item.description}</p>
                  <div className="mt-2 flex justify-between text-sm text-slate-600">
                    <span>Qty {item.quantity}</span>
                    <span className="font-bold text-slate-900">{formatMoney(item.total, currency)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-100 md:block">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item: { id: string; description: string; quantity: number; total: number }) => (
                    <tr key={item.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium">{item.description}</td>
                      <td className="px-4 py-3 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatMoney(item.total, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 space-y-1 text-right">
              {depositDue != null ? <p className="text-sm text-slate-600">Deposit ({invoice.depositPercent}%): <strong>{formatMoney(depositDue, currency)}</strong></p> : null}
              {invoice.lateFeeAmount > 0 ? <p className="text-sm text-red-600">Late fee: <strong>{formatMoney(invoice.lateFeeAmount, currency)}</strong></p> : null}
              <p className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{formatMoney(invoice.total, currency)}</p>
              {canPay && dueNow < invoice.total ? (
                <p className="text-base font-semibold text-emerald-700 sm:text-lg">Due now: {formatMoney(dueNow, currency)}</p>
              ) : null}
            </div>

            {invoice.notes ? (
              <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">Notes</p>
                <p>{invoice.notes}</p>
              </div>
            ) : null}
            {invoice.terms ? (
              <div className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">Terms</p>
                <p>{invoice.terms}</p>
              </div>
            ) : null}

            {/* Desktop pay buttons */}
            {canPay ? (
              <div className="mt-8 hidden space-y-3 md:block">
                <button type="button" onClick={payStripe} disabled={paying} className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-200 hover:opacity-95 disabled:opacity-60">
                  {paying ? 'Loading…' : `Pay with card — ${formatMoney(dueNow, currency)}`}
                </button>
                <button type="button" onClick={payPayPal} disabled={paying} className="w-full rounded-2xl bg-[#0070BA] py-3.5 font-bold text-white hover:bg-[#005ea6] disabled:opacity-60">
                  Pay with PayPal
                </button>
              </div>
            ) : null}

            {invoice.documentType === 'ESTIMATE' && !signed && !invoice.clientSignature ? (
              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="mb-1 font-bold">Sign to approve this estimate</p>
                <p className="mb-3 text-sm text-slate-500">Draw your signature below with finger or mouse.</p>
                <div ref={canvasWrapRef} className="w-full">
                  <canvas
                    ref={canvasRef}
                    className="w-full cursor-crosshair rounded-xl border-2 border-dashed border-slate-300 bg-white touch-none"
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
                  <button type="button" onClick={clearSignature} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600">
                    Clear
                  </button>
                  <button type="button" onClick={submitSignature} disabled={signing} className="flex-[2] rounded-xl py-3 font-bold text-white" style={{ backgroundColor: headerColor }}>
                    {signing ? 'Submitting…' : 'Submit signature'}
                  </button>
                </div>
              </div>
            ) : null}

            {(signed || invoice.clientSignature) ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center font-bold text-emerald-800">
                ✓ Signed by client
              </div>
            ) : null}
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-center text-xs text-slate-400">
            {branding ? (
              <>Powered by <a href="/" className="font-semibold text-indigo-500 hover:underline">InvoiceFlow</a> · Secure client portal</>
            ) : (
              <>Secure client portal</>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sticky pay bar */}
      {canPay ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-4 backdrop-blur-md md:hidden" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <p className="mb-2 text-center text-xs font-semibold text-slate-500">Amount due: {formatMoney(dueNow, currency)}</p>
          <button type="button" onClick={payStripe} disabled={paying} className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 py-3.5 text-base font-bold text-white shadow-lg disabled:opacity-60">
            {paying ? 'Loading…' : 'Pay with card'}
          </button>
          <button type="button" onClick={payPayPal} disabled={paying} className="mt-2 w-full rounded-xl bg-[#0070BA] py-2.5 text-sm font-bold text-white disabled:opacity-60">
            Pay with PayPal
          </button>
        </div>
      ) : null}
    </div>
  );
}
