# ✅ Aira Deployment Checklist

## Pre-Deployment (Local)

### Code Quality
- [ ] Run `npm run build` - no errors
- [ ] Run `npm run lint` - no errors
- [ ] All TypeScript types are correct
- [ ] No console.error or console.warn in production code

### Environment Variables
- [ ] `.env.local` has all required variables
- [ ] `OPENAI_API_KEY` is valid
- [ ] `KV_REST_API_URL` and `KV_REST_API_TOKEN` are correct
- [ ] `LEMONSQUEEZY_WEBHOOK_SECRET` is set
- [ ] `NEXT_PUBLIC_APP_URL` is set to production domain

### Testing
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test chat functionality
- [ ] Test payment flow (use test card)
- [ ] Test dashboard updates after payment
- [ ] Test dark mode toggle
- [ ] Test mobile responsiveness

### Git
- [ ] All changes committed
- [ ] No uncommitted files
- [ ] Ready to push to main branch

## Vercel Setup

### Create Vercel Account
- [ ] Sign up at https://vercel.com
- [ ] Connect GitHub account
- [ ] Authorize Vercel to access repositories

### Import Project
- [ ] Click "Add New" → "Project"
- [ ] Select your repository
- [ ] Click "Import"

### Configure Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

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
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

- [ ] All variables added
- [ ] No typos in variable names
- [ ] Sensitive values are correct

### Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Verify deployment succeeded

## Post-Deployment

### Verify Deployment
- [ ] Visit your Vercel URL
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] Dark mode works
- [ ] Mobile responsive

### Configure Custom Domain (Optional)
- [ ] Add domain in Vercel Settings → Domains
- [ ] Update DNS records
- [ ] Wait for SSL certificate (usually instant)
- [ ] Update `NEXT_PUBLIC_APP_URL` to custom domain
- [ ] Redeploy

### Update Lemonsqueezy Webhook
- [ ] Go to Lemonsqueezy Dashboard
- [ ] Settings → Webhooks
- [ ] Update webhook URL to: `https://your-domain.com/api/webhooks/lemonsqueezy`
- [ ] Verify webhook is active

### Test Production
- [ ] Sign up with new email
- [ ] Login
- [ ] Test chat
- [ ] Go to pricing
- [ ] Click upgrade
- [ ] Complete Lemonsqueezy checkout
- [ ] Verify plan updates on dashboard
- [ ] Check for any errors in Vercel logs

### Monitor
- [ ] Check Vercel Analytics
- [ ] Monitor error logs
- [ ] Set up alerts (optional)

## Maintenance Mode Setup

### Option 1: Show "Application Received" Message
- [ ] Maintenance page already created at `/maintenance`
- [ ] Redirect root to maintenance (see DEPLOYMENT_GUIDE.md)
- [ ] Test that `/maintenance` shows the message
- [ ] Verify other pages still work (for admins)

### Option 2: Keep App Live
- [ ] Skip maintenance mode setup
- [ ] App is ready for users

## Rollback Plan

If deployment has issues:
- [ ] Go to Vercel Dashboard
- [ ] Click "Deployments"
- [ ] Find previous successful deployment
- [ ] Click "Promote to Production"

## Success Criteria

✅ Deployment is successful when:
- [ ] App loads at your domain
- [ ] All pages are accessible
- [ ] Chat works with OpenAI
- [ ] Payments process through Lemonsqueezy
- [ ] User plans update after payment
- [ ] No errors in Vercel logs
- [ ] Mobile version works
- [ ] Dark mode works

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Lemonsqueezy Docs: https://docs.lemonsqueezy.com
- OpenAI Docs: https://platform.openai.com/docs

## Notes

- First deployment may take 5-10 minutes
- Subsequent deployments are faster
- Vercel provides free SSL certificate
- Automatic deployments on git push to main
- Can rollback to any previous deployment

