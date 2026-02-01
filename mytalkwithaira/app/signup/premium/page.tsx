"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Crown, Check, ArrowLeft } from "lucide-react"

function PremiumSignupContent() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { signup, signInWithGoogle, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentSuccess = searchParams.get("payment") === "success"

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const handlePremiumCheckout = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Redirect to Stripe Checkout for Premium plan
      const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK
      if (!paymentLink) {
        throw new Error("Payment link not configured")
      }

      // Store signup intent in localStorage so we can complete it after payment
      localStorage.setItem("premium_signup_intent", JSON.stringify({
        email,
        name,
        timestamp: Date.now()
      }))

      // Redirect to Stripe
      window.location.href = paymentLink
    } catch (err: any) {
      setError(err.message || "Failed to start checkout. Please try again.")
      setIsLoading(false)
    }
  }

  const handleEmailPasswordSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      setIsLoading(false)
      return
    }

    try {
      // Create account with premium plan
      await signup(email, password, name, "premium")
      setSuccess("Premium account created! Redirecting to dashboard...")
      setTimeout(() => router.push("/dashboard"), 2000)
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create account. Please try again."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Store premium intent before OAuth
      localStorage.setItem("premium_signup_intent", JSON.stringify({
        plan: "premium",
        timestamp: Date.now()
      }))

      await signInWithGoogle()
    } catch (err: any) {
      setError(err.message || "Failed to sign up with Google")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Premium Benefits */}
        <div className="space-y-6">
          <Link href="/pricing" className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pricing
          </Link>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-8 h-8 text-yellow-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Premium Plan
              </h1>
            </div>
            <p className="text-xl text-gray-600">£8.99/month</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">What's included:</h2>
            <ul className="space-y-3">
              {[
                "Unlimited AI conversations",
                "Advanced mood tracking & insights",
                "Priority support",
                "Early access to new features",
                "Ad-free experience",
                "Export your data anytime",
                "Custom AI personality settings"
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-900">
              <strong>💳 Secure Payment:</strong> Powered by Stripe. Cancel anytime, no questions asked.
            </p>
          </div>
        </div>

        {/* Right side - Signup Form */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Create Premium Account</CardTitle>
            <CardDescription>
              Start your premium journey with Aira
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {paymentSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✅ Payment successful! Complete your account setup below.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}

            {/* Google Sign Up */}
            <Button
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              variant="outline"
              className="w-full h-12 text-base"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailPasswordSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={8}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Creating Account..."
                ) : (
                  <>
                    <Crown className="w-5 h-5 mr-2" />
                    Create Premium Account - £8.99/mo
                  </>
                )}
              </Button>
            </form>

            <p className="text-xs text-center text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-purple-600 hover:underline">
                Sign in
              </Link>
            </p>

            <p className="text-xs text-center text-gray-500">
              Want to try free first?{" "}
              <Link href="/signup" className="text-purple-600 hover:underline">
                Sign up for free
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PremiumSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PremiumSignupContent />
    </Suspense>
  )
}

