import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InvoiceFlow — Free Invoice Maker & Estimate App",
  description: "Create and send professional invoices in under 60 seconds. Free invoice maker for freelancers. Stripe, PayPal, client portal, mobile apps.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://invoiceflow-admin.onrender.com'),
  openGraph: {
    title: 'InvoiceFlow — Free Invoice Maker',
    description: 'The fastest way to invoice and get paid. Free plan with 25 invoices/month.',
    type: 'website',
    siteName: 'InvoiceFlow',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InvoiceFlow — Free Invoice Maker',
    description: 'Invoice and get paid in under a minute.',
  },
  keywords: ['free invoice', 'invoice maker', 'invoice app', 'freelance invoice', 'estimate app', 'invoice template'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
