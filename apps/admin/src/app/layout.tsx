import type { Metadata } from "next";
import { Instrument_Sans, Fraunces } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://invoiceflow-admin.onrender.com';

export const metadata: Metadata = {
  title: "InvoiceFlow — Your Invoice Ledger, For Life",
  description: "Create and send professional invoices with calm confidence. The permanent financial companion for freelancers and solo businesses.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: 'InvoiceFlow — Your Invoice Ledger, For Life',
    description: 'Calm, professional invoicing you can trust for decades.',
    type: 'website',
    siteName: 'InvoiceFlow',
    images: [{ url: '/og/default.png', width: 1200, height: 630, alt: 'InvoiceFlow' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InvoiceFlow — Your Invoice Ledger, For Life',
    description: 'Calm, professional invoicing you can trust for decades.',
    images: ['/og/default.png'],
  },
  keywords: ['invoice maker', 'invoice app', 'freelance invoice', 'professional invoicing', 'invoice ledger'],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
