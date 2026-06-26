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

export default function ClientPortalPage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<any>(null);
  const [payAmount, setPayAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('paid') === '1') {
      alert('Thank you! Your payment was received.');
    }
  }, []);

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
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDraw = () => { drawing.current = false; };

  const submitSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSigning(true);
    await fetch(`${API_URL}/invoices/public/${id}/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signature: canvas.toDataURL(), signerName: invoice?.client?.name }),
    });
    setSigned(true);
    setSigning(false);
  };

  const payStripe = async () => {
    setPaying(true);
    try {
      const res = await fetch(`${API_URL}/payments/public/link/${id}`);
      const data = await res.json();
      if (data.url) window.open(data.url, '_blank');
      else alert(data.alreadyPaid ? 'Already paid.' : (data.message || 'Card payments are not configured yet.'));
    } finally { setPaying(false); }
  };

  const payPayPal = async () => {
    setPaying(true);
    try {
      const res = await fetch(`${API_URL}/payments/public/paypal/${id}`);
      const data = await res.json();
      if (data.url) window.open(data.url, '_blank');
      else alert(data.alreadyPaid ? 'Already paid.' : (data.message || 'PayPal is not configured yet.'));
    } finally { setPaying(false); }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }
  if (!invoice) return <div className="flex min-h-screen items-center justify-center">Invoice not found</div>;

  const biz = invoice.user;
  const currency = invoice.currency || 'USD';
  const dueNow = payAmount ?? invoice.total;
  const depositDue = invoice.depositPercent && !invoice.depositPaid
    ? invoice.total * invoice.depositPercent / 100
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-8 md:py-12">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-300/30">
        <div className="relative overflow-hidden p-8 text-white md:p-10" style={{ background: `linear-gradient(135deg, ${headerColor}, ${headerColor}dd)` }}>
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          {biz?.businessLogo ? <img src={resolveAssetUrl(biz.businessLogo)} alt="" className="mb-4 h-10 object-contain" /> : null}
          <p className="text-xs font-bold uppercase tracking-widest text-white/70">{invoice.documentType.replace('_', ' ')}</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">{invoice.documentNumber}</h1>
          <p className="mt-2 text-lg text-white/90">{biz?.businessName || biz?.name}</p>
        </div>

        <div className="p-6 md:p-10">
          <div className="mb-8 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Bill to</p>
              <p className="mt-1 text-lg font-bold">{invoice.client.name}</p>
              {invoice.client.email ? <p className="text-slate-600">{invoice.client.email}</p> : null}
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Due date</p>
              <p className="mt-1 font-semibold">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'On receipt'}</p>
              <span className="mt-2 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">{invoice.status}</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-100">
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
            {depositDue != null ? <p className="text-slate-600">Deposit ({invoice.depositPercent}%): <strong>{formatMoney(depositDue, currency)}</strong></p> : null}
            {invoice.lateFeeAmount > 0 ? <p className="text-red-600">Late fee: <strong>{formatMoney(invoice.lateFeeAmount, currency)}</strong></p> : null}
            <p className="text-3xl font-extrabold text-slate-900">{formatMoney(invoice.total, currency)}</p>
            {invoice.status !== 'PAID' && dueNow < invoice.total ? (
              <p className="text-lg font-semibold text-emerald-700">Due now: {formatMoney(dueNow, currency)}</p>
            ) : null}
          </div>

          {invoice.status !== 'PAID' && (
            <div className="mt-8 space-y-3">
              <button onClick={payStripe} disabled={paying} className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-200 hover:opacity-95 disabled:opacity-60">
                {paying ? 'Loading…' : `Pay with card — ${formatMoney(dueNow, currency)}`}
              </button>
              <button onClick={payPayPal} disabled={paying} className="w-full rounded-2xl bg-[#0070BA] py-3.5 font-bold text-white hover:bg-[#005ea6] disabled:opacity-60">
                Pay with PayPal
              </button>
            </div>
          )}

          {invoice.documentType === 'ESTIMATE' && !signed && !invoice.clientSignature && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="mb-3 font-bold">Sign to approve this estimate</p>
              <canvas
                ref={canvasRef}
                width={560}
                height={140}
                className="w-full cursor-crosshair rounded-xl border-2 border-dashed border-slate-300 bg-white touch-none"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
              />
              <button onClick={submitSignature} disabled={signing} className="mt-3 w-full rounded-xl py-3.5 font-bold text-white" style={{ backgroundColor: headerColor }}>
                {signing ? 'Submitting…' : 'Submit signature'}
              </button>
            </div>
          )}

          {(signed || invoice.clientSignature) && (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center font-bold text-emerald-800">
              ✓ Signed by client
            </div>
          )}
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
  );
}
