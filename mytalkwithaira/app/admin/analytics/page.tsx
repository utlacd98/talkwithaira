"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, MessageSquare, TrendingUp, DollarSign, Activity, UserPlus, RefreshCw } from "lucide-react"

interface AnalyticsMetrics {
  totalUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
  activeUsersToday: number
  activeUsersThisWeek: number
  activeUsersThisMonth: number
  totalChats: number
  chatsToday: number
  chatsThisWeek: number
  chatsThisMonth: number
  totalMessages: number
  messagesToday: number
  averageChatsPerUser: number
  averageMessagesPerChat: number
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  totalSubscribers: number
  freeUsers: number
  plusUsers: number
  premiumUsers: number
  monthlyRecurringRevenue: number
  lastUpdated: string
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const fetchAnalytics = async (key: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/analytics", {
        headers: {
          "x-api-key": key,
        },
      })

      if (response.status === 401) {
        setError("Invalid API key")
        setIsAuthenticated(false)
        return
      }

      if (!response.ok) {
        throw new Error("Failed to fetch analytics")
      }

      const data = await response.json()
      setMetrics(data.metrics)
      setIsAuthenticated(true)
      
      // Store API key in session storage
      sessionStorage.setItem("analytics-api-key", key)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analytics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check if API key is stored
    const storedKey = sessionStorage.getItem("analytics-api-key")
    if (storedKey) {
      setApiKey(storedKey)
      fetchAnalytics(storedKey)
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    fetchAnalytics(apiKey)
  }

  const handleRefresh = () => {
    const storedKey = sessionStorage.getItem("analytics-api-key")
    if (storedKey) {
      fetchAnalytics(storedKey)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Analytics Dashboard</CardTitle>
            <CardDescription>Enter your API key to access analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Authenticating..." : "Access Dashboard"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={handleRefresh}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{metrics.newUsersToday} today
              </p>
            </CardContent>
          </Card>

          {/* Active Users Today */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Today</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeUsersToday.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.totalUsers > 0
                  ? `${Math.round((metrics.activeUsersToday / metrics.totalUsers) * 100)}% of total`
                  : "0% of total"}
              </p>
            </CardContent>
          </Card>

          {/* Total Chats */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Chats</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalChats.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{metrics.chatsToday} today
              </p>
            </CardContent>
          </Card>

          {/* Monthly Revenue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MRR</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{metrics.monthlyRecurringRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.totalSubscribers} subscribers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* User Growth */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                User Growth
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">New Today</span>
                <span className="font-bold">{metrics.newUsersToday}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">New This Week</span>
                <span className="font-bold">{metrics.newUsersThisWeek}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">New This Month</span>
                <span className="font-bold">{metrics.newUsersThisMonth}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-muted-foreground">Total Users</span>
                <span className="font-bold text-lg">{metrics.totalUsers}</span>
              </div>
            </CardContent>
          </Card>

          {/* Engagement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Engagement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Daily Active Users</span>
                <span className="font-bold">{metrics.dailyActiveUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Weekly Active Users</span>
                <span className="font-bold">{metrics.weeklyActiveUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Monthly Active Users</span>
                <span className="font-bold">{metrics.monthlyActiveUsers}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-muted-foreground">Avg Chats/User</span>
                <span className="font-bold text-lg">{metrics.averageChatsPerUser.toFixed(1)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Chats Today</span>
                <span className="font-bold">{metrics.chatsToday}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Chats This Week</span>
                <span className="font-bold">{metrics.chatsThisWeek}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Chats This Month</span>
                <span className="font-bold">{metrics.chatsThisMonth}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-muted-foreground">Total Messages</span>
                <span className="font-bold text-lg">{metrics.totalMessages.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Revenue Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Free Users</span>
                <span className="font-bold">{metrics.freeUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Plus Users (£4.99)</span>
                <span className="font-bold">{metrics.plusUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Premium Users (£2.99)</span>
                <span className="font-bold">{metrics.premiumUsers}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-muted-foreground">MRR</span>
                <span className="font-bold text-lg">£{metrics.monthlyRecurringRevenue.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

