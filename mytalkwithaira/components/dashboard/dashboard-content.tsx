"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, MessageSquare, TrendingUp, Heart, Settings, Crown, CheckCircle, Gamepad2, LifeBuoy } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useDashboardStats } from "@/lib/hooks/useDashboardStats"

export function DashboardContent() {
  const { user, logout, updateUserPlan } = useAuth()
  const searchParams = useSearchParams()
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false)
  const { stats: dashboardStats, loading, error } = useDashboardStats(user?.id)

  useEffect(() => {
    const sessionId = searchParams.get("session_id")

    if (sessionId && user) {
      // Verify the Lemonsqueezy session and update user plan
      const verifySession = async () => {
        try {
          console.log("[Dashboard] Verifying Lemonsqueezy session for email:", user.email)
          const response = await fetch(`/api/stripe/verify-session?email=${encodeURIComponent(user.email)}&session_id=${sessionId}`)
          const data = await response.json()

          console.log("[Dashboard] Session verification result:", data)

          if (data.success && data.plan) {
            console.log("[Dashboard] Updating user plan to:", data.plan)
            // Update the user's plan in auth context
            updateUserPlan(data.plan)
            setShowUpgradeSuccess(true)
            setTimeout(() => setShowUpgradeSuccess(false), 5000)
          }
        } catch (err) {
          console.error("[Dashboard] Error verifying session:", err)
        }
      }

      verifySession()
    } else if (searchParams.get("upgraded") === "true") {
      setShowUpgradeSuccess(true)
      setTimeout(() => setShowUpgradeSuccess(false), 5000)
    }
  }, [searchParams, updateUserPlan, user])

  // Build stats array from real data
  const stats = [
    {
      label: "Conversations",
      value: dashboardStats?.conversations?.toString() || "0",
      icon: MessageSquare,
      color: "text-primary",
    },
    {
      label: "Mood Score",
      value: dashboardStats?.mood_score?.toFixed(1) || "0.0",
      icon: TrendingUp,
      color: "text-accent",
    },
    {
      label: "Days Active",
      value: dashboardStats?.days_active?.toString() || "0",
      icon: Heart,
      color: "text-primary",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold font-heading">Aira</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={logout}>
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

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold font-heading mb-2">Welcome back, {user?.name}!</h2>
          <p className="text-muted-foreground">Here's how you're doing on your journey to emotional clarity.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center ${stat.color}`}
                  >
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Start a Conversation
              </CardTitle>
              <CardDescription>Continue your journey with Aira</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/chat">
                <Button className="w-full">Open Chat</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-accent" />
                Play with Aira
              </CardTitle>
              <CardDescription>Take a break with mini games</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/games">
                <Button className="w-full">Play Now</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-accent" />
                Your Plan: {user?.plan === "free" ? "Free Plan" : user?.plan === "plus" ? "Aira Plus" : "Aira Premium"}
              </CardTitle>
              <CardDescription>
                {user?.plan === "free" ? "Upgrade for unlimited conversations" : "Enjoying premium features"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/pricing">
                <Button variant={user?.plan === "free" ? "default" : "outline"} className="w-full">
                  {user?.plan === "free" ? "Upgrade Plan" : "Manage Subscription"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

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
