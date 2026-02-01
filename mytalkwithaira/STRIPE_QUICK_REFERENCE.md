# 🚀 Stripe Quick Reference - Get Started in 10 Minutes

## 📋 Checklist

- [ ] Create Stripe account
- [ ] Get API keys (pk_test_ and sk_test_)
- [ ] Create Premium product (£8.99/month)
- [ ] Copy Price ID (price_...)
- [ ] Update .env.local with keys
- [ ] Test locally
- [ ] Add keys to Vercel
- [ ] Deploy to production

---

## 🔑 Required Environment Variables

```bash
# Get from: https://dashboard.stripe.com/test/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Get from: https://dashboard.stripe.com/test/products (after creating product)
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM=price_...

# Get from: https://dashboard.stripe.com/test/webhooks (after creating webhook)
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🎯 Quick Setup (5 Steps)

### 1. Create Stripe Account
👉 https://stripe.com → Sign up (free)

### 2. Get API Keys
👉 https://dashboard.stripe.com/test/apikeys
- Copy **Publishable key** (pk_test_...)
- Copy **Secret key** (sk_test_...)

### 3. Create Product
👉 https://dashboard.stripe.com/test/products → Add product
- Name: `Aira Premium`
- Price: `£8.99`
- Billing: `Monthly`
- Copy **Price ID** (price_...)

### 4. Update .env.local
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM=price_YOUR_PRICE_ID
```

### 5. Test It!
```bash
npm run dev
```
- Go to http://localhost:3000/pricing
- Click "Upgrade to Premium"
- Use test card: `4242 4242 4242 4242`

---

## 💳 Test Cards

| Card | Result |
|------|--------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0000 0000 0002` | ❌ Declined |
| `4000 0025 0000 3155` | 🔐 Requires 3D Secure |

**All test cards:**
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

---

## 🚀 Deploy to Vercel

### Add Environment Variables:
👉 https://vercel.com/your-project/settings/environment-variables

Add for **Production**:
1. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
2. `STRIPE_SECRET_KEY`
3. `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM`
4. `STRIPE_WEBHOOK_SECRET` (leave empty for now)

### Deploy:
```bash
vercel --prod
```

---

## 🔔 Set Up Webhooks (Production)

### 1. Create Webhook Endpoint
👉 https://dashboard.stripe.com/test/webhooks → Add endpoint

**URL**: `https://your-app.vercel.app/api/stripe/webhook`

**Events**:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_failed`

### 2. Copy Webhook Secret
- Copy the **Signing secret** (whsec_...)

### 3. Add to Vercel
```bash
vercel env add STRIPE_WEBHOOK_SECRET production
# Paste: whsec_YOUR_SECRET
```

### 4. Redeploy
```bash
vercel --prod
```

---

## 📊 Monitor Your Payments

- **Payments**: https://dashboard.stripe.com/test/payments
- **Subscriptions**: https://dashboard.stripe.com/test/subscriptions
- **Webhooks**: https://dashboard.stripe.com/test/webhooks
- **Customers**: https://dashboard.stripe.com/test/customers

---

## 🎯 User Flow

```
User clicks "Upgrade to Premium"
         ↓
Redirected to Stripe Checkout
         ↓
Enters payment details
         ↓
Completes payment
         ↓
Redirected back to dashboard
         ↓
Webhook updates user plan
         ↓
User has Premium access! 🎉
```

---

## 💰 Pricing & Fees

**Your Price**: £8.99/month
**Stripe Fee**: 1.5% + 20p
**You Keep**: ~£8.72 per subscription

**No monthly fees, no setup fees!**

---

## 🚨 Common Issues

### "Stripe price not configured"
✅ Set `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM` in environment variables

### "Invalid API Key"
✅ Check `STRIPE_SECRET_KEY` starts with `sk_test_`

### Webhook not working
✅ Check webhook URL is correct
✅ Verify `STRIPE_WEBHOOK_SECRET` is set
✅ Check Stripe Dashboard → Webhooks for errors

### Payment works but plan doesn't update
✅ Check webhook is configured
✅ Check server logs for errors
✅ Verify webhook secret is correct

---

## 🎉 Going Live

When ready for real payments:

1. **Complete Stripe verification**
   - Add business details
   - Add bank account

2. **Switch to Live Mode**
   - Get live keys (pk_live_, sk_live_)
   - Create live product
   - Update environment variables

3. **Create live webhook**
   - Use production URL
   - Get live webhook secret

4. **Test with real card** (small amount first!)

---

## 📞 Help & Resources

- **Full Setup Guide**: See `STRIPE_SETUP_INSTRUCTIONS.md`
- **Stripe Docs**: https://stripe.com/docs
- **Stripe Support**: https://support.stripe.com
- **Test Mode**: Free, unlimited testing

---

## ✨ What's Implemented

✅ Stripe checkout integration
✅ £8.99/month Premium subscription
✅ Automatic plan updates via webhooks
✅ Secure payment processing (PCI compliant)
✅ Test mode ready
✅ Production ready
✅ Error handling
✅ Loading states

---

**Ready to accept payments! 🚀**

See `STRIPE_SETUP_INSTRUCTIONS.md` for detailed step-by-step guide.

