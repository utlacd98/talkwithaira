# Stripe Webhook Fix - Final Steps

## ✅ What I've Done

1. **Updated the webhook URL in Stripe** from `/api/stripe/webhook` to `/api/webhooks/stripe` (correct path)
2. **Created a new webhook endpoint** in Stripe with the correct events
3. **Generated a new webhook signing secret**: `whsec_vM4BE74owwD2qaALxeJbcKgbMz6tpmrn`

## 🔧 What You Need to Do

### Option 1: Update via Vercel Dashboard (Recommended - Easiest)

1. Open this URL in your browser:
   ```
   https://vercel.com/utlacd98-5423s-projects/v0-aira-web-app/settings/environment-variables
   ```

2. Find `STRIPE_WEBHOOK_SECRET` in the list

3. Click the **three dots (⋯)** next to it and select **Edit**

4. Replace the current value with this new secret:
   ```
   whsec_vM4BE74owwD2qaALxeJbcKgbMz6tpmrn
   ```

5. Click **Save**

6. Redeploy your application:
   ```bash
   vercel --prod
   ```

### Option 2: Update via CLI

Run these commands in PowerShell:

```powershell
# Remove old secret
vercel env rm STRIPE_WEBHOOK_SECRET production --yes

# Add new secret
$secret = "whsec_vM4BE74owwD2qaALxeJbcKgbMz6tpmrn"
echo $secret | vercel env add STRIPE_WEBHOOK_SECRET production

# Redeploy
vercel --prod
```

## 🧪 Testing

After redeploying, test the webhook by:

1. Going to your Stripe Dashboard: https://dashboard.stripe.com/test/webhooks
2. Click on your webhook endpoint
3. Click "Send test webhook"
4. Check the response - it should show `200 OK` instead of `400 Bad Request`

## 📋 Summary

The issue was:
- ❌ Wrong webhook URL path in Stripe
- ❌ Mismatched webhook signing secret

Now fixed:
- ✅ Correct webhook URL: `https://v0-aira-web-app.vercel.app/api/webhooks/stripe`
- ✅ New webhook signing secret generated
- ⏳ Waiting for you to update the secret in Vercel and redeploy

## 🔗 Useful Links

- Vercel Environment Variables: https://vercel.com/utlacd98-5423s-projects/v0-aira-web-app/settings/environment-variables
- Stripe Webhooks Dashboard: https://dashboard.stripe.com/test/webhooks
- Vercel Deployment Logs: https://vercel.com/utlacd98-5423s-projects/v0-aira-web-app/deployments

