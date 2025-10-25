# Lemonsqueezy Integration Status

## ✅ Completed

### 1. Environment Configuration
- [x] Added Lemonsqueezy API Key to `.env.local`
- [x] Added Store ID (223935) to `.env.local`
- [x] Added Product IDs to `.env.local`
- [x] Removed all Stripe configuration from `.env.local`

### 2. Frontend Updates
- [x] Updated `/app/pricing/page.tsx` to redirect to Lemonsqueezy checkout
- [x] Updated `/app/checkout/page.tsx` to use Lemonsqueezy links
- [x] Updated `/app/checkout-success/page.tsx` to handle Lemonsqueezy redirects
- [x] Pre-fill email and name in checkout URLs

### 3. Backend Cleanup
- [x] Removed `/app/api/stripe` directory
- [x] Removed `/lib/stripe.ts` file
- [x] Created `/app/api/webhooks/lemonsqueezy/route.ts` webhook handler

### 4. Webhook Handler
- [x] Created Lemonsqueezy webhook endpoint at `/api/webhooks/lemonsqueezy`
- [x] Implemented webhook signature verification
- [x] Added event handlers for: `order.created`, `subscription.updated`, `subscription.cancelled`

## ⚠️ Current Issue

**404 Error on Lemonsqueezy Checkout**

The checkout URLs are returning 404 errors. The IDs provided appear to be **product IDs**, but Lemonsqueezy checkout links need **variant IDs** (numeric).

### Current Checkout URLs (WRONG)
```
https://talkwithaira.lemonsqueezy.com/buy/210ff3d5-eb49-43ba-b978-e058d4ebe18c?checkout[email]=...
```

### What We Need
- **Variant IDs** (numeric, e.g., `12345`) instead of UUIDs
- These can be found in Lemonsqueezy Dashboard → Products → Click product → Variants section

## 🔧 Next Steps (TODO)

### 1. ⚡ URGENT: Get Correct Variant IDs
- [ ] Go to https://app.lemonsqueezy.com/products
- [ ] Click on "Aira Plus" product
- [ ] Go to "Variants" section
- [ ] Copy the **numeric variant ID** (e.g., `12345`)
- [ ] Repeat for "Aira Premium"
- [ ] Update `.env.local`:
  ```
  NEXT_PUBLIC_LEMONSQUEEZY_PRODUCT_PLUS=<numeric_variant_id>
  NEXT_PUBLIC_LEMONSQUEEZY_PRODUCT_PREMIUM=<numeric_variant_id>
  ```
- [ ] Restart the server: `npm run dev`

### 2. Test Checkout Flow
- [ ] Once product IDs are verified, test the checkout again
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Verify redirect to checkout-success page

### 3. Complete Webhook Integration
- [ ] Get webhook secret from Lemonsqueezy Dashboard
- [ ] Add to `.env.local` as `LEMONSQUEEZY_WEBHOOK_SECRET`
- [ ] Implement database query to get user ID from email in webhook handler
- [ ] Test webhook by completing a test purchase

### 4. Plan Update Logic
- [ ] Implement email-to-user-id lookup in webhook handler
- [ ] Call `updatePlan()` function when subscription events occur
- [ ] Test that user plan updates after purchase

### 5. Success Page Redirect
- [ ] Verify checkout-success page properly updates user plan
- [ ] Test redirect to dashboard with `?upgraded=true` parameter

## 📋 Files Modified

- `.env.local` - Updated with Lemonsqueezy credentials
- `app/pricing/page.tsx` - Updated checkout handler
- `app/checkout/page.tsx` - Updated checkout handler
- `app/checkout-success/page.tsx` - Simplified for Lemonsqueezy
- `app/api/webhooks/lemonsqueezy/route.ts` - NEW webhook handler

## 🔗 Lemonsqueezy Links

- **Store**: https://talkwithaira.lemonsqueezy.com
- **Dashboard**: https://app.lemonsqueezy.com
- **API Docs**: https://docs.lemonsqueezy.com/api
- **Checkout Docs**: https://docs.lemonsqueezy.com/help/checkout

## 💡 Notes

- Only monthly billing is currently set up (no yearly)
- Free plan is available but doesn't require payment
- Admin bypass system from Stripe has been removed (can be re-added if needed)
- Webhook signature verification is implemented but needs secret from Lemonsqueezy

