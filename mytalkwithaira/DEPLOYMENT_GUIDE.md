# 🚀 Aira Deployment Guide

## Quick Start - Deploy to Vercel

Aira is built with Next.js and is optimized for deployment on Vercel.

### Step 1: Prepare Your Repository

```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# For production
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub/GitLab/Bitbucket
3. Click "Add New..." → "Project"
4. Select your repository
5. Click "Import"
6. Configure environment variables (see below)
7. Click "Deploy"

### Step 3: Configure Environment Variables

In Vercel Dashboard, go to **Settings → Environment Variables** and add:

```
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_OPENAI_MODEL=gpt-4o-mini
KV_REST_API_URL=https://redis-...
KV_REST_API_TOKEN=...
CHAT_ENCRYPTION_KEY=...
NEXT_PUBLIC_LEMONSQUEEZY_API_KEY=...
NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID=223935
NEXT_PUBLIC_LEMONSQUEEZY_PRODUCT_PLUS=210ff3d5-eb49-43ba-b978-e058d4ebe18c
NEXT_PUBLIC_LEMONSQUEEZY_PRODUCT_PREMIUM=e7292301-241d-4944-b1a6-d386971c0922
NEXT_PUBLIC_LEMONSQUEEZY_PRODUCT_FREE=6a10594e-291b-46ee-a803-b417ac86b8d7
LEMONSQUEEZY_WEBHOOK_SECRET=...
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Step 4: Update Lemonsqueezy Webhook

1. Go to [Lemonsqueezy Dashboard](https://app.lemonsqueezy.com)
2. Settings → Webhooks
3. Update webhook URL to: `https://your-domain.com/api/webhooks/lemonsqueezy`
4. Copy the webhook secret and add to `LEMONSQUEEZY_WEBHOOK_SECRET`

### Step 5: Update App URL

Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables to your production domain.

## Maintenance Mode

To show the "Application Received" message:

### Option 1: Redirect Root to Maintenance Page

Edit `app/page.tsx` and replace the content with:

```typescript
import { redirect } from "next/navigation"

export default function HomePage() {
  redirect("/maintenance")
}
```

### Option 2: Use Middleware (Advanced)

Create `middleware.ts` in the root:

```typescript
import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/maintenance", request.url))
  }
}

export const config = {
  matcher: ["/"],
}
```

### Option 3: Environment Variable Toggle

Add to `.env.local`:

```
NEXT_PUBLIC_MAINTENANCE_MODE=true
```

Then in `app/page.tsx`:

```typescript
import { redirect } from "next/navigation"

export default function HomePage() {
  if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true") {
    redirect("/maintenance")
  }
  // ... rest of page
}
```

## Deployment Checklist

- [ ] All environment variables configured in Vercel
- [ ] Lemonsqueezy webhook URL updated
- [ ] OpenAI API key is valid and has sufficient credits
- [ ] Redis/KV connection is working
- [ ] Domain is configured (if using custom domain)
- [ ] SSL certificate is active
- [ ] Maintenance page is ready (if needed)
- [ ] Test payment flow in production
- [ ] Monitor logs for errors

## Post-Deployment

### Monitor Your App

```bash
# View logs
vercel logs

# View real-time logs
vercel logs --follow
```

### Test Payment Flow

1. Sign up with test email
2. Go to pricing page
3. Click upgrade
4. Complete Lemonsqueezy checkout
5. Verify plan updates on dashboard

### Enable Analytics

Vercel Analytics is already configured via `@vercel/analytics`.

## Troubleshooting

### Build Fails

```bash
# Check for TypeScript errors
npm run build

# Check for linting errors
npm run lint
```

### Environment Variables Not Working

- Verify variables are set in Vercel Dashboard
- Redeploy after adding variables
- Check that variable names match exactly

### Webhook Not Triggering

- Verify webhook URL in Lemonsqueezy
- Check webhook secret matches
- View logs: `vercel logs`

### Payment Not Updating

- Check Redis connection
- Verify user registry file exists: `.data/user-registry.json`
- Check webhook logs in Lemonsqueezy dashboard

## Rollback

If something goes wrong:

```bash
# View deployment history
vercel list

# Rollback to previous deployment
vercel rollback
```

## Custom Domain

1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable

## Performance Tips

- Enable Vercel Analytics (already configured)
- Use Vercel Edge Functions for API routes (optional)
- Enable Image Optimization (automatic)
- Monitor Core Web Vitals in Vercel Dashboard

## Support

For deployment issues:
- Check Vercel documentation: https://vercel.com/docs
- View logs: `vercel logs`
- Contact Vercel support: https://vercel.com/support

