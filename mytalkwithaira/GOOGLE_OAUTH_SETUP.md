# 🔐 Google OAuth Setup Guide

## ✅ What We've Implemented

We've successfully integrated **Supabase Google OAuth** into your Aira app! This provides:

- ✨ **One-click Google Sign-In** on both Login and Signup pages
- 🔒 **Secure OAuth flow** via Supabase Auth
- 🎯 **Automatic user registration** in your system
- 📱 **Seamless redirect** to dashboard after authentication

## 🚀 Setup Instructions

### Step 1: Enable Google OAuth in Supabase

1. **Go to Supabase Dashboard**
   - Navigate to: https://app.supabase.com/project/sapqfourswlsytfcibdc/auth/providers
   - Or: Your Project → Authentication → Providers

2. **Find Google Provider**
   - Scroll down to find "Google" in the list of providers
   - Click on it to expand

3. **Enable Google OAuth**
   - Toggle "Enable Sign in with Google" to **ON**

4. **Get Google OAuth Credentials**
   You need to create OAuth credentials in Google Cloud Console:

   a. **Go to Google Cloud Console**
      - Visit: https://console.cloud.google.com/
      - Create a new project or select existing one

   b. **Enable Google+ API**
      - Go to: APIs & Services → Library
      - Search for "Google+ API"
      - Click "Enable"

   c. **Create OAuth Credentials**
      - Go to: APIs & Services → Credentials
      - Click "Create Credentials" → "OAuth client ID"
      - Application type: **Web application**
      - Name: "Aira Web App"

   d. **Configure Authorized Redirect URIs**
      Add these URLs:
      ```
      https://sapqfourswlsytfcibdc.supabase.co/auth/v1/callback
      http://localhost:3000/auth/callback
      ```

   e. **Copy Credentials**
      - Copy the **Client ID**
      - Copy the **Client Secret**

5. **Add Credentials to Supabase**
   - Back in Supabase → Authentication → Providers → Google
   - Paste **Client ID** into "Client ID" field
   - Paste **Client Secret** into "Client Secret" field
   - Click **Save**

### Step 2: Configure Redirect URLs in Supabase

1. **Go to URL Configuration**
   - Supabase Dashboard → Authentication → URL Configuration

2. **Add Redirect URLs**
   Add these to "Redirect URLs":
   ```
   http://localhost:3000/auth/callback
   https://v0-aira-web-app.vercel.app/auth/callback
   ```

3. **Set Site URL**
   - Development: `http://localhost:3000`
   - Production: `https://v0-aira-web-app.vercel.app`

### Step 3: Test Locally

1. **Start your dev server** (already running at http://localhost:3000)

2. **Go to Login page**
   - Visit: http://localhost:3000/login
   - You should see a "Continue with Google" button

3. **Click "Continue with Google"**
   - You'll be redirected to Google's OAuth consent screen
   - Select your Google account
   - Grant permissions
   - You'll be redirected back to `/auth/callback`
   - Then automatically redirected to `/dashboard`

4. **Verify User Registration**
   - Check that you're logged in
   - Your user should be registered in the system with a "free" plan

### Step 4: Deploy to Vercel

1. **Commit and push your changes**
   ```bash
   git add -A
   git commit -m "Add Supabase Google OAuth authentication"
   git push origin main
   ```

2. **Vercel will auto-deploy**
   - Wait for deployment to complete
   - Visit: https://v0-aira-web-app.vercel.app/login

3. **Test on Production**
   - Click "Continue with Google"
   - Complete OAuth flow
   - Verify you're redirected to dashboard

## 📁 Files Changed

### New Files Created:
- `lib/supabase-client.ts` - Browser-side Supabase client
- `app/auth/callback/route.ts` - OAuth callback handler
- `app/api/auth/register-oauth-user/route.ts` - User registration API

### Modified Files:
- `lib/auth-context.tsx` - Added `signInWithGoogle()` method
- `app/login/page.tsx` - Added Google Sign-In button
- `app/signup/page.tsx` - Added Google Sign-Up button
- `package.json` - Added `@supabase/ssr` dependency

## 🔍 How It Works

1. **User clicks "Continue with Google"**
   - Calls `signInWithGoogle()` from auth context
   - Supabase initiates OAuth flow with Google

2. **Google OAuth Consent**
   - User selects Google account
   - Grants permissions to Aira

3. **Callback Handler**
   - Google redirects to `/auth/callback` with auth code
   - Supabase exchanges code for session
   - User data is extracted from Google profile

4. **User Registration**
   - Callback handler calls `/api/auth/register-oauth-user`
   - User is registered in your system with:
     - `userId`: Supabase user ID
     - `email`: From Google profile
     - `name`: From Google profile (or email prefix)
     - `plan`: "free" (default)

5. **Redirect to Dashboard**
   - User is redirected to `/dashboard`
   - Session is maintained via Supabase Auth

## 🎯 Benefits

- ✅ **No password management** - Users don't need to remember passwords
- ✅ **Faster signup** - One click instead of filling forms
- ✅ **More secure** - OAuth is more secure than password auth
- ✅ **Better UX** - Seamless authentication experience
- ✅ **Email verification** - Google accounts are already verified

## 🐛 Troubleshooting

### "Google Sign-In failed"
- Check that Google OAuth is enabled in Supabase
- Verify Client ID and Client Secret are correct
- Ensure redirect URLs are configured properly

### "Redirect URI mismatch"
- Make sure redirect URLs in Google Cloud Console match Supabase callback URL
- Format: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

### "User not registered"
- Check browser console for errors
- Verify `/api/auth/register-oauth-user` is working
- Check Vercel KV is configured correctly

### Still using old Google OAuth library
- We've removed `@react-oauth/google` dependency
- Now using Supabase's built-in OAuth
- Much simpler and more reliable!

## 📝 Next Steps

1. **Complete Supabase Google OAuth setup** (follow Step 1 above)
2. **Test locally** to ensure it works
3. **Deploy to Vercel** and test in production
4. **Optional**: Remove email/password auth if you want Google-only
5. **Optional**: Add more OAuth providers (GitHub, Facebook, etc.)

## 🎉 You're All Set!

Once you complete the Supabase Google OAuth setup, your users will be able to sign in with Google in one click! 🚀

