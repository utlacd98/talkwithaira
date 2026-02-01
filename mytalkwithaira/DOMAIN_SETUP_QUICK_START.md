# airasupport.com - Quick Start Guide

**⏱️ Total Time: 30-60 minutes (plus DNS propagation)**

---

## 🚀 7 Simple Steps to Get Your Domain Live

### Step 1: Buy the Domain (10 min)
1. Go to https://www.namecheap.com
2. Search for `airasupport.com`
3. Add to cart and checkout
4. **Cost:** ~$10-15/year

---

### Step 2: Add to Vercel (5 min)
1. Go to https://vercel.com/dashboard
2. Click your project `v0-aira-web-app`
3. Settings → Domains
4. Add `airasupport.com`
5. Add `www.airasupport.com`

---

### Step 3: Configure DNS (10 min)

**Go to Namecheap:**
1. Dashboard → Domain List → Manage
2. Advanced DNS tab
3. Add these records:

```
A Record:
- Host: @
- Value: 76.76.21.21

CNAME Record:
- Host: www
- Value: cname.vercel-dns.com
```

4. Delete any conflicting records
5. Save

---

### Step 4: Wait & Check (10-30 min)

**Check DNS Propagation:**
1. Go to https://dnschecker.org
2. Enter `airasupport.com`
3. Select "A" record
4. Wait for green checkmarks

**Check in Browser:**
- Visit https://airasupport.com
- Should load your site!

---

### Step 5: Verify HTTPS (Automatic)

**Check for Padlock:**
1. Visit https://airasupport.com
2. Look for 🔒 padlock icon in address bar
3. If not there, wait 30-60 minutes

---

### Step 6: Update Settings (10 min)

**Vercel Environment Variables:**
1. Settings → Environment Variables
2. Update any URLs to `https://airasupport.com`
3. Redeploy

**Stripe (if using):**
1. Update success URL
2. Update webhook URL

---

### Step 7: Test Everything (15 min)

**Test These:**
- [ ] Homepage loads
- [ ] Chat works
- [ ] Dashboard works
- [ ] Login/signup works
- [ ] Payments work
- [ ] Blog loads
- [ ] HTTPS enabled
- [ ] www redirects

---

## ✅ Done!

Your domain is live at: **https://airasupport.com**

---

## 🆘 Quick Troubleshooting

**Domain not loading?**
- Wait longer (DNS can take 24-48 hours)
- Check https://dnschecker.org
- Clear browser cache

**No HTTPS?**
- Wait 1-2 hours after DNS propagates
- Check Vercel dashboard for certificate status

**Payments not working?**
- Update Stripe redirect URLs
- Update webhook URL

---

## 📞 Need Help?

**Full Guide:** See `DOMAIN_SETUP_GUIDE.md` for detailed instructions

**Support:**
- Vercel: https://vercel.com/support
- Namecheap: https://www.namecheap.com/support
- DNS Checker: https://dnschecker.org

---

## 📋 Quick Checklist

- [ ] Purchase airasupport.com from Namecheap
- [ ] Add domain to Vercel
- [ ] Configure DNS (A record + CNAME)
- [ ] Wait for DNS propagation
- [ ] Verify HTTPS works
- [ ] Update environment variables
- [ ] Update Stripe URLs
- [ ] Test all functionality
- [ ] Update Mind UK pitch documents
- [ ] Set up professional email

---

**🎉 You've got this! Follow the steps and you'll be live in no time!**

