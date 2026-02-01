"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, MessageSquare, TrendingUp, Heart, Settings, Crown, CheckCircle, Gamepad2, LifeBuoy, BookOpen, Brain } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useDashboardStats } from "@/lib/hooks/useDashboardStats"
import { MoodTracker } from "@/components/dashboard/mood-tracker"
import { Affirmations } from "@/components/dashboard/affirmations"
import { MoodInsights } from "@/components/dashboard/mood-insights"
import { AnimatedBackground, HeaderGlow } from "@/components/dashboard/animated-background"
import { EmotionTile } from "@/components/dashboard/emotion-tile"
import { StreakSystem } from "@/components/dashboard/streak-system"
import { DailyGoals } from "@/components/dashboard/daily-goals"
import { EmotionalJourney } from "@/components/dashboard/emotional-journey"
import { AiraRecommendation } from "@/components/dashboard/aira-recommendation"
import { EmotionalGraph } from "@/components/dashboard/emotional-graph"
import { HeartRateDivider } from "@/components/dashboard/heart-rate-divider"
import { trackDashboardViewed, trackCheckoutCompleted, trackUpgradeClicked } from "@/lib/vercel-analytics"

export function DashboardContent() {
  const { user, logout, updateUserPlan, refreshUserPlan } = useAuth()
  const searchParams = useSearchParams()
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false)
  const { stats: dashboardStats, loading, error, refetch } = useDashboardStats(user?.id)

  // Track dashboard view on mount
  useEffect(() => {
    trackDashboardViewed()
  }, [])

  useEffect(() => {
    const sessionId = searchParams.get("session_id")
    const upgraded = searchParams.get("upgraded")

    // Only run once when the component mounts with the query params
    if (!user) return

    if (sessionId) {
      // Verify the Stripe payment and upgrade user
      const verifyPayment = async () => {
        try {
          console.log("[Dashboard] ✅ Verifying Stripe payment for:", user.email)
          console.log("[Dashboard] Session ID:", sessionId)

          const response = await fetch("/api/stripe/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              email: user.email,
            }),
          })

          const data = await response.json()
          console.log("[Dashboard] Payment verification result:", data)

          if (data.success && data.plan) {
            console.log("[Dashboard] ✅ Payment verified! Upgrading to:", data.plan)
            // Track successful checkout
            trackCheckoutCompleted(data.plan, 2.99)
            // Update the user's plan in auth context
            updateUserPlan(data.plan)
            setShowUpgradeSuccess(true)
            setTimeout(() => setShowUpgradeSuccess(false), 5000)

            // Remove query params from URL
            window.history.replaceState({}, '', '/dashboard')
          } else {
            console.error("[Dashboard] ❌ Payment verification failed:", data.error)
          }
        } catch (err) {
          console.error("[Dashboard] ❌ Error verifying payment:", err)
        }
      }

      verifyPayment()
    } else if (upgraded === "true") {
      // User returned from Stripe payment, refresh their plan from Redis
      console.log("[Dashboard] User returned from payment with ?upgraded=true")
      console.log("[Dashboard] Current user plan:", user.plan)
      console.log("[Dashboard] Calling refreshUserPlan()...")
      refreshUserPlan().then(() => {
        console.log("[Dashboard] refreshUserPlan() completed")
        setShowUpgradeSuccess(true)
        setTimeout(() => setShowUpgradeSuccess(false), 5000)
      }).catch((err) => {
        console.error("[Dashboard] Error refreshing plan:", err)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-10 relative">
        <HeaderGlow />
        <div className="container mx-auto px-4 h-16 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <Image
              src="/airalogo2.png"
              alt="Aira Logo"
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
            />
            <h1 className="text-xl font-bold font-heading">Aira</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={logout} className="neon-border-hover">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Upgrade Success Banner */}
        {showUpgradeSuccess && (
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <div>
              <p className="font-semibold">Upgrade Successful!</p>
              <p className="text-sm text-muted-foreground">
                Welcome to {user?.plan === "plus" ? "Aira Plus" : user?.plan === "premium" ? "Aira Premium" : "Aira"}! Enjoy your new features.
              </p>
            </div>
          </div>
        )}

        {/* Welcome Section with Aira's Voice */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold font-heading mb-2 flex items-center gap-2">
            Welcome back, {user?.name}!
            {user?.plan === "premium" && (
              <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500 animate-pulse" />
            )}
            {user?.plan === "plus" && (
              <Crown className="w-6 h-6 text-blue-500" />
            )}
          </h2>
          <p className="text-muted-foreground mb-3">Here's how you're doing on your journey to emotional clarity.</p>

          {/* Aira speaks to you */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border border-primary/20">
            <p className="text-sm leading-relaxed">
              💚 I'm glad you're here today. I've missed talking with you. How can I support you right now?
            </p>
          </div>
        </div>

        {/* Emotion Tiles (Enhanced Stats) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <EmotionTile
            label="Conversations"
            value={dashboardStats?.conversations?.toString() || "0"}
            icon={MessageSquare}
            color="primary"
            isAnimating={false}
          />
          <EmotionTile
            label="Mood Score"
            value={dashboardStats?.mood_score?.toFixed(1) || "0.0"}
            icon={TrendingUp}
            color="accent"
            moodScore={dashboardStats?.mood_score}
            isAnimating={false}
          />
          <EmotionTile
            label="Days Active"
            value={dashboardStats?.days_active?.toString() || "0"}
            icon={Heart}
            color="secondary"
            isAnimating={false}
          />
        </div>

        <HeartRateDivider />

        {/* Streak System & Daily Goals */}
        {user?.id && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <StreakSystem userId={user.id} />
            <DailyGoals userId={user.id} />
          </div>
        )}

        <HeartRateDivider />

        {/* Quick Actions - Moved up for better visibility */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card neon-border-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Start a Conversation
              </CardTitle>
              <CardDescription>Continue your journey with Aira</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/chat">
                <Button className="w-full neon-border-hover">Open Chat</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="glass-card neon-border-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-accent" />
                Play with Aira
              </CardTitle>
              <CardDescription>Take a break with mini games</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/games">
                <Button className="w-full neon-border-hover">Play Now</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="glass-card neon-border-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-violet-500" />
                ADHD Cognitive Games
              </CardTitle>
              <CardDescription>Focus training & cognitive support</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/adhd-games">
                <Button className="w-full neon-border-hover bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">Train Now</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="glass-card neon-border-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className={`w-5 h-5 ${user?.plan === "premium" ? "text-yellow-500 fill-yellow-500" : user?.plan === "plus" ? "text-blue-500" : "text-accent"}`} />
                Your Plan: {user?.plan === "free" ? "Free Plan" : user?.plan === "plus" ? "Aira Plus" : "Aira Premium"}
              </CardTitle>
              <CardDescription>
                {user?.plan === "free" ? "Upgrade for unlimited conversations" : "Enjoying premium features"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/pricing" onClick={() => user?.plan === "free" && trackUpgradeClicked('free', 'premium')}>
                <Button variant={user?.plan === "free" ? "default" : "outline"} className="w-full neon-border-hover">
                  {user?.plan === "free" ? "Upgrade Plan" : "Manage Subscription"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <HeartRateDivider />

        {/* Mood Tracker & Premium Features */}
        {user?.id && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <MoodTracker
              userId={user.id}
              currentMoodScore={dashboardStats?.mood_score || 5}
              onUpdate={refetch}
            />
            <Affirmations
              userId={user.id}
              moodScore={dashboardStats?.mood_score || 5}
            />
          </div>
        )}

        {/* Advanced Mood Insights */}
        {user?.id && (
          <div className="mb-8">
            <MoodInsights userId={user.id} />
          </div>
        )}

        <HeartRateDivider />

        {/* Emotional Graph */}
        {user?.id && (
          <div className="mb-8">
            <EmotionalGraph userId={user.id} />
          </div>
        )}

        <HeartRateDivider />

        {/* Emotional Journey Timeline */}
        {user?.id && (
          <div className="mb-8">
            <EmotionalJourney userId={user.id} />
          </div>
        )}

        <HeartRateDivider />

        {/* Aira's Recommendation of the Day */}
        {user?.id && (
          <div className="mb-8">
            <AiraRecommendation
              userId={user.id}
              moodScore={dashboardStats?.mood_score || 5}
            />
          </div>
        )}

        <HeartRateDivider />

        {/* Recent Activity */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Conversations</CardTitle>
            <CardDescription>Your latest chats with Aira</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading conversations...</div>
              ) : error ? (
                <div className="text-center py-8 text-destructive">Failed to load conversations</div>
              ) : dashboardStats?.recent_conversations && dashboardStats.recent_conversations.length > 0 ? (
                dashboardStats.recent_conversations.map((chat, i) => {
                  const date = new Date(chat.timestamp)
                  const now = new Date()
                  const diffMs = now.getTime() - date.getTime()
                  const diffMins = Math.floor(diffMs / 60000)
                  const diffHours = Math.floor(diffMs / 3600000)
                  const diffDays = Math.floor(diffMs / 86400000)

                  let dateStr = ""
                  if (diffMins < 60) {
                    dateStr = `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
                  } else if (diffHours < 24) {
                    dateStr = `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
                  } else if (diffDays === 0) {
                    dateStr = `Today, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
                  } else if (diffDays === 1) {
                    dateStr = `Yesterday, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
                  } else {
                    dateStr = `${diffDays} days ago, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
                  }

                  return (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium mb-1">{dateStr}</p>
                        <p className="text-sm text-muted-foreground truncate">{chat.summary}</p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No conversations yet</p>
                  <p className="text-xs mt-2">Start a conversation with Aira to see them here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Settings and Support Links */}
        <div className="mt-8 text-center pb-8 border-t border-border/30">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
            <Link href="/support">
              <Button variant="ghost" className="gap-2">
                <LifeBuoy className="w-4 h-4" />
                Support Resources
              </Button>
            </Link>
            <Link href="/blog">
              <Button variant="ghost" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Blog
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" className="gap-2">
                <Settings className="w-4 h-4" />
                Account Settings
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
