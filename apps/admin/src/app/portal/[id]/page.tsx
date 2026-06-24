'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ClientPortalPage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    fetch(`${API_URL}/invoices/public/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setInvoice(data);
        fetch(`${API_URL}/invoices/public/${id}/view`, { method: 'PATCH' });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDraw = () => { drawing.current = false; };

  const submitSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSigning(true);
    const signature = canvas.toDataURL();
    await fetch(`${API_URL}/invoices/public/${id}/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signature, signerName: invoice?.client?.name }),
    });
    setSigned(true);
    setSigning(false);
  };

  const payNow = async () => {
    const res = await fetch(`${API_URL}/payments/link/${id}`, { method: 'POST', headers: { Authorization: 'Bearer ' } });
    // Public pay - use invoice payment link if exists
    if (invoice?.paymentLink) window.open(invoice.paymentLink, '_blank');
    else alert('Payment link will be sent by the business owner.');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading invoice...</div>;
  if (!invoice) return <div className="min-h-screen flex items-center justify-center">Invoice not found</div>;

  const biz = invoice.user;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-blue-600 text-white p-8">
          <p className="text-blue-200 text-sm uppercase tracking-wide">{invoice.documentType}</p>
          <h1 className="text-3xl font-bold mt-1">{invoice.documentNumber}</h1>
          <p className="mt-2 text-blue-100">{biz?.businessName || biz?.name}</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
            <div><p className="text-slate-500">Bill To</p><p className="font-semibold">{invoice.client.name}</p>{invoice.client.email && <p className="text-slate-600">{invoice.client.email}</p>}</div>
            <div className="text-right"><p className="text-slate-500">Due Date</p><p className="font-semibold">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'On receipt'}</p><p className="text-slate-500 mt-2">Status</p><span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">{invoice.status}</span></div>
          </div>

          <table className="w-full mb-6">
            <thead><tr className="border-b text-left text-sm text-slate-500"><th className="pb-2">Description</th><th className="pb-2 text-center">Qty</th><th className="pb-2 text-right">Price</th><th className="pb-2 text-right">Total</th></tr></thead>
            <tbody>
              {invoice.lineItems.map((item: any) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-3">{item.description}</td>
                  <td className="py-3 text-center">{item.quantity}</td>
                  <td className="py-3 text-right">${item.unitPrice.toFixed(2)}</td>
                  <td className="py-3 text-right font-semibold">${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-right space-y-1 mb-8">
            {invoice.depositPercent > 0 && <p className="text-slate-600">Deposit ({invoice.depositPercent}%): <strong>${(invoice.total * invoice.depositPercent / 100).toFixed(2)}</strong></p>}
            {invoice.lateFeeAmount > 0 && <p className="text-red-600">Late Fee: <strong>${invoice.lateFeeAmount.toFixed(2)}</strong></p>}
            <p className="text-3xl font-bold text-slate-900">Total: ${invoice.total.toFixed(2)}</p>
          </div>

          {invoice.status !== 'PAID' && (
            <button onClick={payNow} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg mb-6 hover:bg-green-700">
              Pay Now — ${invoice.total.toFixed(2)}
            </button>
          )}

          {invoice.documentType === 'ESTIMATE' && !signed && !invoice.clientSignature && (
            <div className="border rounded-xl p-4">
              <p className="font-semibold mb-3">Sign to approve this estimate</p>
              <canvas ref={canvasRef} width={500} height={120} className="border rounded-lg w-full cursor-crosshair bg-slate-50"
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw} />
              <button onClick={submitSignature} disabled={signing} className="mt-3 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold">
                {signing ? 'Submitting...' : 'Submit Signature'}
              </button>
            </div>
          )}

          {(signed || invoice.clientSignature) && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800 font-semibold text-center">
              ✓ Signed by client
            </div>
          )}
        </div>

        <div className="bg-slate-50 px-8 py-4 text-center text-xs text-slate-400">
          Powered by InvoiceFlow • Secure Client Portal
        </div>
      </div>
    </div>
  );
}
