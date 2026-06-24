import { useAuthStore } from '@/stores/auth';

export function useUserCurrency() {
  return useAuthStore((s) => s.user?.currency || 'USD');
}
