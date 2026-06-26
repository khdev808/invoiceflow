/**
 * Native IAP via RevenueCat — see IAP_SETUP.md.
 * Until EXPO_PUBLIC_REVENUECAT_* keys are set, mobile uses Stripe web checkout.
 */

export function isNativeIapConfigured(): boolean {
  const apple = process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY;
  const google = process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY;
  return Boolean(
    (apple && !apple.includes('placeholder'))
    || (google && !google.includes('placeholder')),
  );
}

export type IapPurchaseResult =
  | { ok: true; plan: 'pro' | 'business' }
  | { ok: false; useStripeFallback: true };

/** Placeholder until react-native-purchases is wired. */
export async function purchasePlan(_plan: 'pro' | 'business'): Promise<IapPurchaseResult> {
  if (!isNativeIapConfigured()) {
    return { ok: false, useStripeFallback: true };
  }
  // TODO: Purchases.purchasePackage(...) when RevenueCat SDK is installed
  return { ok: false, useStripeFallback: true };
}

export async function restorePurchases(): Promise<IapPurchaseResult> {
  if (!isNativeIapConfigured()) {
    return { ok: false, useStripeFallback: true };
  }
  return { ok: false, useStripeFallback: true };
}
