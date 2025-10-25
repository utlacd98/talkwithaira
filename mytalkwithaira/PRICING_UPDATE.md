# ✅ Pricing Tiers Updated

## New Pricing Structure

### Free Plan
- **Price**: £0 (forever)
- **Features**:
  - 10 chats/day
  - Mood tracker (manual)
  - Basic responses
- **Ideal for**: Getting started with Aira

### Aira Plus
- **Monthly**: £4.99/month
- **Yearly**: £49.99/year (save 15%)
- **Features**:
  - Unlimited chats
  - Mood tracking & progress graph
  - Dark mode
  - Reflection & gratitude prompts
- **Ideal for**: Everyday users & journaling fans

### Aira Premium
- **Monthly**: £8.99/month
- **Yearly**: £89.99/year (save 20%)
- **Features**:
  - Everything in Plus
  - Advanced mood insights (AI analysis)
  - Personalized affirmations
  - Multi-language chat
  - Priority support
  - Early access to new Aira features
- **Ideal for**: Power users wanting advanced features

---

## Files Updated

### 1. **lib/stripe.ts**
- Updated `STRIPE_PRICES` configuration
- Changed from `pro` to `plus` plan
- Added support for monthly and yearly billing
- Updated currency to GBP (£)
- Updated helper functions to support billing periods

### 2. **app/pricing/page.tsx**
- Updated plan details with new names and prices
- Added billing toggle (Monthly/Yearly)
- Updated features list for each tier
- Added yearly discount badges
- Updated plan IDs from `pro` to `plus`

### 3. **app/checkout/page.tsx**
- Updated plan details with GBP pricing
- Added support for monthly/yearly billing selection
- Updated display to show correct prices based on billing period
- Updated button text to show selected price

### 4. **app/api/stripe/checkout-session/route.ts**
- Updated plan validation to accept `plus` instead of `pro`
- Added billing period parameter
- Updated metadata to include billing period
- Updated URLs to use port 3001

### 5. **lib/auth-context.tsx**
- Updated User interface to use `"free" | "plus" | "premium"`
- Updated login/signup functions to use new plan names
- Admin accounts still get "premium" access

### 6. **components/settings/settings-content.tsx**
- Updated plan details with new names and GBP pricing
- Updated feature descriptions

### 7. **components/dashboard/dashboard-content.tsx**
- Updated plan display to show new plan names

### 8. **.env.local**
- Updated Stripe price environment variables:
  - `NEXT_PUBLIC_STRIPE_PRICE_PLUS_MONTHLY`
  - `NEXT_PUBLIC_STRIPE_PRICE_PLUS_YEARLY`
  - `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY`
  - `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY`
- Added `NEXT_PUBLIC_APP_URL=http://localhost:3001`

---

## Next Steps

1. **Create Stripe Products & Prices**:
   - Log in to https://dashboard.stripe.com
   - Create "Aira Plus" product with:
     - Monthly price: £4.99
     - Yearly price: £49.99
   - Create "Aira Premium" product with:
     - Monthly price: £8.99
     - Yearly price: £89.99

2. **Update Environment Variables**:
   - Get the price IDs from Stripe Dashboard
   - Update `.env.local` with the actual price IDs:
     ```env
     NEXT_PUBLIC_STRIPE_PRICE_PLUS_MONTHLY=price_xxxxx
     NEXT_PUBLIC_STRIPE_PRICE_PLUS_YEARLY=price_xxxxx
     NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY=price_xxxxx
     NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY=price_xxxxx
     ```

3. **Test the Pricing Page**:
   - Visit http://localhost:3001/pricing
   - Toggle between Monthly/Yearly
   - Test admin bypass with:
     - owner@aira.ai
     - admin1@aira.ai
     - admin2@aira.ai
   - Test regular checkout flow

4. **Test Stripe Checkout**:
   - Use Stripe test card: 4242 4242 4242 4242
   - Any future expiry date
   - Any 3-digit CVC

---

## Admin Bypass

The following accounts automatically get **Aira Premium** access without payment:
- `owner@aira.ai` (Owner role)
- `admin1@aira.ai` (Admin role)
- `admin2@aira.ai` (Admin role)

Just sign up with these emails to test premium features!

---

## Currency

All prices are now in **GBP (£)** instead of USD ($).

