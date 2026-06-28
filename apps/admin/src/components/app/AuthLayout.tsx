import Image from 'next/image';
import { BrandLogo } from '@/components/marketing/BrandLogo';

type AuthLayoutProps = {
  children: React.ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--if-bg)' }}>
      <aside
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden px-12 py-10 lg:flex"
        style={{ background: 'var(--if-bg)' }}
      >
        <BrandLogo size="md" priority />

        <div className="flex flex-1 flex-col justify-center">
          <h1
            className="font-display text-4xl font-semibold leading-tight tracking-tight xl:text-5xl"
            style={{ color: 'var(--if-text)' }}
          >
            Your invoice ledger, for life
          </h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed" style={{ color: 'var(--if-muted)' }}>
            Calm, professional invoicing — clear records, steady cash flow, and invoices that look as
            polished as your work.
          </p>
          <div className="mt-10">
            <Image
              src="/illustrations/onboarding-1.svg"
              alt=""
              width={480}
              height={360}
              className="h-auto w-full max-w-md"
              priority
            />
          </div>
        </div>

        <p className="text-sm" style={{ color: 'var(--if-muted)' }}>
          Trusted by freelancers and small businesses worldwide.
        </p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="if-card w-full max-w-md animate-fade-in p-8">{children}</div>
      </main>
    </div>
  );
}
