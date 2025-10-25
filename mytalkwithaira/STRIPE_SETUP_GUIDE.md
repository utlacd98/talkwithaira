# 🎯 Stripe Integration Setup Guide

## Overview

Aira now has full Stripe integration with:
- ✅ Real Stripe checkout
- ✅ Subscription management
- ✅ Webhook handling
- ✅ Admin/Owner bypass (no payment needed for testing)
- ✅ Three pricing tiers: Free, Pro ($9.99/mo), Premium ($19.99/mo)

---

## 📋 Pricing Structure

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0 | 10 messages/day, Basic emotion detection, Text chat |
| **Pro** | $9.99/mo | Unlimited messages, Advanced emotion detection, Voice, Mood analytics |
| **Premium** | $19.99/mo | Everything in Pro + Multi-modal, Advanced memory, 24/7 support, API access |

---

## 🔑 Step 1: Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Sign up or log in
3. Go to **Developers** → **API Keys**
4. Copy your **Publishable Key** (starts with `pk_test_`)
5. Copy your **Secret Key** (starts with `sk_test_`)

---

## 💰 Step 2: Create Products & Prices

### Create Pro Plan
1. Go to **Products** → **Add Product**
2. Name: `Aira Pro`
3. Price: `$9.99`
4. Billing period: `Monthly`
5. Copy the **Price ID** (starts with `price_`)

### Create Premium Plan
1. Go to **Products** → **Add Product**
2. Name: `Aira Premium`
3. Price: `$19.99`
4. Billing period: `Monthly`
5. Copy the **Price ID** (starts with `price_`)

---

## 🔐 Step 3: Configure Environment Variables

Update `.env.local`:

```env
# Stripe API Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE

# Stripe Product/Price IDs
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_1234567890abcdef
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM=price_0987654321fedcba

# Stripe Webhook Secret (set up in Step 4)
STRIPE_WEBHOOK_SECRET=whsec_test_YOUR_SECRET_HERE

# App URL (for Stripe redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🪝 Step 4: Set Up Webhooks

1. Go to **Developers** → **Webhooks**
2. Click **Add Endpoint**
3. Endpoint URL: `http://localhost:3000/api/stripe/webhook` (or your production URL)
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the **Signing Secret** (starts with `whsec_`)
6. Add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

---

## 👥 Step 5: Test Admin Accounts

Three admin accounts are pre-configured to **bypass payment**:

### Owner Account
- **Email**: `owner@aira.ai`
- **Password**: Any password
- **Access**: Premium plan (no payment)
- **Role**: Owner

### Admin Account 1
- **Email**: `admin1@aira.ai`
- **Password**: Any password
- **Access**: Premium plan (no payment)
- **Role**: Admin

### Admin Account 2
- **Email**: `admin2@aira.ai`
- **Password**: Any password
- **Access**: Premium plan (no payment)
- **Role**: Admin

### How to Use
1. Go to `/signup` or `/login`
2. Enter one of the admin emails
3. Enter any password
4. You'll be logged in with **Premium access** automatically
5. No payment required!

---

## 🧪 Step 6: Test Stripe Checkout

### Test with Regular User
1. Sign up with a regular email (e.g., `test@example.com`)
2. Go to `/pricing`
3. Click "Upgrade to Pro" or "Upgrade to Premium"
4. You'll be redirected to Stripe checkout
5. Use Stripe test card: `4242 4242 4242 4242`
6. Any future expiry date and any CVC

### Test with Admin User
1. Sign up with `admin1@aira.ai`
2. Go to `/pricing`
3. Click "Upgrade to Pro" or "Upgrade to Premium"
4. You'll be upgraded **instantly** without payment

---

## 📁 Files Created/Modified

### New Files
- `lib/stripe.ts` - Stripe configuration and helpers
- `app/api/stripe/checkout-session/route.ts` - Create checkout sessions
- `app/api/stripe/webhook/route.ts` - Handle Stripe webhooks

### Modified Files
- `lib/auth-context.tsx` - Added admin/owner role support
- `app/checkout/page.tsx` - Integrated real Stripe checkout
- `app/pricing/page.tsx` - Added admin bypass logic
- `.env.local` - Added Stripe configuration

---

## 🔄 Webhook Events Handled

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Update user subscription in database |
| `customer.subscription.updated` | Update subscription details |
| `customer.subscription.deleted` | Downgrade user to free plan |
| `invoice.payment_failed` | Notify user of failed payment |

---

## 🚀 Production Deployment

When deploying to production:

1. **Get Production Keys**
   - Go to Stripe Dashboard (live mode)
   - Copy production API keys (start with `pk_live_` and `sk_live_`)

2. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY
   STRIPE_SECRET_KEY=sk_live_YOUR_KEY
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

3. **Update Webhook URL**
   - Add webhook endpoint: `https://yourdomain.com/api/stripe/webhook`

4. **Remove Admin Bypass** (optional)
   - Remove admin email checks from `auth-context.tsx` for production

---

## 🐛 Troubleshooting

### "Invalid API Key"
- Check that keys are correct in `.env.local`
- Restart dev server: `npm run dev`

### "Price not configured"
- Verify Price IDs in `.env.local`
- Check that products exist in Stripe Dashboard

### Webhook not working
- Verify webhook URL is correct
- Check webhook signing secret in `.env.local`
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### Admin bypass not working
- Check email exactly matches: `owner@aira.ai`, `admin1@aira.ai`, `admin2@aira.ai`
- Clear browser cache/localStorage
- Restart dev server

---

## 📞 Support

For Stripe issues, visit: https://support.stripe.com

