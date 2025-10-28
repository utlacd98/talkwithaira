# 🚀 Vercel Redis Setup - Enable Conversation Tracking

## ⚠️ Current Status

**Dashboard is working** but showing default stats (0 conversations) because Redis is not configured in Vercel.

**Chats are saving** to fallback storage, but stats are not being tracked.

---

## 📋 What You Need to Do

Add **3 environment variables** to Vercel to enable real conversation tracking.

---

## 🔧 Step-by-Step Instructions

### **Step 1: Go to Vercel Dashboard**

1. Visit: https://vercel.com/dashboard
2. Click on your project: **v0-aira-web-app**
3. Click **Settings** (top navigation)
4. Click **Environment Variables** (left sidebar)

---

### **Step 2: Add Environment Variables**

Click **"Add New"** and add these **3 variables**:

#### **Variable 1: KV_REST_API_URL**
- **Key:** `KV_REST_API_URL`
- **Value:** `https://redis-11465.crce204.eu-west-2-3.ec2.redns.redis-cloud.com:11465`
- **Environment:** Select all (Production, Preview, Development)
- Click **Save**

#### **Variable 2: KV_REST_API_TOKEN**
- **Key:** `KV_REST_API_TOKEN`
- **Value:** `HRMXBiC0047dBKYXDlgY7jtmhVfrb2bg`
- **Environment:** Select all (Production, Preview, Development)
- Click **Save**

#### **Variable 3: KV_REST_API_READ_ONLY_TOKEN**
- **Key:** `KV_REST_API_READ_ONLY_TOKEN`
- **Value:** `HRMXBiC0047dBKYXDlgY7jtmhVfrb2bg`
- **Environment:** Select all (Production, Preview, Development)
- Click **Save**

---

### **Step 3: Redeploy Your App**

After adding all 3 variables:

1. Go to **Deployments** tab (top navigation)
2. Find the **latest deployment** (top of the list)
3. Click the **"..."** menu (three dots) on the right
4. Click **"Redeploy"**
5. **IMPORTANT:** Uncheck **"Use existing Build Cache"**
6. Click **"Redeploy"** button

---

### **Step 4: Wait for Deployment**

- Deployment takes **2-3 minutes**
- You'll see a progress bar
- Wait for **"Deployment Ready"** message

---

### **Step 5: Test Conversation Tracking**

1. **Visit your app:** https://v0-aira-web-app.vercel.app
2. **Login** to your account
3. **Go to chat** and have a conversation
4. **Click "Save"** button (top right)
5. **Go to Dashboard**
6. **Check stats:**
   - Conversations should show **1** (or more)
   - Recent Conversations should show your saved chat

---

## ✅ What This Fixes

### **Before (Current State):**
- ❌ Dashboard shows 0 conversations (default)
- ❌ Chats save but don't increment counter
- ❌ Recent conversations don't appear
- ❌ Stats don't persist

### **After (With Redis Configured):**
- ✅ Dashboard shows real conversation count
- ✅ Chats increment the counter
- ✅ Recent conversations appear on dashboard
- ✅ Stats persist across sessions
- ✅ Mood tracking works
- ✅ Days active tracking works

---

## 🔍 How to Verify It's Working

### **Check Vercel Logs:**
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **"View Function Logs"**
4. Look for messages like:
   - `[Redis] Incremented conversations for user: xxx`
   - `[Redis] Added recent conversation for user: xxx`
   - `[Dashboard API] Retrieved existing stats for user: xxx`

### **Check Dashboard:**
1. Visit: https://v0-aira-web-app.vercel.app/dashboard
2. You should see:
   - **Conversations:** Real count (not 0)
   - **Recent Conversations:** List of your chats
   - **Mood Score:** Your tracked mood
   - **Days Active:** Days since signup

---

## 🆘 Troubleshooting

### **Stats still showing 0 after adding variables:**
1. Make sure you **redeployed** after adding variables
2. Make sure you **unchecked "Use existing Build Cache"**
3. Wait 2-3 minutes for deployment to complete
4. **Hard refresh** the page (Ctrl+Shift+R or Cmd+Shift+R)

### **"Redis not configured" message:**
1. Check that all 3 variables are added
2. Check that variable names are **exactly** as shown (case-sensitive)
3. Check that you selected **all environments** (Production, Preview, Development)
4. Redeploy without cache

### **Deployment fails:**
1. Check Vercel logs for errors
2. Make sure variable values don't have extra spaces
3. Try redeploying again

---

## 📊 What Gets Tracked

Once Redis is configured, these stats are tracked:

1. **Conversations Count** - Total number of saved chats
2. **Recent Conversations** - Last 3 saved chats with timestamps
3. **Mood Score** - Average mood from conversations
4. **Days Active** - Days since account creation
5. **Last Active** - Last time you used the app

---

## 🎯 Next Steps

After Redis is working:

1. **Test the dashboard** - Make sure stats are updating
2. **Save multiple chats** - See the counter increment
3. **Check recent conversations** - Should show last 3 chats
4. **Update mood** - Use the mood slider on dashboard
5. **Monitor usage** - Track your mental health journey

---

## 💡 Why This Is Important

**Without Redis:**
- Chats save to temporary storage
- Stats reset on every deployment
- No conversation history tracking
- Dashboard shows default values

**With Redis:**
- Chats save to persistent database
- Stats persist across deployments
- Full conversation history
- Real-time dashboard updates
- Better user experience

---

## 🔐 Security Note

The Redis credentials in this guide are for **development/testing only**.

For production, you should:
1. Create a new Redis instance
2. Use strong passwords
3. Enable SSL/TLS
4. Restrict IP access
5. Rotate credentials regularly

---

## ✨ Summary

**What to do:**
1. Add 3 environment variables to Vercel
2. Redeploy without cache
3. Test by saving a chat
4. Check dashboard for updated stats

**Time required:** 5 minutes

**Difficulty:** Easy ⭐

---

Need help? Check the Vercel logs or ask for assistance!

