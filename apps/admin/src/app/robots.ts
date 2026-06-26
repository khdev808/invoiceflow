import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://invoiceflow-admin.onrender.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/help', '/privacy', '/terms', '/alternatives/'],
      disallow: ['/admin', '/app/', '/portal/'],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
