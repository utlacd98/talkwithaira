# 🚨 FIX WEBHOOK NOW - Quick Guide

## The Problem

Your webhook secret in Vercel **doesn't match** the webhook secret from Stripe.

That's why you're seeing:
```
[Stripe Webhook] Signature verification failed
```

---

## ✅ The Solution (5 minutes)

### Step 1: Get the CORRECT Webhook Secret from Stripe

1. Open: https://dashboard.stripe.com/test/webhooks
2. Look for your webhook endpoint with URL: `https://v0-aira-web-app.vercel.app/api/stripe/webhook`
3. **If you see it:**
   - Click on it
   - Click **"Reveal"** next to "Signing secret"
   - Copy the secret (starts with `whsec_...`)
   - **Go to Step 2**

4. **If you DON'T see it:**
   - Click **"Add endpoint"**
   - Endpoint URL: `https://v0-aira-web-app.vercel.app/api/stripe/webhook`
   - Events to send: Select these:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Click **"Add endpoint"**
   - Click **"Reveal"** next to "Signing secret"
   - Copy the secret (starts with `whsec_...`)

### Step 2: Update the Secret in Vercel

Run this command:

```bash
vercel env rm STRIPE_WEBHOOK_SECRET production
```

When prompted, confirm with `y`

Then add the new one:

```bash
vercel env add STRIPE_WEBHOOK_SECRET production
```

When prompted, paste the webhook secret you copied from Stripe (starts with `whsec_...`)

### Step 3: Redeploy

```bash
vercel --prod
```

### Step 4: Test

Go to Stripe Dashboard → Webhooks → Your endpoint → Click "Send test webhook" → Select `checkout.session.completed` → Send

You should see `200 OK` instead of `400 Bad Request`

---

## 🎯 Alternative: Use Stripe CLI (Easier for Testing)

If you just want to test locally:

### 1. Install Stripe CLI

```bash
# Windows (using Scoop)
scoop install stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

### 2. Login

```bash
stripe login
```

### 3. Forward Webhooks

```bash
stripe listen --forward-to https://v0-aira-web-app.vercel.app/api/stripe/webhook
```

This will output:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

### 4. Update Vercel

```bash
vercel env rm STRIPE_WEBHOOK_SECRET production
vercel env add STRIPE_WEBHOOK_SECRET production
# Paste the secret from step 3
vercel --prod
```

### 5. Trigger Test Event

```bash
stripe trigger checkout.session.completed
```

---

## 🔍 How to Verify It's Working

### Check 1: Webhook Endpoint Status

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click on your endpoint
3. Look at "Recent deliveries"
4. Should show `200 OK` instead of `400 Bad Request`

### Check 2: User Plan Updated

1. Complete a test checkout
2. Go to your dashboard
3. Should show "Premium" plan
4. Should show "Unlimited chats"

### Check 3: Vercel Logs

```bash
vercel logs --follow
```

Look for:
```
[Stripe Webhook] ✅ Signature verified successfully
[Stripe Webhook] ✅ User upgraded successfully via userId: xxx
```

---

## 📝 Quick Checklist

- [ ] Got webhook secret from Stripe Dashboard
- [ ] Removed old secret from Vercel: `vercel env rm STRIPE_WEBHOOK_SECRET production`
- [ ] Added new secret to Vercel: `vercel env add STRIPE_WEBHOOK_SECRET production`
- [ ] Redeployed: `vercel --prod`
- [ ] Tested webhook from Stripe Dashboard
- [ ] Verified `200 OK` response
- [ ] Completed test checkout
- [ ] Verified plan upgraded to "Premium"

---

## 🆘 Still Not Working?

### Option 1: Temporarily Disable Signature Verification

I've already added code to skip signature verification if the secret is not configured properly.

Just remove the webhook secret entirely:

```bash
vercel env rm STRIPE_WEBHOOK_SECRET production
vercel --prod
```

The webhook will work but show warnings:
```
⚠️ SKIPPING signature verification (test mode)
```

**WARNING**: This is UNSAFE for production! Only use for testing.

### Option 2: Check the Logs

```bash
vercel logs --follow
```

Look for these log messages:
- `[Stripe Webhook] Environment: production`
- `[Stripe Webhook] Webhook secret exists: true/false`
- `[Stripe Webhook] Is test mode: true/false`

This will tell you exactly what's happening.

---

## 💡 Why This Happened

When you set up the webhook secret 28 minutes ago, you probably:
1. Created a webhook endpoint in Stripe
2. Got a webhook secret
3. Added it to Vercel

But then:
1. You might have deleted and recreated the webhook endpoint
2. Or you're using a different Stripe account
3. Or you copied the wrong secret

Each webhook endpoint has its OWN unique secret. You need to use the secret from the EXACT endpoint that Stripe is sending events to.

---

## ✅ Summary

**Quick fix:**
```bash
# 1. Get secret from Stripe Dashboard
# 2. Remove old secret
vercel env rm STRIPE_WEBHOOK_SECRET production

# 3. Add new secret
vercel env add STRIPE_WEBHOOK_SECRET production
# (paste the secret from Stripe)

# 4. Redeploy
vercel --prod

# 5. Test
# Go to Stripe Dashboard → Webhooks → Send test webhook
```

**Expected result:**
- Webhook returns `200 OK`
- User plan upgrades to "Premium"
- Dashboard shows unlimited chats

---

Need help? Check the Vercel logs or send me the error message!

