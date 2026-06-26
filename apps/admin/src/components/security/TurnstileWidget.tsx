'use client';

import { useEffect, useRef, useCallback } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback'?: () => void;
        },
      ) => string;
      reset: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

type Props = {
  onVerify: (token: string) => void;
  onExpire?: () => void;
};

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function isTurnstileEnabled() {
  return Boolean(SITE_KEY && !SITE_KEY.includes('placeholder'));
}

export function TurnstileWidget({ onVerify, onExpire }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || !SITE_KEY) return;
    if (widgetIdRef.current) {
      window.turnstile.reset(widgetIdRef.current);
      return;
    }
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY,
      callback: onVerify,
      'expired-callback': onExpire,
    });
  }, [onVerify, onExpire]);

  useEffect(() => {
    if (!isTurnstileEnabled()) return;

    if (window.turnstile) {
      renderWidget();
      return;
    }

    window.onTurnstileLoad = renderWidget;
    const existing = document.querySelector('script[data-turnstile]');
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
      script.async = true;
      script.defer = true;
      script.setAttribute('data-turnstile', '1');
      document.head.appendChild(script);
    }

    return () => {
      window.onTurnstileLoad = undefined;
    };
  }, [renderWidget]);

  if (!isTurnstileEnabled()) {
    return (
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
        Human verification is disabled in this environment.
      </p>
    );
  }

  return <div ref={containerRef} className="my-3 flex min-h-[65px] justify-center" />;
}
