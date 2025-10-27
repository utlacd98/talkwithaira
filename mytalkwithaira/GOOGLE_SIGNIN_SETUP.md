# 🔐 Google Sign-In Setup Guide

## ✅ What's Implemented

Google Sign-In has been fully integrated into Aira! Users can now:
- ✅ Sign in with Google on login page
- ✅ Sign up with Google on signup page
- ✅ Automatic account creation from Google profile
- ✅ Profile picture from Google
- ✅ Fallback to email/password if preferred

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Google OAuth Credentials

1. Go to **Google Cloud Console**: https://console.cloud.google.com
2. Create a new project (or select existing)
3. Enable **Google+ API**:
   - Search for "Google+ API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000` (development)
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com` (production)
     - `https://yourdomain.com/api/auth/callback/google` (production)
   - Copy the **Client ID**

### Step 2: Add to Environment Variables

Edit `.env.local`:

```env
# Existing variables
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_OPENAI_MODEL=gpt-4o-mini

# New - Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

**Important**: 
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is safe to expose (it's public)
- We don't need the secret for client-side Google Sign-In

### Step 3: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 4: Test It!

1. Go to http://localhost:3000/login
2. Click "Sign in with Google"
3. Select your Google account
4. You should be redirected to dashboard ✅

---

## 📋 Files Changed

| File | Changes |
|------|---------|
| `/lib/google-auth.ts` | ✅ NEW - Google OAuth utilities |
| `/app/api/auth/google/verify/route.ts` | ✅ NEW - Token verification API |
| `/app/login/page.tsx` | ✅ UPDATED - Added Google Sign-In button |
| `/app/signup/page.tsx` | ✅ UPDATED - Added Google Sign-Up button |
| `/lib/auth-db.ts` | ✅ UPDATED - Support for Google users |
| `package.json` | ✅ UPDATED - Added @react-oauth/google |

---

## 🔍 How It Works

### 1. User Clicks "Sign in with Google"
```
User clicks button
    ↓
Google OAuth popup opens
    ↓
User selects account
    ↓
Google returns ID token
```

### 2. Token Verification
```
Frontend sends ID token to backend
    ↓
Backend verifies with Google servers
    ↓
Backend creates/updates user in database
    ↓
User session created
    ↓
Redirect to dashboard
```

### 3. User Data
```
Google provides:
- Email
- Name
- Profile picture
- Google ID (unique identifier)

Aira stores:
- Email (unique)
- Name
- Picture URL
- Google ID (for linking)
- Plan (free/plus/premium)
- Role (user/admin/owner)
```

---

## 🧪 Testing

### Test 1: Sign in with Google
```
1. Go to http://localhost:3000/login
2. Click "Sign in with Google"
3. Select your Google account
4. Should redirect to /dashboard
5. Check console for: "[Google Auth] Sign-in successful: your@email.com"
```

### Test 2: Sign up with Google
```
1. Go to http://localhost:3000/signup
2. Click "Sign up with Google"
3. Select your Google account
4. Should redirect to /dashboard
5. Check console for: "[Google Auth] Sign-in successful: your@email.com"
```

### Test 3: Email/Password Still Works
```
1. Go to http://localhost:3000/login
2. Use email: test@example.com
3. Use password: password123
4. Should still work ✅
```

### Test 4: Existing User with Google
```
1. Create account with email: myemail@gmail.com / password123
2. Logout
3. Try signing in with Google using same Gmail
4. Should recognize existing account ✅
```

---

## 🔒 Security Notes

### What's Secure ✅
- Google handles password security
- ID tokens verified with Google servers
- No passwords stored for Google users
- HTTPS required in production
- Client ID is public (safe to expose)

### What to Do in Production 🔒
- Use HTTPS only
- Add CSRF protection
- Verify token expiration
- Store refresh tokens securely
- Add rate limiting on auth endpoints
- Monitor for suspicious activity

---

## 🐛 Troubleshooting

### "Google Client ID not configured"
**Solution**: 
- Check `.env.local` has `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- Restart dev server
- Check browser console for errors

### "Sign-in popup was closed"
**Solution**: 
- User closed the popup
- Try again
- Check browser popup blocker

### "Token verification failed"
**Solution**: 
- Check Google Cloud Console credentials
- Verify redirect URIs are correct
- Check network tab for API errors

### "Invalid token"
**Solution**: 
- Token may have expired
- Try signing in again
- Check Google Cloud Console logs

---

## 📊 User Flow

```
┌─────────────────────────────────────────┐
│         Aira Login/Signup               │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Sign in with Google Button      │  │
│  └──────────────────────────────────┘  │
│           ↓                             │
│  ┌──────────────────────────────────┐  │
│  │  Google OAuth Popup              │  │
│  │  (User selects account)          │  │
│  └──────────────────────────────────┘  │
│           ↓                             │
│  ┌──────────────────────────────────┐  │
│  │  Backend Verifies Token          │  │
│  │  /api/auth/google/verify         │  │
│  └──────────────────────────────────┘  │
│           ↓                             │
│  ┌──────────────────────────────────┐  │
│  │  Create/Update User              │  │
│  │  (in auth-db.ts)                 │  │
│  └──────────────────────────────────┘  │
│           ↓                             │
│  ┌──────────────────────────────────┐  │
│  │  Create Session                  │  │
│  │  (localStorage)                  │  │
│  └──────────────────────────────────┘  │
│           ↓                             │
│  ┌──────────────────────────────────┐  │
│  │  Redirect to Dashboard           │  │
│  │  /dashboard                      │  │
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🚀 Next Steps

1. **Get Google OAuth Credentials** (5 min)
   - Follow Step 1 above

2. **Add to .env.local** (1 min)
   - Follow Step 2 above

3. **Restart Dev Server** (1 min)
   - Follow Step 3 above

4. **Test** (5 min)
   - Follow testing section above

5. **Deploy to Vercel** (optional)
   - Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to Vercel environment variables
   - Update redirect URIs in Google Cloud Console

---

## 📚 Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com)
- [React OAuth Library](https://www.npmjs.com/package/@react-oauth/google)

---

**Status**: ✅ **READY TO USE**
**Time to Setup**: ⏱️ **5 minutes**
**Difficulty**: 🟢 **Easy**

Get your Google Client ID and start using Google Sign-In! 🚀

