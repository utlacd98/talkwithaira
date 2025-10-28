"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Minus, Sparkles, Brain, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface MoodInsightsProps {
  userId: string
}

interface InsightData {
  summary: string
  patterns: string[]
  recommendations: string[]
  trend: "improving" | "declining" | "stable"
  averageMood: number
  moodRange: { highest: number; lowest: number }
}

export function MoodInsights({ userId }: MoodInsightsProps) {
  const [insights, setInsights] = useState<InsightData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadInsights = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/mood-insights?userId=${userId}`)
      const data = await response.json()

      if (data.success) {
        setInsights(data.insights)
      } else {
        setError(data.error || "Failed to load insights")
      }
    } catch (err) {
      console.error("Error loading mood insights:", err)
      setError("Failed to load insights")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadInsights()
  }, [userId])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="w-5 h-5 text-green-500" />
      case "declining":
        return <TrendingDown className="w-5 h-5 text-orange-500" />
      default:
        return <Minus className="w-5 h-5 text-blue-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "text-green-500"
      case "declining":
        return "text-orange-500"
      default:
        return "text-blue-500"
    }
  }

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case "improving":
        return "Improving"
      case "declining":
        return "Needs Attention"
      default:
        return "Stable"
    }
  }

  if (isLoading && !insights) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Advanced Mood Insights
          </CardTitle>
          <CardDescription>AI-powered analysis of your emotional patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Sparkles className="w-8 h-8 text-primary mx-auto animate-pulse" />
              <p className="text-sm text-muted-foreground">Analyzing your mood patterns...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !insights) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Advanced Mood Insights
          </CardTitle>
          <CardDescription>AI-powered analysis of your emotional patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <p className="text-sm text-muted-foreground">
              {error || "Not enough mood data yet. Track your mood for a few days to see insights."}
            </p>
            <Button onClick={loadInsights} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Advanced Mood Insights
            </CardTitle>
            <CardDescription>AI-powered analysis of your emotional patterns</CardDescription>
          </div>
          <Button onClick={loadInsights} variant="ghost" size="sm" disabled={isLoading}>
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trend Overview */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
          {getTrendIcon(insights.trend)}
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Overall Trend</p>
            <p className={cn("text-lg font-semibold", getTrendColor(insights.trend))}>
              {getTrendLabel(insights.trend)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Average</p>
            <p className="text-lg font-semibold">{insights.averageMood.toFixed(1)}/10</p>
          </div>
        </div>

        {/* AI Summary */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h4 className="font-semibold text-sm">AI Analysis</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed pl-6">
            {insights.summary}
          </p>
        </div>

        {/* Patterns Detected */}
        {insights.patterns.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Patterns Detected</h4>
            <ul className="space-y-2">
              {insights.patterns.map((pattern, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-muted-foreground">{pattern}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {insights.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Personalized Recommendations</h4>
            <ul className="space-y-2">
              {insights.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-accent mt-1">✓</span>
                  <span className="text-muted-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mood Range */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">Highest</p>
            <p className="text-2xl font-bold text-green-500">{insights.moodRange.highest}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">Lowest</p>
            <p className="text-2xl font-bold text-orange-500">{insights.moodRange.lowest}</p>
          </div>
        </div>

        {/* Premium Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
          <Sparkles className="w-3 h-3" />
          <span>Powered by advanced AI analysis</span>
        </div>
      </CardContent>
    </Card>
  )
}

