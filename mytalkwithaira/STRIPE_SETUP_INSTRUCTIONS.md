# 🎯 Stripe Setup Instructions - £8.99/month Premium Plan

## ✅ What's Been Implemented

Your Aira app now has **complete Stripe integration** for a single Premium plan at **£8.99/month**.

### Files Created:
- ✅ `lib/stripe.ts` - Stripe client configuration
- ✅ `app/api/stripe/checkout-session/route.ts` - Creates checkout sessions
- ✅ `app/api/stripe/webhook/route.ts` - Handles subscription events
- ✅ Updated `app/pricing/page.tsx` - Stripe checkout integration
- ✅ Updated `app/checkout/page.tsx` - Stripe checkout flow

---

## 🚀 Step-by-Step Setup Guide

### Step 1: Create a Stripe Account

1. Go to https://stripe.com
2. Click "Sign up" (it's free!)
3. Complete the registration
4. You'll start in **Test Mode** (perfect for development)

---

### Step 2: Get Your API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - Click "Reveal test key"

3. Copy both keys

---

### Step 3: Create Your Premium Product

1. Go to https://dashboard.stripe.com/test/products
2. Click **"+ Add product"**
3. Fill in the details:
   - **Name**: `Aira Premium`
   - **Description**: `Unlimited chats, advanced mood tracking, and all premium features`
   - **Pricing model**: `Standard pricing`
   - **Price**: `8.99`
   - **Currency**: `GBP (£)`
   - **Billing period**: `Monthly`
4. Click **"Save product"**
5. **IMPORTANT**: Copy the **Price ID** (starts with `price_...`)
   - You'll find it under the price you just created

---

### Step 4: Update Your Local Environment Variables

Open `.env.local` and update these values:

```bash
# Replace these with your actual Stripe keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE

# Replace with your Price ID from Step 3
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM=price_YOUR_PRICE_ID_HERE

# Leave this empty for now (we'll set it up in Step 6)
STRIPE_WEBHOOK_SECRET=
```

---

### Step 5: Test Locally

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test the checkout flow:**
   - Go to http://localhost:3000/pricing
   - Click "Upgrade to Premium"
   - You should be redirected to Stripe Checkout

3. **Use Stripe test card:**
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

4. **Complete the test payment**
   - You should be redirected back to your dashboard
   - Check Stripe Dashboard → Payments to see the test payment

---

### Step 6: Set Up Webhooks (For Production)

Webhooks allow Stripe to notify your app when subscriptions are created, updated, or canceled.

#### For Local Testing (Optional):

1. **Install Stripe CLI:**
   ```bash
   # Windows (using Scoop)
   scoop install stripe
   
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe CLI:**
   ```bash
   stripe login
   ```

3. **Forward webhooks to localhost:**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **Copy the webhook signing secret** (starts with `whsec_...`)
   - Update `.env.local`:
     ```bash
     STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
     ```

#### For Production (Vercel):

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click **"+ Add endpoint"**
3. Enter your webhook URL:
   ```
   https://your-app.vercel.app/api/stripe/webhook
   ```
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. **Copy the Signing secret** (starts with `whsec_...`)
7. Add it to Vercel environment variables:
   ```bash
   vercel env add STRIPE_WEBHOOK_SECRET production
   ```

---

### Step 7: Deploy to Vercel

1. **Add Stripe environment variables to Vercel:**

   Go to: https://vercel.com/your-project/settings/environment-variables

   Add these variables for **Production**:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_test_...`
   - `STRIPE_SECRET_KEY` = `sk_test_...`
   - `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM` = `price_...`
   - `STRIPE_WEBHOOK_SECRET` = `whsec_...` (from Step 6)

2. **Redeploy your app:**
   ```bash
   vercel --prod
   ```

3. **Test on production:**
   - Visit your production URL
   - Go to `/pricing`
   - Test the checkout flow with test card

---

## 🎉 You're Done!

Your Stripe integration is complete! Here's what happens now:

### User Flow:
1. User clicks "Upgrade to Premium" on pricing page
2. Redirected to Stripe Checkout (secure, hosted by Stripe)
3. Enters payment details
4. Completes payment
5. Redirected back to your app
6. Stripe sends webhook to update user's plan
7. User now has Premium access!

---

## 🧪 Testing

### Test Cards:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |

**All test cards:**
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

---

## 🔐 Security Notes

✅ **Secret keys are never exposed to the browser**
✅ **Stripe handles all payment data (PCI compliant)**
✅ **Webhook signatures are verified**
✅ **All API routes use lazy initialization**

---

## 📊 Monitoring

### View Payments:
- https://dashboard.stripe.com/test/payments

### View Subscriptions:
- https://dashboard.stripe.com/test/subscriptions

### View Webhooks:
- https://dashboard.stripe.com/test/webhooks

---

## 🚨 Troubleshooting

### Issue: "Stripe price not configured"
**Solution**: Make sure `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM` is set in your environment variables

### Issue: "Invalid API Key"
**Solution**: Check that `STRIPE_SECRET_KEY` is correct and starts with `sk_test_`

### Issue: Webhook not working
**Solution**: 
1. Check webhook URL is correct
2. Verify `STRIPE_WEBHOOK_SECRET` is set
3. Check Stripe Dashboard → Webhooks for delivery status

### Issue: Payment succeeds but user plan doesn't update
**Solution**: 
1. Check webhook is configured correctly
2. Check server logs for webhook errors
3. Verify `updateUserPlanByEmail` function is working

---

## 🎯 Going Live (Production)

When you're ready to accept real payments:

1. **Complete Stripe account verification**
   - Provide business details
   - Add bank account for payouts

2. **Switch to Live Mode**
   - Get live API keys (start with `pk_live_` and `sk_live_`)
   - Create live product and price
   - Update environment variables with live keys

3. **Update webhook endpoint**
   - Create webhook for production URL
   - Use live webhook secret

4. **Test with real card** (small amount first!)

---

## 💰 Pricing

**Stripe Fees (UK):**
- 1.5% + 20p per successful card charge
- No monthly fees
- No setup fees

**Example:**
- £8.99 subscription = £8.72 after fees
- You keep 97% of revenue

---

## 📞 Support

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Support**: https://support.stripe.com
- **Test Mode**: Always free, unlimited testing

---

## ✨ Next Steps

1. ✅ Create Stripe account
2. ✅ Get API keys
3. ✅ Create Premium product
4. ✅ Update `.env.local`
5. ✅ Test locally
6. ✅ Deploy to Vercel
7. ✅ Set up webhooks
8. ✅ Test on production
9. 🎉 Start accepting payments!

Good luck! 🚀

