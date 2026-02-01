# 📊 Analytics System - Complete Setup Guide

## Overview
Comprehensive analytics tracking system for Aira that monitors user metrics, engagement, and revenue in real-time.

---

## ✅ What's Been Implemented

### **1. Analytics Infrastructure** (`lib/analytics.ts`)
- User signup tracking
- User activity tracking (login, chat)
- Chat creation tracking
- Message tracking
- Subscription tracking
- Time-based metrics (daily, weekly, monthly)

### **2. Analytics API** (`app/api/analytics/route.ts`)
- Protected endpoint with API key authentication
- Comprehensive metrics aggregation
- Real-time data from Redis
- Calculated metrics (averages, MRR, etc.)

### **3. Event Tracking API** (`app/api/analytics/track/route.ts`)
- Track user signups
- Track user logins
- Track chat messages
- Track subscription changes
- Automatic activity tracking

### **4. Admin Dashboard** (`app/admin/analytics/page.tsx`)
- Beautiful UI with charts and metrics
- Real-time data refresh
- API key authentication
- Responsive design
- Key metrics cards
- Detailed breakdowns

### **5. Automatic Tracking Integration**
- ✅ Signup tracking in `lib/auth-context.tsx`
- ✅ Login tracking in `lib/auth-context.tsx`
- ✅ Message tracking in `app/api/chat/route.ts`
- ✅ Subscription tracking (ready for Stripe webhook)

---

## 📊 Metrics Tracked

### **User Metrics**
- Total users
- New users today/week/month
- Active users today/week/month
- Daily/Weekly/Monthly active users (DAU/WAU/MAU)

### **Usage Metrics**
- Total chats
- Chats today/week/month
- Total messages
- Messages today
- Average chats per user
- Average messages per chat

### **Revenue Metrics**
- Total subscribers
- Free users count
- Plus users count (£4.99/month)
- Premium users count (£2.99/month)
- Monthly Recurring Revenue (MRR)

### **Engagement Metrics**
- User retention
- Activity rates
- Usage patterns

---

## 🔑 Access the Analytics Dashboard

### **1. Set API Key**
Add to your `.env.local`:
```env
ANALYTICS_API_KEY=your-secure-api-key-here
```

**Default API Key** (for testing): `aira-admin-2024`

### **2. Access the Dashboard**
Navigate to: **https://airasupport.com/admin/analytics**

### **3. Login**
Enter your API key when prompted.

---

## 🚀 How It Works

### **Automatic Event Tracking**

#### **1. User Signup**
```typescript
// Automatically tracked in lib/auth-context.tsx
await fetch("/api/analytics/track", {
  method: "POST",
  body: JSON.stringify({ 
    userId: user.id, 
    event: "signup",
    plan: "free" 
  }),
})
```

#### **2. User Login**
```typescript
// Automatically tracked in lib/auth-context.tsx
await fetch("/api/analytics/track", {
  method: "POST",
  body: JSON.stringify({ 
    userId: user.id, 
    event: "login" 
  }),
})
```

#### **3. Chat Messages**
```typescript
// Automatically tracked in app/api/chat/route.ts
await fetch("/api/analytics/track", {
  method: "POST",
  body: JSON.stringify({ 
    userId: user.id, 
    event: "message" 
  }),
})
```

#### **4. Subscription Changes**
```typescript
// Track when user upgrades/downgrades
await fetch("/api/analytics/track", {
  method: "POST",
  body: JSON.stringify({ 
    userId: user.id, 
    event: "subscription",
    plan: "premium" 
  }),
})
```

---

## 📈 Redis Data Structure

### **User Tracking**
```
analytics:users:all → Set of all user IDs
analytics:signups:2024-12-02 → Set of users who signed up today
analytics:signups:2024-W49 → Set of users who signed up this week
analytics:signups:2024-12 → Set of users who signed up this month
```

### **Activity Tracking**
```
analytics:active:2024-12-02 → Set of active users today
analytics:active:2024-W49 → Set of active users this week
analytics:active:2024-12 → Set of active users this month
```

### **Usage Tracking**
```
analytics:chats:total → Total chat count
analytics:chats:2024-12-02 → Chats created today
analytics:messages:total → Total message count
analytics:messages:2024-12-02 → Messages sent today
```

### **Plan Tracking**
```
analytics:plans:free → Set of free users
analytics:plans:plus → Set of Plus subscribers
analytics:plans:premium → Set of Premium subscribers
```

---

## 🎯 Next Steps

### **1. Deploy to Production**
```bash
vercel --prod --yes
```

### **2. Set Production API Key**
```bash
vercel env add ANALYTICS_API_KEY production
# Enter a secure random key
```

### **3. Access Dashboard**
Visit: https://airasupport.com/admin/analytics

### **4. Monitor Metrics**
- Check daily active users
- Track signup conversion
- Monitor MRR growth
- Analyze engagement patterns

---

## 🔒 Security

### **API Key Protection**
- Analytics API requires `x-api-key` header
- API key stored in environment variables
- Session storage for authenticated users
- No public access to sensitive data

### **Recommended API Key**
Generate a secure random key:
```bash
openssl rand -base64 32
```

---

## 📱 Dashboard Features

### **Key Metrics Cards**
- Total Users with today's growth
- Active Users Today with percentage
- Total Chats with today's count
- Monthly Recurring Revenue with subscriber count

### **Detailed Breakdowns**
- User Growth (daily/weekly/monthly)
- Engagement (DAU/WAU/MAU)
- Usage Statistics (chats/messages)
- Revenue Breakdown (by plan)

### **Real-time Updates**
- Refresh button to update metrics
- Auto-refresh every 30 seconds (optional)
- Live data from Redis

---

## ✅ Testing

### **1. Test Signup Tracking**
1. Create a new account
2. Check analytics dashboard
3. Verify "New Users Today" incremented

### **2. Test Message Tracking**
1. Send a chat message
2. Refresh analytics
3. Verify "Messages Today" incremented

### **3. Test Activity Tracking**
1. Login to your account
2. Check analytics
3. Verify "Active Users Today" shows you

---

## 🎉 Result

You now have a **complete analytics system** that tracks:
- ✅ User signups and growth
- ✅ User activity and engagement
- ✅ Chat and message usage
- ✅ Subscription revenue (MRR)
- ✅ Real-time metrics dashboard
- ✅ Secure API key authentication

**Access your analytics at:** https://airasupport.com/admin/analytics

