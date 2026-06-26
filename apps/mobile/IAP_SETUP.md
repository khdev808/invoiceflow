# Native in-app purchases (RevenueCat)

InvoiceFlow mobile currently upgrades via **Stripe Checkout in the browser** (`PaywallModal` → `planApi.upgrade`). Native App Store / Play Billing via RevenueCat is the next step for store-compliant subscriptions.

## When to enable

- Apple/Google require IAP for digital subscriptions sold inside the app
- Stripe web checkout remains valid for **web** and as fallback until RevenueCat is configured

## Setup checklist

1. Create [RevenueCat](https://www.revenuecat.com) project
2. Connect App Store Connect + Google Play subscriptions (`pro_monthly`, `business_monthly`)
3. Install: `npx expo install react-native-purchases`
4. Set EAS secrets:
   ```bash
   EXPO_PUBLIC_REVENUECAT_APPLE_KEY=appl_...
   EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY=goog_...
   ```
5. Implement `lib/iap.ts` → call `Purchases.configure()` in app `_layout.tsx`
6. Map entitlements `pro` / `business` to API user plan (webhook or restore on login)

## API sync options

| Approach | Notes |
|----------|--------|
| RevenueCat webhook → API | Update `User.plan` on `INITIAL_PURCHASE` / `RENEWAL` |
| Client restore + `PUT /users/settings` | Simpler; less secure alone |
| Shared Stripe for web, RC for mobile | Common hybrid |

## Current code

- `apps/mobile/lib/iap.ts` — stub; returns `{ useStripeFallback: true }` until keys are set
- `PaywallModal` — uses Stripe when native IAP unavailable

See also `STORE_SUBMIT.md` for listing copy and EAS build commands.
