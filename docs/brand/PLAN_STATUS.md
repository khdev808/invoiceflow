# Quiet Ledger Plan — Completion Status

Last updated: after plan implementation pass.

## Completed

| Area | Status |
|------|--------|
| Design tokens (web + mobile) | Done — `globals.css`, `theme.ts`, `BRAND_GUIDE.md` |
| Logo marks & illustrations | Done — 13 SVGs in `docs/brand/assets/illustrations/` |
| App icon, splash, OG image | Done |
| Marketing shell + landing redesign | Done |
| Auth layout (web + mobile) | Done |
| AppShell + lucide nav | Done |
| 3-step invoice flow (web + mobile create) | Done |
| Client portal trust redesign | Done |
| P0/P1 app page migrations | Done |
| Mobile dashboard simplification | Done |
| Android feature graphic | Done — `docs/brand/store/android-feature-graphic.png` |
| Admin internal dashboard branding | Done |

## Partial / follow-up (non-blocking for beta)

| Item | Notes |
|------|-------|
| Full store screenshot set (5–8 × device sizes) | Template + 1 iOS frame in `docs/brand/store/`; capture from running app for production submit |
| Localized OG images (ES/FR/DE/PT/HI) | Placeholder copies of `default.png` in `apps/admin/public/og/` |
| Mobile invoice **edit** stepper | Create flow has stepper; edit retains single-scroll (functional) |
| Full dark mode | Phase 2 per plan |
| Hero montage 2400×1600 | OG + landing preview used instead |
| App preview video | Optional, out of scope |

## QA checklist

- [x] No "IF" gradient box in app chrome
- [x] Logo mark in AppShell, AdminDashboard, auth
- [x] Web + mobile brass/ivory/navy tokens aligned
- [x] `pnpm -F admin build` passes
- [x] `pnpm -F api build` passes
- [ ] Mobile: run `expo start --clear` after font/SVG changes
- [ ] Store screenshots from live UI before App Store submit
