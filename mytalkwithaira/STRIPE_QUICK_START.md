# ⚡ Stripe Quick Start

## 🎯 What's Ready

✅ Stripe packages installed  
✅ Stripe configuration file created  
✅ Checkout API route ready  
✅ Webhook handler ready  
✅ Admin bypass system ready  
✅ Pricing page integrated  

---

## 🚀 Get Started in 5 Minutes

### 1. Get Stripe Keys (2 min)
```
1. Go to https://dashboard.stripe.com
2. Click Developers → API Keys
3. Copy pk_test_* and sk_test_*
```

### 2. Create Products (2 min)
```
1. Go to Products → Add Product
2. Create "Aira Pro" - $9.99/month
3. Create "Aira Premium" - $19.99/month
4. Copy both Price IDs (price_*)
```

### 3. Update .env.local (1 min)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_pro_id
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM=price_premium_id
STRIPE_WEBHOOK_SECRET=whsec_test_YOUR_SECRET
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Restart Dev Server
```bash
npm run dev
```

---

## 👥 Test Admin Accounts (No Payment!)

| Email | Password | Access |
|-------|----------|--------|
| `owner@aira.ai` | any | Premium (Owner) |
| `admin1@aira.ai` | any | Premium (Admin) |
| `admin2@aira.ai` | any | Premium (Admin) |

**How to use:**
1. Go to `/signup`
2. Enter admin email
3. Enter any password
4. ✅ Logged in with Premium access!

---

## 💳 Test Regular Checkout

1. Sign up with regular email
2. Go to `/pricing`
3. Click "Upgrade to Pro"
4. Use test card: `4242 4242 4242 4242`
5. Any future date, any CVC

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `lib/stripe.ts` | Stripe config & helpers |
| `app/api/stripe/checkout-session/route.ts` | Create checkout |
| `app/api/stripe/webhook/route.ts` | Handle events |
| `lib/auth-context.tsx` | Admin bypass logic |
| `app/checkout/page.tsx` | Stripe checkout UI |
| `app/pricing/page.tsx` | Pricing with Stripe |

---

## 🔄 Pricing Tiers

| Plan | Price | Limit |
|------|-------|-------|
| Free | $0 | 10 msgs/day |
| Pro | $9.99/mo | Unlimited |
| Premium | $19.99/mo | Unlimited + API |

---

## ✅ Checklist

- [ ] Get Stripe API keys
- [ ] Create Pro product ($9.99)
- [ ] Create Premium product ($19.99)
- [ ] Update `.env.local` with keys & price IDs
- [ ] Restart `npm run dev`
- [ ] Test with admin account (`admin1@aira.ai`)
- [ ] Test with regular account + test card
- [ ] Set up webhooks (optional for local testing)

---

## 🎉 You're Done!

Your Stripe integration is ready to go. Admin accounts bypass payment for testing!

