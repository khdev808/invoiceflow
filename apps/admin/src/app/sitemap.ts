import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://invoiceflow-admin.onrender.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/help',
    '/privacy',
    '/terms',
    '/app/login',
    '/app/register',
    '/alternatives/wave',
    '/alternatives/invoice-fly',
    '/alternatives/freshbooks',
    '/alternatives/invoice-simple',
    '/alternatives/zoho-invoice',
    '/alternatives/quickbooks',
    '/alternatives/xero',
    '/alternatives/paypal-invoicing',
    '/alternatives/harvest',
    '/alternatives/honeybook',
    '/es',
  ];

  return routes.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }));
}
