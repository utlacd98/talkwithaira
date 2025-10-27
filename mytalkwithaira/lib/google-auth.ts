/**
 * Google OAuth Authentication
 * Handles Google Sign-In integration with Aira
 */

export interface GoogleUser {
  id: string
  email: string
  name: string
  picture?: string
  googleId: string
}

export interface GoogleCredential {
  clientId: string
  credential: string
  select_by: string
}

/**
 * Verify Google ID Token with backend
 * This should be called after receiving the credential from Google
 */
export async function verifyGoogleToken(idToken: string): Promise<GoogleUser | null> {
  try {
    const response = await fetch("/api/auth/google/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    })

    if (!response.ok) {
      console.error("[Google Auth] Verification failed:", response.statusText)
      return null
    }

    const data = await response.json()
    return data.user
  } catch (error) {
    console.error("[Google Auth] Error verifying token:", error)
    return null
  }
}

/**
 * Decode JWT token (basic decoding, verification happens on backend)
 */
export function decodeJWT(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const decoded = JSON.parse(atob(parts[1]))
    return decoded
  } catch (error) {
    console.error("[Google Auth] Error decoding JWT:", error)
    return null
  }
}

/**
 * Extract user info from Google credential
 */
export function extractGoogleUserInfo(credential: string): Partial<GoogleUser> | null {
  const decoded = decodeJWT(credential)
  if (!decoded) return null

  return {
    email: decoded.email,
    name: decoded.name,
    picture: decoded.picture,
    googleId: decoded.sub,
  }
}

/**
 * Handle Google Sign-In success
 */
export async function handleGoogleSignIn(credential: string) {
  try {
    console.log("[Google Auth] Processing sign-in...")

    // Verify token with backend
    const user = await verifyGoogleToken(credential)

    if (!user) {
      throw new Error("Failed to verify Google token")
    }

    console.log("[Google Auth] Sign-in successful:", user.email)
    return user
  } catch (error) {
    console.error("[Google Auth] Sign-in failed:", error)
    throw error
  }
}

/**
 * Handle Google Sign-In error
 */
export function handleGoogleSignInError(error: any) {
  console.error("[Google Auth] Error:", error)

  if (error.error === "popup_closed_by_user") {
    return "Sign-in popup was closed"
  } else if (error.error === "access_denied") {
    return "Access was denied"
  } else if (error.error === "immediate_failed") {
    return "Sign-in failed. Please try again."
  }

  return "An error occurred during sign-in"
}

