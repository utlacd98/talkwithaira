# Stripe Webhook Setup Guide

## 🚨 **CRITICAL: Missing STRIPE_WEBHOOK_SECRET**

Your Stripe webhook is not working because the `STRIPE_WEBHOOK_SECRET` environment variable is **NOT SET** in Vercel.

---

## 📋 **Step-by-Step Setup**

### **Step 1: Go to Stripe Dashboard**
1. Open: https://dashboard.stripe.com/test/webhooks
2. Make sure you're in **Test Mode** (toggle in top right)

### **Step 2: Create or Find Your Webhook**

#### **Option A: If you already have a webhook endpoint**
1. Look for an endpoint with URL: `https://v0-aira-web-app.vercel.app/api/stripe/webhook`
2. Click on it
3. Click **"Reveal"** next to "Signing secret"
4. Copy the secret (starts with `whsec_...`)
5. **Skip to Step 3**

#### **Option B: If you DON'T have a webhook endpoint**
1. Click **"Add endpoint"**
2. **Endpoint URL**: `https://v0-aira-web-app.vercel.app/api/stripe/webhook`
3. **Description**: `Aira Premium Subscription Webhook`
4. **Events to send**: Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. After creation, click **"Reveal"** next to "Signing secret"
7. Copy the secret (starts with `whsec_...`)

### **Step 3: Add the Secret to Vercel**

Run this command in your terminal:

```bash
vercel env add STRIPE_WEBHOOK_SECRET production
```

When prompted, paste the webhook secret you copied (starts with `whsec_...`)

### **Step 4: Redeploy**

```bash
vercel --prod --yes
```

---

## 🧪 **Test the Webhook**

### **Option 1: Test in Stripe Dashboard**
1. Go to your webhook endpoint in Stripe
2. Click **"Send test webhook"**
3. Select event: `checkout.session.completed`
4. Click **"Send test webhook"**
5. Check Vercel logs for: `[Stripe Webhook] ✅ User upgraded successfully`

### **Option 2: Test with Real Payment**
1. Go to: https://v0-aira-web-app.vercel.app/pricing
2. Click **"Upgrade to Premium"**
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete checkout
5. You should be redirected back with plan updated to "Premium"

---

## 🔍 **Verify It's Working**

After setup, check:

1. **Vercel Environment Variables**:
   ```bash
   vercel env ls production
   ```
   Should show `STRIPE_WEBHOOK_SECRET` in the list

2. **Webhook Logs in Stripe**:
   - Go to your webhook endpoint
   - Check the "Recent deliveries" tab
   - Should show successful deliveries (200 status)

3. **Vercel Logs**:
   - Go to: https://vercel.com/utlacd98-5423s-projects/v0-aira-web-app/logs
   - After a test payment, should see:
     ```
     [Stripe Webhook] Received event: checkout.session.completed
     [Stripe Webhook] ✅ User upgraded successfully: user@example.com
     ```

---

## ❓ **Troubleshooting**

### **Webhook returns 500 error**
- Check Vercel logs for the error message
- Verify `STRIPE_WEBHOOK_SECRET` is set correctly
- Make sure you copied the FULL secret including `whsec_` prefix

### **Plan not updating after payment**
- Check Stripe webhook logs - is the webhook being called?
- Check Vercel logs - is the webhook handler receiving the event?
- Verify the customer email in Stripe matches the user's email in your app

### **"Invalid signature" error**
- You're using the wrong webhook secret
- Make sure you're using the secret from the CORRECT webhook endpoint
- Test mode webhooks have different secrets than live mode

---

## 📝 **Current Status**

- ✅ Redis connection: **WORKING**
- ✅ User registration: **WORKING**
- ✅ Stripe checkout: **WORKING**
- ❌ Webhook secret: **MISSING** ← **FIX THIS**
- ❌ Plan updates: **NOT WORKING** (because webhook can't verify signature)

---

## 🎯 **Expected Behavior After Fix**

1. User clicks "Upgrade to Premium"
2. Redirected to Stripe checkout
3. Completes payment with test card
4. Stripe sends webhook to `/api/stripe/webhook`
5. Webhook verifies signature using `STRIPE_WEBHOOK_SECRET`
6. Webhook updates user plan in Redis to "premium"
7. User redirected back to dashboard
8. Dashboard shows "Premium Plan" ✅

---

**Follow the steps above and let me know once you've added the webhook secret!**

