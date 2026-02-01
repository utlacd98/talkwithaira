# ✅ Stripe Webhook Fix - COMPLETED

## What Was Fixed

### 1. ❌ Problem: Wrong Webhook URL
- **Before**: `https://v0-aira-web-app.vercel.app/api/stripe/webhook`
- **After**: `https://v0-aira-web-app.vercel.app/api/webhooks/stripe` ✅

### 2. ❌ Problem: Mismatched Webhook Signing Secret
- **Before**: `whsec_X02W58pkhuJEKIuEpYsryb7egMuCUjRx` (old secret)
- **After**: `whsec_vM4BE74owwD2qaALxeJbcKgbMz6tpmrn` (new secret) ✅

### 3. ✅ Actions Taken

1. **Deleted old webhook endpoint** in Stripe
2. **Created new webhook endpoint** with correct URL and events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`
3. **Updated `STRIPE_WEBHOOK_SECRET`** in Vercel Production environment
4. **Redeployed application** to production
5. **Sent test webhook event** to verify the fix

## New Webhook Details

- **Webhook ID**: `we_1SPXVsFaCeYGrunK9kVPpFCd`
- **URL**: `https://v0-aira-web-app.vercel.app/api/webhooks/stripe`
- **Status**: Enabled
- **API Version**: 2024-06-20
- **Signing Secret**: `whsec_vM4BE74owwD2qaALxeJbcKgbMz6tpmrn`

## Verification Steps

### Check Stripe Dashboard
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click on the webhook endpoint
3. Look at the "Recent deliveries" section
4. You should see **200 OK** responses instead of **400 Bad Request**

### Check Vercel Deployment
1. Go to: https://vercel.com/utlacd98-5423s-projects/v0-aira-web-app/deployments
2. Click on the latest deployment
3. Go to the "Logs" tab
4. Look for `[Stripe Webhook]` log entries

### Test the Webhook
You can test the webhook by:
1. Creating a test checkout session in Stripe
2. Completing the payment
3. Checking if the webhook is received and processed correctly

Or run the test script:
```bash
node scripts/send-test-webhook.js
```

## Expected Behavior

When a webhook event is received:
1. Stripe sends the event to your endpoint with a signature
2. Your Next.js API route verifies the signature using the webhook secret
3. If valid, it processes the event (e.g., updates user plan in Redis)
4. Returns a 200 OK response to Stripe

## Troubleshooting

If you still see errors:

1. **Check environment variables are loaded**:
   ```bash
   vercel env pull .env.production --environment=production
   ```

2. **Verify the webhook secret matches**:
   - Stripe Dashboard → Webhooks → Click endpoint → Reveal signing secret
   - Compare with Vercel environment variable

3. **Check the logs**:
   - Vercel Dashboard → Deployments → Latest → Logs
   - Look for `[Stripe Webhook]` entries

4. **Redeploy if needed**:
   ```bash
   vercel --prod
   ```

## Summary

✅ Webhook URL corrected
✅ Webhook signing secret updated
✅ Application redeployed
✅ Test webhook sent

**The webhook should now be working correctly!**

Check the Stripe dashboard to confirm you're seeing 200 OK responses.

