# ✅ Stripe Setup Checklist

## Phase 1: Stripe Account Setup (5 minutes)

- [ ] Go to https://dashboard.stripe.com
- [ ] Sign up or log in
- [ ] Go to **Developers** → **API Keys**
- [ ] Copy **Publishable Key** (pk_test_...)
- [ ] Copy **Secret Key** (sk_test_...)

## Phase 2: Create Products (5 minutes)

### Pro Plan
- [ ] Go to **Products** → **Add Product**
- [ ] Name: `Aira Pro`
- [ ] Price: `$9.99`
- [ ] Billing: `Monthly`
- [ ] Copy **Price ID** (price_...)

### Premium Plan
- [ ] Go to **Products** → **Add Product**
- [ ] Name: `Aira Premium`
- [ ] Price: `$19.99`
- [ ] Billing: `Monthly`
- [ ] Copy **Price ID** (price_...)

## Phase 3: Environment Configuration (2 minutes)

- [ ] Open `.env.local`
- [ ] Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY`
- [ ] Add `STRIPE_SECRET_KEY=sk_test_YOUR_KEY`
- [ ] Add `NEXT_PUBLIC_STRIPE_PRICE_PRO=price_YOUR_PRO_ID`
- [ ] Add `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM=price_YOUR_PREMIUM_ID`
- [ ] Add `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- [ ] Save file

## Phase 4: Restart Development Server (1 minute)

- [ ] Stop current dev server (Ctrl+C)
- [ ] Run `npm run dev`
- [ ] Wait for compilation to complete

## Phase 5: Test Admin Accounts (No Payment!)

### Test Owner Account
- [ ] Go to http://localhost:3000/signup
- [ ] Email: `owner@aira.ai`
- [ ] Password: `test123` (or any password)
- [ ] Click Sign Up
- [ ] Verify logged in with Premium access
- [ ] Go to `/pricing`
- [ ] Verify "Current Plan" shows on Premium
- [ ] Logout

### Test Admin Account 1
- [ ] Go to http://localhost:3000/signup
- [ ] Email: `admin1@aira.ai`
- [ ] Password: `test123`
- [ ] Click Sign Up
- [ ] Verify logged in with Premium access
- [ ] Go to `/pricing`
- [ ] Verify "Current Plan" shows on Premium
- [ ] Logout

### Test Admin Account 2
- [ ] Go to http://localhost:3000/signup
- [ ] Email: `admin2@aira.ai`
- [ ] Password: `test123`
- [ ] Click Sign Up
- [ ] Verify logged in with Premium access
- [ ] Go to `/pricing`
- [ ] Verify "Current Plan" shows on Premium
- [ ] Logout

## Phase 6: Test Regular User Checkout

### Create Test User
- [ ] Go to http://localhost:3000/signup
- [ ] Email: `test@example.com`
- [ ] Password: `test123`
- [ ] Click Sign Up
- [ ] Verify logged in with Free plan

### Test Pro Upgrade
- [ ] Go to `/pricing`
- [ ] Click "Upgrade to Pro"
- [ ] Verify redirected to Stripe checkout
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Expiry: Any future date (e.g., 12/25)
- [ ] CVC: Any 3 digits (e.g., 123)
- [ ] Name: Any name
- [ ] Click "Pay"
- [ ] Verify success page

### Test Premium Upgrade
- [ ] Go to `/pricing`
- [ ] Click "Upgrade to Premium"
- [ ] Verify redirected to Stripe checkout
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Complete payment
- [ ] Verify success page

## Phase 7: Webhook Setup (Optional for Local Testing)

- [ ] Go to **Developers** → **Webhooks**
- [ ] Click **Add Endpoint**
- [ ] URL: `http://localhost:3000/api/stripe/webhook`
- [ ] Select events:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_failed`
- [ ] Copy **Signing Secret** (whsec_...)
- [ ] Add to `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`
- [ ] Restart dev server

## Phase 8: Verify Everything Works

- [ ] Admin accounts bypass payment ✅
- [ ] Regular users can checkout ✅
- [ ] Stripe test card works ✅
- [ ] Pricing page shows correct plans ✅
- [ ] Dashboard shows correct plan after upgrade ✅

## 🎉 All Done!

Your Stripe integration is complete and ready for testing!

---

## 📞 Troubleshooting

### Issue: "Invalid API Key"
**Solution:**
- Verify keys are correct in `.env.local`
- Make sure you're using TEST keys (pk_test_, sk_test_)
- Restart dev server

### Issue: "Price not configured"
**Solution:**
- Verify Price IDs in `.env.local`
- Check that products exist in Stripe Dashboard
- Make sure Price IDs start with `price_`

### Issue: Admin bypass not working
**Solution:**
- Check email exactly matches: `owner@aira.ai`, `admin1@aira.ai`, `admin2@aira.ai`
- Clear browser cache and localStorage
- Restart dev server

### Issue: Checkout redirects to pricing instead of Stripe
**Solution:**
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Verify `NEXT_PUBLIC_STRIPE_PRICE_PRO` and `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM` are set
- Restart dev server

---

## 📚 Documentation Files

- `STRIPE_SETUP_GUIDE.md` - Detailed setup instructions
- `STRIPE_QUICK_START.md` - Quick reference
- `STRIPE_IMPLEMENTATION_SUMMARY.md` - What was built
- `STRIPE_SETUP_CHECKLIST.md` - This file

