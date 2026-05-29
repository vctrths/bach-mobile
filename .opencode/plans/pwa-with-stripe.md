# PWA with Working Stripe — Implementation Plan

## Context

The Groene Vingers app needs to work as a Progressive Web App. The codebase is ~90% web-ready (platform-specific files, `Platform.OS` guards, web-compatible UI). The critical blocker is `@stripe/stripe-react-native` which crashes on web. The user needs Stripe payments to work on web.

**Recommended approach:** Stripe Elements + PaymentIntent (`@stripe/stripe-js` + `@stripe/react-stripe-js`) — reuses the existing `stripe-payment-sheet` edge function with zero backend changes.

**Stripe publishable key:** `pk_test_51Tc5OPJalktNm1WEzKUrHr1PAv7qmSpZfIR3D08FgflmEsKVCxogKXVCaAEnAbqTaEtEfO1WNYzP2i2S4btvsj0t00Q7tIuZPz`

**Backend status:** `stripe-payment-sheet` edge function is deployed on Supabase.

---

## Phase 1: Stripe Web Integration (1-2 hours)

### 1.1 Install web Stripe packages
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 1.2 Add Stripe key to `.env.local`
Add `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Tc5OPJalktNm1WEzKUrHr1PAv7qmSpZfIR3D08FgflmEsKVCxogKXVCaAEnAbqTaEtEfO1WNYzP2i2S4btvsj0t00Q7tIuZPz`

### 1.3 Create platform-specific Stripe wrappers

**File: `lib/stripe.native.ts`**
- Re-exports `StripeProvider` and `useStripe` from `@stripe/stripe-react-native` (unchanged native behavior)

**File: `lib/stripe.web.ts`**
- `StripeProvider` — passthrough that renders children (no Stripe.js wrapping at layout level)
- `useStripeWeb()` — hook that returns `{ stripe, elements, clientSecret, setClientSecret, loading, error }`
- Loads Stripe.js via `loadStripe(publishableKey)` (lazy, browser-only)

### 1.4 Update `_layout.tsx`
- Change `import { StripeProvider } from "@stripe/stripe-react-native"` to `import { StripeProvider } from "@/lib/stripe"`
- On web, `StripeProvider` becomes a passthrough (the real Stripe Elements wrapping happens in `payment.tsx` where the client secret is available)

### 1.5 Update `app/pro/payment.tsx`
- Split render into native vs web paths using `Platform.OS`
- **Native path:** Keep existing `initPaymentSheet` / `presentPaymentSheet` flow (unchanged)
- **Web path:**
  1. Call `fetchPaymentSheetParams()` to get `paymentIntent` client secret (same edge function)
  2. Render `<Elements stripe={stripePromise} options={{ clientSecret }}>`
  3. Render `<PaymentElement />` inside (Stripe's prebuilt card form)
  4. On submit: `stripe.confirmPayment({ elements, confirmParams: { return_url } })`
  5. On success: navigate to `/succesabo`

### 1.6 Stripe edge function
- ✅ `stripe-payment-sheet` is already deployed on Supabase
- No backend changes needed

---

## Phase 2: PWA Infrastructure (2-3 hours)

### 2.1 Create web app manifest
**File: `public/manifest.json`**
- App name: "Groene Vingers", short_name: "Groen"
- Theme color: `#37392B`, background: `#ffffff`
- Display: `standalone`
- Icons: 72, 96, 128, 144, 152, 192, 384, 512px (generated from `assets/images/icon.png`)

### 2.2 Generate PWA icons
- Use `pwa-asset-generator` or `sharp` to resize `assets/images/icon.png` into `public/icons/`
- Include maskable variant for 512px

### 2.3 Create service worker
**File: `public/service-worker.js`**
- Cache static assets (JS bundles, CSS, fonts, images)
- Network-first for Supabase API calls
- Cache-first for static assets
- Offline fallback to cached shell

### 2.4 Add PWA meta tags
**File: `public/index.html`** (Expo uses this as the HTML template)
- `<link rel="manifest" href="/manifest.json">`
- `<meta name="theme-color" content="#37392B">`
- Apple-specific: `apple-mobile-web-app-capable`, `apple-mobile-web-app-title`, `apple-touch-icon`

### 2.5 Register service worker
**File: `lib/register-sw.web.ts`**
- Register SW on page load (web-only)
- Import conditionally in `_layout.tsx`

---

## Phase 3: Testing & Polish (1 hour)

### 3.1 Build verification
```bash
bash scripts/download-fonts.sh && npx expo export --platform web
npx serve dist --single --listen 8081
```

### 3.2 Test checklist
- [ ] All routes load without crashes
- [ ] Stripe payment form renders on `/pro/payment` (web)
- [ ] Stripe test card `4242 4242 4242 4242` completes payment
- [ ] PWA install prompt appears in Chrome
- [ ] App launches in standalone mode (no browser chrome)
- [ ] Offline mode shows cached content
- [ ] Image upload works (basic, no cropping) on `/onboarding/photo` and `/garden/create`
- [ ] Map screen loads pigeon-maps on web

### 3.3 Known acceptable limitations
- Image cropping (`allowsEditing`) doesn't work on web — basic file upload works
- `BlurView` logs warnings but renders via CSS fallback
- Push notifications require additional web push setup (optional, out of scope)

---

## Files to create/modify

| File | Action | Purpose |
|------|--------|---------|
| `lib/stripe.native.ts` | Create | Re-export native Stripe (unchanged) |
| `lib/stripe.web.ts` | Create | Stripe.js + Elements wrapper for web |
| `lib/register-sw.web.ts` | Create | Service worker registration (web-only) |
| `app/_layout.tsx` | Modify | Use platform-specific StripeProvider |
| `app/pro/payment.tsx` | Modify | Add web payment form with PaymentElement |
| `public/manifest.json` | Create | PWA manifest |
| `public/index.html` | Create | HTML template with PWA meta tags |
| `public/service-worker.js` | Create | Offline caching service worker |
| `public/icons/*` | Create | PWA icons (8 sizes + maskable) |
| `.env.local` | Modify | Add `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| `supabase/functions/stripe-payment-sheet/index.ts` | ✅ Already deployed | Stripe PaymentIntent backend |

---

## Dependencies to install
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

## Verification command
```bash
bash scripts/download-fonts.sh && npx expo export --platform web && npx serve dist --single --listen 8081
```
Then open `http://localhost:8081` and test the Stripe payment flow with test card `4242 4242 4242 4242`.
