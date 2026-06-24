import { useEffect, useRef } from 'react';
import { useGlobalSearchParams, usePathname, useSegments } from 'expo-router';
import { devLogPage } from '@/lib/devLog';
import { IS_DEV } from '@/lib/config';

export function DevNavigationLogger() {
  const pathname = usePathname();
  const segments = useSegments();
  const params = useGlobalSearchParams();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!IS_DEV || !__DEV__) return;
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;

    const serializableParams = Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value]),
    );

    devLogPage(pathname, {
      segments: [...segments],
      params: serializableParams,
    });
  }, [pathname, segments, params]);

  return null;
}
