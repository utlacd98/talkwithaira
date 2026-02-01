# Stripe Payment Link Setup Guide

## Overview
We've switched from Stripe Checkout Sessions (which require backend API calls) to Stripe Payment Links (which are simple URLs that don't require any backend code for checkout).

## Benefits
- ✅ No backend API needed for checkout
- ✅ Simpler implementation
- ✅ Easier to debug
- ✅ No environment variable issues with price IDs
- ✅ Can be tested directly by visiting the URL

## Setup Steps

### Step 1: Create Payment Link in Stripe Dashboard

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/test/payment-links
2. **Click "New"** or "+ New payment link"
3. **Select your Premium product** (the one with price `price_1SNNkkFaCeYGrunKw0Bm295H`)
4. **Configure the Payment Link**:
   - **Payment method**: Card
   - **After payment**: Redirect to a page → Enter: `https://v0-aira-web-app.vercel.app/dashboard?upgraded=true`
   - **Collect customer information**: Email address (required)
   - **Allow promotion codes**: Yes (optional but recommended)
   - **Billing address collection**: Automatic (optional)
5. **Click "Create link"**
6. **Copy the Payment Link URL** (it will look like: `https://buy.stripe.com/test_xxxxx`)

### Step 2: Add Payment Link to Environment Variables

Once you have the Payment Link URL, add it to Vercel:

```bash
vercel env add NEXT_PUBLIC_STRIPE_PAYMENT_LINK production
```

When prompted, paste your Payment Link URL (e.g., `https://buy.stripe.com/test_xxxxx`)

### Step 3: Deploy to Production

```bash
vercel --prod
```

### Step 4: Set Up Webhook (Already Done!)

The webhook handler at `/api/stripe/webhook` is already configured to handle:
- `checkout.session.completed` - Upgrades user to premium
- `customer.subscription.updated` - Updates subscription status
- `customer.subscription.deleted` - Downgrades user to free
- `invoice.payment_failed` - Logs payment failures

You just need to make sure the webhook is configured in Stripe Dashboard:

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click on your webhook endpoint
3. Make sure these events are selected:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

## How It Works

### User Flow
1. User clicks "Upgrade to Premium" on `/pricing`
2. Code redirects to Stripe Payment Link with prefilled email: 
   ```
   https://buy.stripe.com/test_xxxxx?prefilled_email=user@example.com&client_reference_id=user123
   ```
3. User completes payment on Stripe's hosted page
4. Stripe redirects back to: `https://v0-aira-web-app.vercel.app/dashboard?upgraded=true`
5. Stripe sends webhook to `/api/stripe/webhook`
6. Webhook handler upgrades user to premium plan

### Code Changes Made

**File: `app/pricing/page.tsx`**
- Removed API call to `/api/stripe/checkout-session`
- Now directly redirects to Payment Link URL
- Prefills email and passes user ID as `client_reference_id`

**File: `app/api/stripe/webhook/route.ts`**
- No changes needed! Already handles Payment Link webhooks

## Testing

### Test the Payment Link Directly
1. Visit your Payment Link URL in a browser
2. Complete a test payment using Stripe test card: `4242 4242 4242 4242`
3. Check that you're redirected to the dashboard
4. Check webhook logs in Stripe Dashboard

### Test the Full Flow
1. Go to: https://v0-aira-web-app.vercel.app/pricing
2. Click "Upgrade to Premium"
3. Complete payment with test card
4. Verify you're redirected to dashboard
5. Verify your plan is upgraded to premium

## Troubleshooting

### Payment Link not working
- Make sure `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` is set in Vercel
- Check that the Payment Link is active in Stripe Dashboard
- Verify the redirect URL is correct

### User not upgraded after payment
- Check webhook logs in Stripe Dashboard
- Verify webhook is receiving `checkout.session.completed` events
- Check Vercel logs for webhook errors
- Make sure `STRIPE_WEBHOOK_SECRET` is set correctly

### Email not prefilled
- Make sure the Payment Link has "Collect customer information: Email" enabled
- The URL parameter is `prefilled_email` (not `email`)

## Environment Variables Needed

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Payment Link (NEW!)
NEXT_PUBLIC_STRIPE_PAYMENT_LINK=https://buy.stripe.com/test_xxxxx

# Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# App URL
NEXT_PUBLIC_APP_URL=https://v0-aira-web-app.vercel.app
```

## Next Steps

1. ✅ Create Payment Link in Stripe Dashboard
2. ⏳ Add `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` to Vercel
3. ⏳ Deploy to production
4. ⏳ Test the payment flow
5. ⏳ Monitor webhook logs

## Notes

- Payment Links work with both test and live mode
- You'll need to create a separate Payment Link for production (live mode)
- The webhook handler works the same for both Checkout Sessions and Payment Links
- You can customize the Payment Link appearance in Stripe Dashboard

