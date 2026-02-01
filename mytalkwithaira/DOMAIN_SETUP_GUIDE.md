# Setting Up airasupport.com Domain - Complete Guide

## 🎯 Overview

This is your complete, step-by-step guide to purchasing and setting up `airasupport.com` for Aira. I'll walk you through everything from buying the domain to making it live.

**No technical experience needed - just follow along!**

---

## 📋 Complete Step-by-Step Setup

### Step 1: Purchase the Domain airasupport.com

I'll walk you through purchasing from **Namecheap** (recommended for ease of use and price).

#### **Option A: GoDaddy (Great Price!)**

**Why GoDaddy?**
- ✅ Often has promotional pricing (cheaper first year)
- ✅ Well-known and reliable
- ✅ Easy DNS management
- ✅ 24/7 customer support
- ✅ Works perfectly with Vercel

**Steps to Purchase:**

1. **Go to GoDaddy**
   - Visit: https://www.godaddy.com
   - Click "Sign In" (top right) if you have an account, or continue as guest

2. **Search for the Domain**
   - In the search box at the top, type: `airasupport.com`
   - Click the search button (magnifying glass)

3. **Add to Cart**
   - You should see "airasupport.com" with a price (often $0.99-$2.99 first year!)
   - Click "Add to Cart" or "Select" button
   - Click "Continue to Cart"

4. **Configure Domain Settings**
   - **Domain Registration:** 1 year (you can choose more if you want)
   - **Domain Privacy:** ⚠️ **IMPORTANT** - GoDaddy charges extra for this (~$10/year)
     - You can skip it to save money (your info will be public in WHOIS)
     - OR add it for privacy protection
   - **Auto-Renew:** Your choice (I recommend enabling it)
   - **Email:** Skip for now (you can add later)

5. **Review & Checkout**
   - Review your cart
   - **Watch out for upsells** - GoDaddy will try to sell you extra services
   - Uncheck anything you don't need (email, website builder, SSL, etc.)
   - Click "Proceed to Checkout"

6. **Create Account (if new)**
   - Enter your email and create a password
   - Fill in billing information
   - Enter payment details (credit/debit card or PayPal)

7. **Complete Purchase**
   - Review order one more time
   - Click "Complete Purchase"
   - You'll receive an email confirmation

8. **Access Your Domain**
   - Go to: https://account.godaddy.com
   - Click "My Products"
   - You should see "airasupport.com" listed

**💰 Cost:** ~$0.99-$2.99 first year (renews at ~$17.99/year)
**⏱️ Time:** 10 minutes

**⚠️ GoDaddy Tips:**
- First year is cheap, renewal is more expensive
- Domain privacy costs extra (~$10/year) - optional
- Decline all upsells (email, website builder, etc.)
- You only need the domain!

---

#### **Option B: Namecheap (Alternative)**

**Why Namecheap?**
- ✅ Consistent pricing (~$10-15/year)
- ✅ **FREE WHOIS privacy** (GoDaddy charges for this!)
- ✅ No aggressive upselling
- ✅ Great for beginners

**Steps to Purchase:**

1. **Go to Namecheap**
   - Visit: https://www.namecheap.com
   - Click "Sign Up" (top right)
   - Create account with your email and password

2. **Search for the Domain**
   - Type: `airasupport.com`
   - Click search

3. **Add to Cart**
   - Click "Add to Cart"
   - Click "View Cart"

4. **Configure & Checkout**
   - **WhoisGuard:** FREE - make sure it's enabled
   - Click "Confirm Order"
   - Enter payment details
   - Complete purchase

**💰 Cost:** ~$10-15/year (consistent pricing)
**⏱️ Time:** 10 minutes

---

#### **Option C: Other Registrars**

- **Google Domains** - https://domains.google (~$12/year)
- **Cloudflare** - https://www.cloudflare.com/products/registrar (~$9/year)

---

## 💡 **Which Should You Choose?**

| Feature | GoDaddy | Namecheap |
|---------|---------|-----------|
| **First Year Price** | $0.99-$2.99 ✅ | $10-15 |
| **Renewal Price** | $17.99/year | $10-15/year ✅ |
| **WHOIS Privacy** | $10/year extra | FREE ✅ |
| **Upselling** | Aggressive ⚠️ | Minimal ✅ |
| **DNS Management** | Easy ✅ | Easy ✅ |
| **Support** | 24/7 ✅ | 24/7 ✅ |
| **Works with Vercel** | Yes ✅ | Yes ✅ |

**My Recommendation:**
- **GoDaddy** if you want the cheapest first year and don't mind higher renewal
- **Namecheap** if you want consistent pricing and free privacy

**Both work perfectly with Vercel!** Choose based on price preference.

---

### Step 2: Add Domain to Vercel

Now that you own the domain, let's connect it to your Aira app on Vercel.

**Detailed Steps:**

1. **Open Vercel Dashboard**
   - Go to: https://vercel.com/dashboard
   - Log in if needed
   - You should see your project `v0-aira-web-app`

2. **Select Your Project**
   - Click on `v0-aira-web-app` project card
   - This opens your project dashboard

3. **Go to Domain Settings**
   - At the top, you'll see tabs: Overview, Deployments, Analytics, **Settings**, etc.
   - Click on **"Settings"** tab
   - In the left sidebar, click **"Domains"**

4. **Add Your Custom Domain**
   - You'll see a section "Add Domain"
   - In the input box, type: `airasupport.com`
   - Click **"Add"** button

   **What happens next:**
   - Vercel will check if the domain is available
   - It will show you DNS configuration instructions
   - **Don't close this page yet!** We'll need these instructions in Step 3

5. **Add www Subdomain (Recommended)**
   - Click **"Add"** button again
   - In the input box, type: `www.airasupport.com`
   - Click **"Add"** button

   **Why add www?**
   - Some people type www, some don't
   - Vercel will automatically redirect one to the other
   - Professional websites support both

6. **Review Configuration**
   - You should now see both domains listed:
     - `airasupport.com`
     - `www.airasupport.com`
   - Each will show a status (probably "Invalid Configuration" - that's normal!)
   - Each will have DNS instructions - **keep this page open!**

**⏱️ Time:** 3-5 minutes

**📸 What you should see:**
- Two domains listed in Vercel
- DNS configuration instructions for each
- Status showing "Invalid Configuration" or "Pending"

**✅ Checkpoint:** You've added the domains to Vercel. Next, we'll configure DNS!

---

### Step 3: Configure DNS Settings (Connect Domain to Vercel)

This is the most important step! We're going to tell your domain to point to Vercel.

**I'll show you BOTH methods - choose the one that works for you:**

---

#### **Method A: Using DNS Records (Recommended for Beginners)**

This method works with ALL registrars and gives you more control.

**What You Need to Add:**

Vercel will show you these exact records in the dashboard. Here's what they'll look like:

**For `airasupport.com` (root domain):**
```
Type: A
Name: @ (or leave blank, or just type "airasupport.com")
Value: 76.76.21.21
TTL: Auto (or 3600)
```

**For `www.airasupport.com`:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto (or 3600)
```

---

**Step-by-Step for GoDaddy:**

1. **Go to GoDaddy Dashboard**
   - Visit: https://account.godaddy.com
   - Log in
   - Click **"My Products"**

2. **Manage Your Domain**
   - Find `airasupport.com` in the list
   - Click the **"DNS"** button next to it
   - (Or click the three dots ••• and select "Manage DNS")

3. **You're Now in DNS Management**
   - You'll see a list of DNS records
   - Look for the "Records" section

4. **Add A Record (for airasupport.com)**
   - Scroll down to "Records" section
   - Click **"Add"** button
   - Fill in:
     - **Type:** Select "A" from dropdown
     - **Name:** Type `@` (this means root domain)
     - **Value:** Type `76.76.21.21`
     - **TTL:** Select "1 Hour" or "Custom: 600 seconds"
   - Click **"Save"** button

5. **Add CNAME Record (for www.airasupport.com)**
   - Click **"Add"** button again
   - Fill in:
     - **Type:** Select "CNAME" from dropdown
     - **Name:** Type `www`
     - **Value:** Type `cname.vercel-dns.com`
     - **TTL:** Select "1 Hour" or "Custom: 600 seconds"
   - Click **"Save"** button

6. **Remove Conflicting Records (Important!)**
   - Look for any existing A records with `@` (usually a "Parked" record)
   - Click the **pencil icon** or **trash icon** to edit/delete
   - **Delete** the parked A record (it points to GoDaddy's parking page)
   - Look for any existing CNAME records with `www`
   - Delete those too if they exist

7. **Verify Your Records**
   - You should now see:
     - `A | @ | 76.76.21.21 | 1 Hour`
     - `CNAME | www | cname.vercel-dns.com | 1 Hour`
   - Make sure there are no conflicting records

**⏱️ Time:** 5-10 minutes
**⏱️ Propagation Time:** 10 minutes to 24 hours (usually 30 minutes - 2 hours)

**📸 What you should see in GoDaddy:**
```
Type    Name    Value                   TTL
A       @       76.76.21.21            1 Hour
CNAME   www     cname.vercel-dns.com   1 Hour
```

---

**Step-by-Step for Namecheap:**

1. **Go to Namecheap Dashboard**
   - Visit: https://ap.www.namecheap.com/
   - Log in
   - Click "Domain List" in the left sidebar

2. **Manage Your Domain**
   - Find `airasupport.com` in the list
   - Click the **"Manage"** button next to it

3. **Go to Advanced DNS**
   - You'll see tabs at the top
   - Click on **"Advanced DNS"** tab

4. **Add A Record (for airasupport.com)**
   - Look for "Host Records" section
   - Click **"Add New Record"** button
   - Fill in:
     - **Type:** Select "A Record" from dropdown
     - **Host:** Type `@` (this means root domain)
     - **Value:** Type `76.76.21.21`
     - **TTL:** Select "Automatic" or "1 min"
   - Click the **green checkmark** to save

5. **Add CNAME Record (for www.airasupport.com)**
   - Click **"Add New Record"** button again
   - Fill in:
     - **Type:** Select "CNAME Record" from dropdown
     - **Host:** Type `www`
     - **Value:** Type `cname.vercel-dns.com`
     - **TTL:** Select "Automatic" or "1 min"
   - Click the **green checkmark** to save

6. **Remove Conflicting Records (Important!)**
   - Look for any existing A records or CNAME records with `@` or `www`
   - If you see a "Parking Page" A record, **delete it** (click the trash icon)
   - If you see any other conflicting records, **delete them**

7. **Save All Changes**
   - Make sure both records are saved
   - You should see:
     - `A Record | @ | 76.76.21.21`
     - `CNAME Record | www | cname.vercel-dns.com`

**⏱️ Time:** 5-10 minutes
**⏱️ Propagation Time:** 5 minutes to 24 hours (usually 10-30 minutes)

---

#### **Method B: Using Nameservers (Alternative - Simpler but Slower)**

This method lets Vercel manage ALL your DNS settings.

**Vercel Nameservers:**
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**Step-by-Step for Namecheap:**

1. **Go to Namecheap Dashboard**
   - Visit: https://ap.www.namecheap.com/
   - Click "Domain List"

2. **Manage Your Domain**
   - Find `airasupport.com`
   - Click **"Manage"**

3. **Change Nameservers**
   - Look for "Nameservers" section
   - It probably says "Namecheap BasicDNS" or "Namecheap PremiumDNS"
   - Click the dropdown and select **"Custom DNS"**

4. **Add Vercel Nameservers**
   - You'll see input boxes for nameservers
   - In the first box, type: `ns1.vercel-dns.com`
   - In the second box, type: `ns2.vercel-dns.com`
   - Click the **green checkmark** to save

5. **Confirm**
   - You'll see a confirmation message
   - Nameservers are now pointing to Vercel

**⏱️ Time:** 3-5 minutes
**⏱️ Propagation Time:** 24-48 hours (slower but more reliable)

---

**✅ Checkpoint:**
- You've added DNS records (Method A) OR changed nameservers (Method B)
- Now we wait for DNS to propagate (next step will show you how to check)

---

### Step 4: Wait for DNS Propagation & Verify

DNS changes take time to spread across the internet. Let's check if it's working!

**How Long to Wait:**
- **Method A (DNS Records):** 10 minutes to 24 hours (usually 30 minutes)
- **Method B (Nameservers):** 24-48 hours (usually 12-24 hours)

**Don't panic if it doesn't work immediately!** DNS propagation is normal.

---

#### **Check DNS Propagation (Easy Method)**

**Use DNSChecker.org:**

1. **Go to DNS Checker**
   - Visit: https://dnschecker.org

2. **Check A Record**
   - In the search box, type: `airasupport.com`
   - In the dropdown, select: **"A"**
   - Click **"Search"**

   **What you should see:**
   - Green checkmarks around the world
   - IP address: `76.76.21.21`
   - If you see red X's, wait longer and refresh

3. **Check CNAME Record**
   - In the search box, type: `www.airasupport.com`
   - In the dropdown, select: **"CNAME"**
   - Click **"Search"**

   **What you should see:**
   - Green checkmarks around the world
   - Value: `cname.vercel-dns.com`

**⏱️ Time:** 2 minutes (but check every 10-30 minutes until it's green)

---

#### **Check in Vercel Dashboard**

1. **Go Back to Vercel**
   - Visit: https://vercel.com/dashboard
   - Click on your project `v0-aira-web-app`
   - Go to Settings → Domains

2. **Check Domain Status**
   - Look at `airasupport.com` and `www.airasupport.com`
   - Status should change from "Invalid Configuration" to **"Valid Configuration"** ✅
   - If still invalid, wait longer and refresh the page

**⏱️ Time:** Check every 10-30 minutes

---

#### **Check by Visiting the Domain**

The ultimate test!

1. **Open a New Browser Tab**
   - Type: `https://airasupport.com`
   - Press Enter

2. **What Should Happen:**
   - ✅ Your Aira website loads!
   - ✅ You see the Aira homepage
   - ✅ Padlock icon shows (HTTPS is working)

3. **Test www Version**
   - Type: `https://www.airasupport.com`
   - Should redirect to `https://airasupport.com` (or vice versa)

**⏱️ Time:** 1 minute (once DNS has propagated)

---

**✅ Checkpoint:**
- DNS Checker shows green checkmarks
- Vercel shows "Valid Configuration"
- Website loads at https://airasupport.com
- If not working yet, **wait longer** - DNS can take up to 48 hours!

---

### Step 5: SSL Certificate (Automatic - Vercel Does This!)

Good news! Vercel automatically sets up HTTPS for you. You don't need to do anything!

**What Vercel Does Automatically:**
- ✅ Generates a free SSL certificate (from Let's Encrypt)
- ✅ Enables HTTPS on your domain
- ✅ Redirects HTTP to HTTPS automatically
- ✅ Renews the certificate before it expires

**How to Verify HTTPS is Working:**

1. **Visit Your Domain**
   - Go to: `https://airasupport.com`

2. **Check for Padlock Icon**
   - Look in the address bar (top left)
   - You should see a **padlock icon** 🔒
   - This means HTTPS is working!

3. **Click the Padlock (Optional)**
   - Click on the padlock icon
   - Click "Connection is secure"
   - Click "Certificate is valid"
   - You should see:
     - **Issued to:** airasupport.com
     - **Issued by:** Let's Encrypt

4. **Test HTTP Redirect**
   - Type: `http://airasupport.com` (no 's')
   - It should automatically redirect to `https://airasupport.com`

**⏱️ Time:** Automatic (happens within 1 hour of DNS propagation)

**⚠️ Troubleshooting:**
- If you see "Not Secure" warning, wait 30-60 minutes
- SSL certificate is generated AFTER DNS propagates
- Clear browser cache and try again
- Check Vercel dashboard for certificate status

**✅ Checkpoint:**
- Padlock icon appears in browser
- HTTPS works
- HTTP redirects to HTTPS

---

### Step 6: Update Environment Variables & Redeploy

We need to update any references to the old domain in your app.

**What Needs Updating:**
- Environment variables that reference URLs
- Stripe redirect URLs
- OAuth callback URLs (if any)

---

#### **Update Vercel Environment Variables**

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on `v0-aira-web-app` project
   - Click **"Settings"** tab
   - Click **"Environment Variables"** in left sidebar

2. **Check for URL Variables**
   - Look for any variables with URLs like:
     - `NEXT_PUBLIC_APP_URL`
     - `NEXT_PUBLIC_SITE_URL`
     - `NEXTAUTH_URL`
     - Any variable with `v0-aira-web-app.vercel.app`

3. **Update Each Variable**
   - Click the **three dots** (•••) next to the variable
   - Click **"Edit"**
   - Change the value to: `https://airasupport.com`
   - Click **"Save"**

4. **Common Variables to Update:**
   ```bash
   NEXT_PUBLIC_APP_URL=https://airasupport.com
   NEXT_PUBLIC_SITE_URL=https://airasupport.com
   NEXTAUTH_URL=https://airasupport.com
   ```

**⏱️ Time:** 5 minutes

---

#### **Update Stripe Settings (Important!)**

If you're using Stripe for payments, you need to update redirect URLs:

1. **Go to Stripe Dashboard**
   - Visit: https://dashboard.stripe.com
   - Log in

2. **Update Payment Links (if using)**
   - Go to: Products → Payment Links
   - Find your Aira Premium payment link
   - Click to edit
   - Update success URL to: `https://airasupport.com/checkout-success`
   - Save

3. **Update Webhook URLs**
   - Go to: Developers → Webhooks
   - Find your webhook endpoint
   - Update to: `https://airasupport.com/api/webhooks/stripe`
   - Save

**⏱️ Time:** 5 minutes

---

#### **Redeploy Your Application**

After updating environment variables, you need to redeploy:

1. **Go to Vercel Dashboard**
   - Click on `v0-aira-web-app` project
   - Click **"Deployments"** tab

2. **Trigger New Deployment**
   - Find the most recent deployment
   - Click the **three dots** (•••) on the right
   - Click **"Redeploy"**
   - Click **"Redeploy"** again to confirm

3. **Wait for Deployment**
   - Watch the deployment progress
   - Should take 1-3 minutes
   - Wait for "Ready" status ✅

**⏱️ Time:** 3-5 minutes

**✅ Checkpoint:**
- Environment variables updated
- Stripe URLs updated (if applicable)
- Application redeployed
- New domain is live!

---

### Step 7: Test Everything Thoroughly

Let's make sure everything works perfectly on your new domain!

**Complete Testing Checklist:**

#### **1. Test Main Pages**

Visit each page and make sure it loads:

- [ ] **Homepage:** https://airasupport.com
- [ ] **Chat:** https://airasupport.com/chat
- [ ] **Dashboard:** https://airasupport.com/dashboard
- [ ] **Blog:** https://airasupport.com/blog
- [ ] **Pricing:** https://airasupport.com/pricing
- [ ] **About:** https://airasupport.com/about
- [ ] **Support:** https://airasupport.com/support

**What to check:**
- ✅ Page loads without errors
- ✅ Images load correctly
- ✅ Styling looks correct
- ✅ No broken links

---

#### **2. Test Redirects**

- [ ] **www redirect:** Type `www.airasupport.com` → should redirect to `airasupport.com`
- [ ] **HTTP redirect:** Type `http://airasupport.com` → should redirect to `https://airasupport.com`
- [ ] **HTTPS works:** `https://airasupport.com` → should show padlock 🔒

---

#### **3. Test Authentication**

- [ ] **Sign Up:** Create a new test account
- [ ] **Log In:** Log in with test account
- [ ] **Log Out:** Log out successfully
- [ ] **Password Reset:** Test forgot password flow (if implemented)

**What to check:**
- ✅ Forms submit correctly
- ✅ Redirects work after login
- ✅ Session persists across pages

---

#### **4. Test Chat Functionality**

- [ ] **Open Chat:** Go to /chat
- [ ] **Send Message:** Type a message and send
- [ ] **Receive Response:** Aira responds correctly
- [ ] **Multiple Messages:** Have a conversation

**What to check:**
- ✅ Messages send and receive
- ✅ No API errors in console
- ✅ Chat history persists

---

#### **5. Test Dashboard Features**

- [ ] **Mood Tracker:** Log a mood
- [ ] **Affirmations:** View affirmations
- [ ] **Streaks:** Check streak system
- [ ] **Goals:** View daily goals
- [ ] **Emotional Graph:** View mood graph

**What to check:**
- ✅ Data saves correctly
- ✅ Visualizations load
- ✅ No database errors

---

#### **6. Test Blog**

- [ ] **Blog Listing:** https://airasupport.com/blog
- [ ] **Individual Post:** Click "Read Article" on any post
- [ ] **Related Posts:** Check related posts section
- [ ] **Navigation:** Back to blog works

**What to check:**
- ✅ All 6 blog posts load
- ✅ Images display
- ✅ Markdown renders correctly
- ✅ No 404 errors

---

#### **7. Test Payments (Critical!)**

- [ ] **Pricing Page:** https://airasupport.com/pricing
- [ ] **Subscribe Button:** Click "Subscribe Now"
- [ ] **Stripe Checkout:** Redirects to Stripe correctly
- [ ] **Success Page:** After payment, redirects to success page
- [ ] **Webhook:** Check if subscription updates in database

**What to check:**
- ✅ Stripe checkout loads
- ✅ Payment processes (use test card: 4242 4242 4242 4242)
- ✅ Redirects to correct success URL
- ✅ User plan updates to Premium

**⚠️ Important:** Make sure Stripe redirect URLs are updated!

---

#### **8. Test Mobile Responsiveness**

- [ ] **Open on Phone:** Visit https://airasupport.com on mobile
- [ ] **Test Navigation:** Menu works on mobile
- [ ] **Test Chat:** Chat interface works on mobile
- [ ] **Test Forms:** Login/signup work on mobile

**What to check:**
- ✅ Responsive design works
- ✅ No horizontal scrolling
- ✅ Buttons are tappable

---

#### **9. Check Browser Console**

- [ ] **Open Developer Tools:** Press F12
- [ ] **Check Console:** Look for errors (red text)
- [ ] **Check Network:** Look for failed requests (red)

**What to check:**
- ✅ No JavaScript errors
- ✅ No failed API calls
- ✅ No CORS errors

---

#### **10. Test Performance**

- [ ] **Page Load Speed:** Pages load quickly (< 3 seconds)
- [ ] **Lighthouse Score:** Run Lighthouse test (F12 → Lighthouse)
- [ ] **Mobile Speed:** Test on mobile device

**What to check:**
- ✅ Good performance scores
- ✅ Fast load times
- ✅ No performance warnings

---

**⏱️ Time:** 15-20 minutes for thorough testing

**✅ Final Checkpoint:**
- All pages load correctly
- Authentication works
- Chat works
- Payments work
- No errors in console
- Mobile works
- HTTPS enabled

**🎉 If everything passes, your domain is LIVE and READY!**

---

## 🔧 Troubleshooting Common Issues

### ❌ Issue 1: Domain Not Loading

**Symptoms:**
- "This site can't be reached"
- "DNS_PROBE_FINISHED_NXDOMAIN"
- Page doesn't load at all

**Possible Causes:**
- DNS hasn't propagated yet
- Incorrect DNS records
- Nameservers not updated

**Solutions:**

1. **Wait Longer**
   - DNS can take up to 48 hours
   - Check https://dnschecker.org every hour
   - Be patient!

2. **Verify DNS Records**
   - Go to Namecheap → Advanced DNS
   - Make sure you have:
     - A Record: `@` → `76.76.21.21`
     - CNAME Record: `www` → `cname.vercel-dns.com`
   - Delete any conflicting records

3. **Clear Browser Cache**
   - Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
   - Select "Cached images and files"
   - Click "Clear data"
   - Try again

4. **Try Different Browser**
   - Open incognito/private mode
   - Try a different browser
   - Try on mobile data (not WiFi)

---

### ❌ Issue 2: SSL Certificate Error / "Not Secure"

**Symptoms:**
- "Your connection is not private"
- "NET::ERR_CERT_COMMON_NAME_INVALID"
- No padlock icon

**Possible Causes:**
- DNS not fully propagated
- SSL certificate still provisioning
- Mixed content (HTTP resources on HTTPS page)

**Solutions:**

1. **Wait for DNS Propagation**
   - SSL certificate is generated AFTER DNS propagates
   - Wait 1-2 hours after DNS is working
   - Check Vercel dashboard for certificate status

2. **Check Vercel Dashboard**
   - Go to Settings → Domains
   - Look for "Valid Configuration" status
   - If it says "Invalid", DNS isn't propagated yet

3. **Force SSL Renewal**
   - In Vercel dashboard, remove the domain
   - Wait 5 minutes
   - Add the domain again
   - This forces a new SSL certificate

4. **Clear Browser SSL Cache**
   - Chrome: Type `chrome://net-internals/#hsts` in address bar
   - Enter `airasupport.com` and click "Delete"
   - Restart browser

---

### ❌ Issue 3: www Not Redirecting

**Symptoms:**
- `www.airasupport.com` doesn't redirect to `airasupport.com`
- Shows different content or error

**Solutions:**

1. **Add www to Vercel**
   - Make sure you added BOTH domains to Vercel:
     - `airasupport.com`
     - `www.airasupport.com`

2. **Check CNAME Record**
   - Go to Namecheap → Advanced DNS
   - Make sure you have:
     - CNAME Record: `www` → `cname.vercel-dns.com`

3. **Wait for Propagation**
   - www subdomain can take longer to propagate
   - Check https://dnschecker.org for `www.airasupport.com`

---

### ❌ Issue 4: Stripe Payments Not Working

**Symptoms:**
- Payment succeeds but user not upgraded
- Redirect goes to wrong URL
- Webhook errors

**Solutions:**

1. **Update Stripe Redirect URLs**
   - Go to Stripe Dashboard
   - Update success URL to: `https://airasupport.com/checkout-success`
   - Update cancel URL to: `https://airasupport.com/pricing`

2. **Update Webhook URL**
   - Go to Stripe → Developers → Webhooks
   - Update endpoint to: `https://airasupport.com/api/webhooks/stripe`
   - Make sure webhook is enabled

3. **Test Webhook**
   - In Stripe dashboard, send a test webhook
   - Check Vercel logs for errors
   - Make sure webhook secret is correct in environment variables

---

### ❌ Issue 5: Authentication Not Working

**Symptoms:**
- Can't log in
- Redirects to wrong page
- Session not persisting

**Solutions:**

1. **Update NEXTAUTH_URL**
   - Go to Vercel → Settings → Environment Variables
   - Update `NEXTAUTH_URL` to: `https://airasupport.com`
   - Redeploy application

2. **Update Supabase URLs**
   - Go to Supabase dashboard
   - Update redirect URLs to include `https://airasupport.com`

3. **Clear Cookies**
   - Clear browser cookies for the old domain
   - Log out and log back in

---

### ❌ Issue 6: Images Not Loading

**Symptoms:**
- Broken image icons
- Images show 404 errors

**Solutions:**

1. **Check Image URLs**
   - Make sure images use relative paths (e.g., `/images/logo.png`)
   - Or use full URLs with new domain

2. **Check Vercel Image Optimization**
   - Vercel automatically optimizes images
   - Make sure images are in the `public` folder

3. **Clear Cache**
   - Clear browser cache
   - Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

---

### ❌ Issue 7: API Endpoints Returning Errors

**Symptoms:**
- Chat not working
- Dashboard not loading data
- 500 or 404 errors

**Solutions:**

1. **Check Environment Variables**
   - Make sure all API keys are set in Vercel
   - Check OpenAI, Supabase, Redis keys

2. **Check Vercel Logs**
   - Go to Vercel → Deployments
   - Click on latest deployment
   - Click "Functions" tab
   - Look for error messages

3. **Redeploy**
   - Sometimes a fresh deployment fixes issues
   - Go to Deployments → Redeploy

---

### 🆘 Still Having Issues?

**Get Help:**

1. **Check Vercel Status**
   - Visit: https://www.vercel-status.com
   - Make sure Vercel isn't having issues

2. **Vercel Support**
   - Visit: https://vercel.com/support
   - Live chat available

3. **Namecheap Support**
   - Visit: https://www.namecheap.com/support
   - 24/7 live chat

4. **Check Vercel Logs**
   - Deployments → Click deployment → Runtime Logs
   - Look for specific error messages

5. **Community Help**
   - Vercel Discord: https://vercel.com/discord
   - Stack Overflow: Tag with `vercel` and `nextjs`

---

## 📝 Quick Reference Guide

### DNS Records for Namecheap

**A Record (Root Domain - airasupport.com):**
```
Type: A Record
Host: @
Value: 76.76.21.21
TTL: Automatic
```

**CNAME Record (www.airasupport.com):**
```
Type: CNAME Record
Host: www
Value: cname.vercel-dns.com
TTL: Automatic
```

### Vercel Nameservers (Alternative Method)

```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

### Important URLs

- **Namecheap Dashboard:** https://ap.www.namecheap.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **DNS Checker:** https://dnschecker.org
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Your New Domain:** https://airasupport.com

---

## ✅ Post-Setup Checklist

After your domain is live and working, complete these tasks:

### **Immediate Tasks:**

- [ ] **Test all functionality** (use checklist in Step 7)
- [ ] **Update Mind UK pitch documents** with new domain
  - Update `MIND_UK_COLLABORATION_PITCH.md`
  - Update `MIND_UK_EXECUTIVE_SUMMARY.md`
  - Update `MIND_UK_ONE_PAGER.md`
- [ ] **Update README files** with new domain
- [ ] **Update social media bios** (if you have accounts)
- [ ] **Update email signatures** with new domain

### **Marketing & SEO:**

- [ ] **Set up Google Search Console**
  - Visit: https://search.google.com/search-console
  - Add property: `airasupport.com`
  - Verify ownership
  - Submit sitemap

- [ ] **Set up Google Analytics** (if not already done)
  - Visit: https://analytics.google.com
  - Create property for `airasupport.com`
  - Add tracking code to your site

- [ ] **Update Open Graph tags** (for social sharing)
  - Update meta tags in `app/layout.tsx`
  - Use new domain in og:url tags

- [ ] **Create social media accounts**
  - Twitter: @airasupport
  - LinkedIn: Aira Support
  - Instagram: @airasupport
  - Use consistent branding

### **Professional Setup:**

- [ ] **Set up professional email** (highly recommended!)
  - Options: Google Workspace, Microsoft 365, Zoho
  - Create: hello@airasupport.com
  - Create: andrew@airasupport.com
  - Create: support@airasupport.com

- [ ] **Create email signature**
  ```
  Andrew Barrett
  Founder, Aira
  🌐 airasupport.com
  📧 andrew@airasupport.com
  💚 Your AI Mental Wellness Companion
  ```

- [ ] **Update business cards** (if you have them)

### **Legal & Compliance:**

- [ ] **Update Privacy Policy** with new domain
- [ ] **Update Terms of Service** with new domain
- [ ] **Update cookie consent** (if applicable)
- [ ] **Register with ICO** (UK data protection - if handling user data)

### **Monitoring:**

- [ ] **Set up uptime monitoring**
  - Use: UptimeRobot (free) or Pingdom
  - Get alerts if site goes down

- [ ] **Set up error tracking**
  - Use: Sentry or LogRocket
  - Track JavaScript errors

- [ ] **Monitor SSL certificate expiry**
  - Vercel auto-renews, but good to monitor
  - Use: SSL Labs (https://www.ssllabs.com/ssltest/)

### **Backup & Security:**

- [ ] **Enable Vercel deployment protection** (optional)
- [ ] **Set up automated backups** for database
- [ ] **Review security headers** in Vercel
- [ ] **Enable 2FA** on all accounts (Vercel, Namecheap, Stripe, etc.)

---

## 🎉 Congratulations! Your Domain is Live!

Once you've completed all the steps, your Aira platform will be live at:

# **🌐 https://airasupport.com**

---

## 🌟 What This Means for Aira

Your professional domain brings incredible benefits:

### **Credibility & Trust:**
- ✅ Professional appearance for Mind UK partnership
- ✅ Builds user trust and confidence
- ✅ Shows you're serious about the business
- ✅ Essential for NHS backing conversations

### **Branding & Marketing:**
- ✅ Easy to remember and share
- ✅ Looks great on business cards and pitches
- ✅ Better SEO and search rankings
- ✅ Professional email addresses (hello@airasupport.com)

### **User Experience:**
- ✅ Clean, simple URL
- ✅ HTTPS security (padlock icon)
- ✅ Fast loading with Vercel CDN
- ✅ Works on all devices

### **Business Growth:**
- ✅ Ready for partnerships (Mind UK, NHS)
- ✅ Professional image for investors
- ✅ Scalable infrastructure
- ✅ Foundation for future growth

---

## 📧 Recommended: Set Up Professional Email

**Why You Need Professional Email:**
- Makes you look professional in partnerships
- Essential for Mind UK communications
- Builds trust with users
- Separates personal and business email

**Best Options:**

### **1. Google Workspace (Recommended)**
- **Cost:** £4.60/user/month
- **Includes:** Gmail, Google Drive, Calendar, Meet
- **Setup:** https://workspace.google.com
- **Best for:** Professional businesses

### **2. Microsoft 365**
- **Cost:** £3.80/user/month
- **Includes:** Outlook, OneDrive, Teams, Office apps
- **Setup:** https://www.microsoft.com/microsoft-365
- **Best for:** If you prefer Microsoft tools

### **3. Zoho Mail**
- **Cost:** FREE for up to 5 users!
- **Includes:** Email, calendar, contacts
- **Setup:** https://www.zoho.com/mail
- **Best for:** Startups on a budget

**Email Addresses to Create:**
```
hello@airasupport.com       (General inquiries)
andrew@airasupport.com      (Your personal email)
support@airasupport.com     (User support)
partnerships@airasupport.com (Mind UK, NHS, etc.)
info@airasupport.com        (Alternative general)
```

---

## 📊 Summary: What You've Accomplished

✅ **Purchased** airasupport.com domain
✅ **Connected** domain to Vercel
✅ **Configured** DNS settings
✅ **Enabled** HTTPS with SSL certificate
✅ **Updated** environment variables
✅ **Tested** all functionality
✅ **Launched** professional website

**Total Time Invested:** 1-2 hours
**Total Cost:** ~$10-15/year for domain
**Value Created:** Immeasurable! 🚀

---

## 🎯 What's Next?

Now that your domain is live, focus on:

1. **Update Mind UK Pitch**
   - Replace all references to old domain
   - Use airasupport.com in all materials
   - Update contact information

2. **Set Up Professional Email**
   - Choose a provider (Google Workspace recommended)
   - Create andrew@airasupport.com
   - Update email signature

3. **Marketing & SEO**
   - Set up Google Search Console
   - Set up Google Analytics
   - Create social media accounts

4. **Reach Out to Mind UK**
   - Use your professional email
   - Reference your professional domain
   - Show them the live platform

5. **Continue Building**
   - Add more features
   - Collect user feedback
   - Iterate and improve

---

## 📞 Need Help?

**If you encounter any issues:**

### **Vercel Support:**
- Website: https://vercel.com/support
- Docs: https://vercel.com/docs/concepts/projects/domains
- Discord: https://vercel.com/discord

### **Namecheap Support:**
- Website: https://www.namecheap.com/support
- Live Chat: 24/7 available
- Knowledge Base: Extensive tutorials

### **DNS Tools:**
- DNS Checker: https://dnschecker.org
- What's My DNS: https://www.whatsmydns.net
- DNS Propagation: https://dnspropagation.com

### **SSL Tools:**
- SSL Labs: https://www.ssllabs.com/ssltest
- SSL Checker: https://www.sslshopper.com/ssl-checker.html

---

## 🙏 Final Thoughts

**Congratulations on taking this huge step!**

You now have a professional domain that will:
- Impress Mind UK and potential partners
- Build trust with users
- Support your growth and scaling
- Serve as the foundation for Aira's success

**This is a major milestone in your journey to make mental health support universal.**

---

## 📋 Quick Start Checklist

Use this checklist to track your progress:

- [ ] Step 1: Purchase airasupport.com ✅
- [ ] Step 2: Add domain to Vercel ✅
- [ ] Step 3: Configure DNS settings ✅
- [ ] Step 4: Wait for DNS propagation ✅
- [ ] Step 5: Verify HTTPS is working ✅
- [ ] Step 6: Update environment variables ✅
- [ ] Step 7: Test everything thoroughly ✅
- [ ] Post-Setup: Update pitch documents
- [ ] Post-Setup: Set up professional email
- [ ] Post-Setup: Set up Google Analytics
- [ ] Post-Setup: Create social media accounts
- [ ] Post-Setup: Reach out to Mind UK

---

**🌐 Your new domain: https://airasupport.com**

**💚 Making mental health support universal, one step at a time.**

**🚀 Good luck with your domain setup and your Mind UK partnership!**

---

*Last Updated: December 1, 2025*
*Created by: Andrew Barrett, Founder of Aira*

