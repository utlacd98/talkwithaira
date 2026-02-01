# 🔧 Stripe Checkout Debugging Guide

## 🚨 Current Issue
Stripe checkout is failing with a **500 Internal Server Error** when clicking "Upgrade to Premium"

**Error in browser console:**
```
POST https://v0-aira-web-app.vercel.app/api/stripe/checkout-session
500 (Internal Server Error)
```

---

## ✅ What We've Done So Far

### 1. Environment Variables Set in Vercel Production
All environment variables are configured in Vercel:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your publishable key
- ✅ `STRIPE_SECRET_KEY` - Your secret key (sk_live_...)
- ✅ `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM` - `price_1SNNkkFaCeYGrunKw0Bm295H`
- ✅ `NEXT_PUBLIC_APP_URL` - Your app URL

**Verify with:**
```bash
vercel env ls production
```

### 2. Files Involved
- `/app/api/stripe/checkout-session/route.ts` - API endpoint that creates checkout session
- `/lib/stripe.ts` - Stripe configuration and initialization
- `/components/pricing-card.tsx` - Frontend component that calls the API

### 3. Recent Changes
- Updated Stripe API version from `2024-11-20.acacia` to `2024-10-28.acacia`
- Deployed multiple times to ensure env vars are loaded

---

## 🔍 Tomorrow's Debugging Steps

### Step 1: Check Vercel Function Logs
The 500 error means the server-side function is crashing. Check the logs:

```bash
# Get the latest deployment URL
vercel ls --prod

# Check logs for the latest deployment (copy the deployment URL from above)
vercel logs <deployment-url>
```

**What to look for:**
- `Missing STRIPE_SECRET_KEY environment variable` - means env var not loaded
- Stripe API errors - might be API version mismatch
- Any other error messages

### Step 2: Verify Environment Variables Are Loaded
Add debug logging to see what's actually available:

**Edit `/app/api/stripe/checkout-session/route.ts`** - Add at line 10:
```typescript
export async function POST(req: NextRequest) {
  try {
    // DEBUG: Check if env vars are loaded
    console.log("[DEBUG] STRIPE_SECRET_KEY exists:", !!process.env.STRIPE_SECRET_KEY)
    console.log("[DEBUG] STRIPE_SECRET_KEY starts with:", process.env.STRIPE_SECRET_KEY?.substring(0, 7))
    console.log("[DEBUG] NEXT_PUBLIC_STRIPE_PRICE_PREMIUM:", process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM)
    
    const { email, userId, name } = await req.json()
    // ... rest of code
```

Then redeploy and check logs again.

### Step 3: Test Stripe API Key Directly
Verify your Stripe secret key works by testing it locally:

**Create a test file `test-stripe.js`:**
```javascript
const Stripe = require('stripe');
const stripe = new Stripe('sk_live_YOUR_SECRET_KEY_HERE', {
  apiVersion: '2024-10-28.acacia',
});

async function test() {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: 'price_1SNNkkFaCeYGrunKw0Bm295H',
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: 'https://mytalkwithaira.vercel.app/dashboard',
      cancel_url: 'https://mytalkwithaira.vercel.app/pricing',
    });
    console.log('✅ Success! Session ID:', session.id);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
```

Run with: `node test-stripe.js`

**If this fails:**
- Your Stripe key might be invalid
- The price ID might be wrong
- Your Stripe account might need activation

### Step 4: Check Stripe Dashboard
1. Go to https://dashboard.stripe.com/
2. Check if your account is in **Test Mode** or **Live Mode**
3. Verify the price ID `price_1SNNkkFaCeYGrunKw0Bm295H` exists
4. Check if there are any API errors logged in Stripe

### Step 5: Verify Price ID
The price ID should match your £8.99/month subscription:

```bash
# In Stripe Dashboard:
# Products → Your Premium Product → Pricing
# Copy the Price ID and verify it matches: price_1SNNkkFaCeYGrunKw0Bm295H
```

### Step 6: Check API Version Compatibility
Stripe package version: `^19.1.0`
API version in code: `2024-10-28.acacia`

**Try updating to latest stable API version:**
```typescript
// In lib/stripe.ts, line 20
apiVersion: "2024-12-18.acacia", // Latest version
```

Or remove the `.acacia` suffix:
```typescript
apiVersion: "2024-10-28",
```

---

## 🔑 Quick Reference

### Your Stripe Configuration
- **Price ID:** `price_1SNNkkFaCeYGrunKw0Bm295H`
- **Amount:** £8.99/month
- **Currency:** GBP
- **Mode:** Subscription

### Deployment Commands
```bash
# Deploy to production
vercel --prod

# Force redeploy
vercel --prod --force

# Check environment variables
vercel env ls production

# View logs
vercel logs <deployment-url>
```

### Files to Check
1. `mytalkwithaira/lib/stripe.ts` - Stripe initialization
2. `mytalkwithaira/app/api/stripe/checkout-session/route.ts` - API endpoint
3. `mytalkwithaira/components/pricing-card.tsx` - Frontend button

---

## 🎯 Most Likely Issues

### Issue 1: Environment Variable Not Loading
**Symptom:** Error says "Missing STRIPE_SECRET_KEY"
**Fix:** 
- Verify env var is set: `vercel env ls production`
- Redeploy: `vercel --prod --force`
- Check it's not in `.env.local` only (needs to be in Vercel)

### Issue 2: Wrong Stripe API Key
**Symptom:** Stripe API returns authentication error
**Fix:**
- Verify you're using the **live** key (starts with `sk_live_`)
- Check the key in Stripe Dashboard → Developers → API Keys
- Make sure you copied the full key without spaces

### Issue 3: Invalid Price ID
**Symptom:** Error about invalid price or product
**Fix:**
- Go to Stripe Dashboard → Products
- Find your Premium product
- Copy the exact Price ID
- Update `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM` in Vercel

### Issue 4: Stripe Account Not Activated
**Symptom:** Can't create checkout sessions in live mode
**Fix:**
- Complete Stripe account activation
- Or use test mode keys for testing (starts with `sk_test_`)

---

## 🚀 Quick Start Tomorrow

1. **Check logs first:**
   ```bash
   vercel ls --prod
   vercel logs <latest-deployment-url>
   ```

2. **Add debug logging** (see Step 2 above)

3. **Test Stripe key locally** (see Step 3 above)

4. **Check Stripe Dashboard** for any issues

5. **Report back** what you find in the logs!

---

## 📞 Support Resources

- **Stripe API Docs:** https://stripe.com/docs/api
- **Stripe Checkout Docs:** https://stripe.com/docs/payments/checkout
- **Vercel Env Vars:** https://vercel.com/docs/environment-variables
- **Next.js API Routes:** https://nextjs.org/docs/app/building-your-application/routing/route-handlers

---

## 💡 Alternative: Use Stripe Test Mode First

If you want to test without using live keys:

1. Get **test mode** keys from Stripe Dashboard (toggle to Test Mode)
2. Create a **test price** in test mode
3. Use test keys in Vercel:
   - `STRIPE_SECRET_KEY` = `sk_test_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_test_...`
   - `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM` = test price ID

This way you can debug without affecting real payments!

---

**Good luck tomorrow! 🌟**

