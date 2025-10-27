# 🚀 Google Sign-In & iOS App Implementation Plan

## 📋 Overview

This document outlines the implementation of:
1. **Google Sign-In** for web (replacing email/password)
2. **iOS Native App** with Google & Apple Sign-In
3. **Unified Backend** for both web and iOS

---

## 🎯 Phase 1: Google Sign-In for Web (3-4 hours)

### 1.1 Setup NextAuth.js

**Install Dependencies**:
```bash
npm install next-auth @auth/core @auth/nextjs
npm install @next-auth/google-provider
```

**Create `/lib/auth.ts`**:
```typescript
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.sub
      return session
    },
  },
})
```

### 1.2 Create Auth API Routes

**Create `/app/api/auth/[...nextauth]/route.ts`**:
```typescript
import { handlers } from "@/lib/auth"
export const { GET, POST } = handlers
```

### 1.3 Update Login Page

Replace email/password with Google button:
```typescript
import { signIn } from "@/lib/auth"

export default function LoginPage() {
  return (
    <form action={async () => {
      "use server"
      await signIn("google", { redirectTo: "/dashboard" })
    }}>
      <button type="submit">Sign in with Google</button>
    </form>
  )
}
```

### 1.4 Environment Variables

Add to `.env.local`:
```
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
```

---

## 📱 Phase 2: iOS App Setup (2-3 hours)

### 2.1 Create React Native Project

```bash
npx create-expo-app aira-ios
cd aira-ios
npm install expo-auth-session expo-web-browser
npm install @react-native-google-signin/google-signin
npm install @react-native-async-storage/async-storage
```

### 2.2 Project Structure

```
aira-ios/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (app)/
│   │   ├── chat.tsx
│   │   ├── dashboard.tsx
│   │   └── settings.tsx
│   └── _layout.tsx
├── lib/
│   ├── auth-context.tsx
│   ├── api-client.ts
│   └── storage.ts
├── components/
│   ├── chat-interface.tsx
│   └── message.tsx
└── app.json
```

### 2.3 Configure Google Sign-In

**Create `/lib/google-signin.ts`**:
```typescript
import * as Google from 'expo-auth-session/providers/google'
import * as WebBrowser from 'expo-web-browser'

WebBrowser.maybeCompleteAuthSession()

export const [request, response, promptAsync] = Google.useAuthRequest({
  clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
})
```

---

## 🔐 Phase 3: iOS Authentication (2-3 hours)

### 3.1 Google Sign-In

**Create `/app/(auth)/login.tsx`**:
```typescript
import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { promptAsync } from '@/lib/google-signin'

export default function LoginScreen() {
  const { login } = useAuth()

  const handleGoogleSignIn = async () => {
    const result = await promptAsync()
    if (result?.type === 'success') {
      const { id_token } = result.params
      await login(id_token)
    }
  }

  return (
    <View>
      <Button title="Sign in with Google" onPress={handleGoogleSignIn} />
      <Button title="Sign in with Apple" onPress={handleAppleSignIn} />
    </View>
  )
}
```

### 3.2 Apple Sign-In

```bash
npm install expo-apple-authentication
```

**Add to login.tsx**:
```typescript
import * as AppleAuthentication from 'expo-apple-authentication'

const handleAppleSignIn = async () => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    })
    await login(credential.identityToken)
  } catch (e) {
    console.error(e)
  }
}
```

---

## 🔗 Phase 4: Backend Integration (2-3 hours)

### 4.1 Update Auth Database

**Modify `/lib/auth-db.ts`**:
```typescript
export interface AuthUser {
  id: string
  email: string
  name: string
  googleId?: string
  appleId?: string
  plan: "free" | "plus" | "premium"
  role: "user" | "admin" | "owner"
  createdAt: number
}

export function findOrCreateGoogleUser(
  googleId: string,
  email: string,
  name: string
): AuthUser {
  const existingUser = Object.values(USERS_DB).find(
    u => u.googleId === googleId
  )
  if (existingUser) return existingUser

  const newUser: AuthUser = {
    id: Math.random().toString(36).substr(2, 9),
    email,
    name,
    googleId,
    plan: "free",
    role: "user",
    createdAt: Date.now(),
  }
  USERS_DB[email.toLowerCase()] = newUser
  return newUser
}
```

### 4.2 Create OAuth Callback API

**Create `/app/api/auth/google/callback/route.ts`**:
```typescript
import { NextRequest, NextResponse } from "next/server"
import { findOrCreateGoogleUser } from "@/lib/auth-db"

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json()
    
    // Verify token with Google
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?id_token=${idToken}`
    )
    const { email, name, sub: googleId } = await response.json()

    const user = findOrCreateGoogleUser(googleId, email, name)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    )
  }
}
```

### 4.3 iOS API Client

**Create `/lib/api-client.ts`** (iOS):
```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL

export async function loginWithGoogle(idToken: string) {
  const response = await fetch(`${API_URL}/api/auth/google/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  })
  return response.json()
}

export async function sendMessage(userId: string, message: string) {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      messages: [{ role: "user", content: message }],
    }),
  })
  return response.json()
}
```

---

## 📊 Implementation Timeline

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Google Sign-In Setup | 3-4h | ⏳ TODO |
| 1 | Update Login Page | 1h | ⏳ TODO |
| 2 | iOS Project Setup | 2-3h | ⏳ TODO |
| 3 | iOS Google Sign-In | 1-2h | ⏳ TODO |
| 3 | iOS Apple Sign-In | 1h | ⏳ TODO |
| 4 | Backend Integration | 2-3h | ⏳ TODO |
| 4 | Testing | 2-3h | ⏳ TODO |
| 5 | App Store Submission | 1-2h | ⏳ TODO |

**Total**: ~16-22 hours

---

## 🔑 Required Credentials

### Google OAuth
1. Go to https://console.cloud.google.com
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web + iOS)
5. Get Client ID and Secret

### Apple Developer
1. Go to https://developer.apple.com
2. Create App ID
3. Enable Sign in with Apple
4. Create certificates

---

## ✅ Checklist

- [ ] Google OAuth credentials obtained
- [ ] NextAuth.js installed and configured
- [ ] Web login page updated
- [ ] iOS project created
- [ ] Google Sign-In working on iOS
- [ ] Apple Sign-In working on iOS
- [ ] Backend OAuth callback implemented
- [ ] Chat API working on iOS
- [ ] Testing completed
- [ ] App Store submission ready

---

**Next Step**: Start Phase 1 - Google Sign-In for Web! 🚀

