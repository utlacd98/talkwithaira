"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Chrome } from "lucide-react"
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"
import { handleGoogleSignIn, handleGoogleSignInError } from "@/lib/google-auth"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [googleClientId, setGoogleClientId] = useState("")
  const { login } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Get Google Client ID from environment
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (clientId) {
      setGoogleClientId(clientId)
    } else {
      console.warn("[Login] Google Client ID not configured - Google Sign-In disabled")
      // Set to empty string to indicate it's loaded but not configured
      setGoogleClientId("")
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(email, password)
    } catch (err) {
      setError("Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError("")
    setIsLoading(true)

    try {
      const user = await handleGoogleSignIn(credentialResponse.credential)

      // Create session user
      const sessionUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        role: user.role,
      }

      // Save to localStorage
      localStorage.setItem("aira_user", JSON.stringify(sessionUser))

      // Register on server side
      try {
        await fetch("/api/auth/register-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: sessionUser.email,
            userId: sessionUser.id,
            name: sessionUser.name,
            plan: sessionUser.plan,
          }),
        })
      } catch (err) {
        console.warn("[Login] Failed to register user on server:", err)
      }

      router.push("/dashboard")
    } catch (err) {
      const errorMessage = handleGoogleSignInError(err)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError("Google Sign-In failed. Please try again.")
  }

  // Render the login form (Google Sign-In is optional)
  const loginForm = (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold font-heading">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to continue your journey with Aira</p>
          </div>

          {/* Google Sign-In Button - Only show if configured */}
          {googleClientId && googleClientId !== "" && (
            <>
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="signin_with"
                  size="large"
                />
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">Or continue with email</span>
                </div>
              </div>
            </>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )

  // Wrap with GoogleOAuthProvider only if Google Client ID is configured
  if (googleClientId && googleClientId !== "") {
    return <GoogleOAuthProvider clientId={googleClientId}>{loginForm}</GoogleOAuthProvider>
  }

  // Otherwise, just return the form without Google OAuth
  return loginForm
}
