"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface EmotionalGraphProps {
  userId: string
}

interface MoodData {
  date: string
  score: number
  label: string
}

export function EmotionalGraph({ userId }: EmotionalGraphProps) {
  const [moodData, setMoodData] = useState<MoodData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMoodData()
  }, [userId])

  const loadMoodData = async () => {
    try {
      const response = await fetch(`/api/mood-history?userId=${userId}&days=7`)
      const data = await response.json()
      
      if (data.success && data.history) {
        setMoodData(data.history)
      }
    } catch (error) {
      console.error("Error loading mood data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getMoodColor = (score: number) => {
    if (score < 4) return "bg-destructive"
    if (score < 7) return "bg-accent"
    return "bg-primary"
  }

  const getMoodGradient = (score: number) => {
    if (score < 4) return "from-destructive/50 to-destructive/10"
    if (score < 7) return "from-accent/50 to-accent/10"
    return "from-primary/50 to-primary/10"
  }

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (moodData.length === 0) {
    return (
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Your Emotional Graph
          </CardTitle>
          <CardDescription>Last 7 days of mood tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 space-y-3">
            <div className="text-6xl">📊</div>
            <p className="text-lg font-semibold">Your emotional journey starts today</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Track your mood daily to see patterns and trends in your emotional well-being.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxScore = 10
  const chartHeight = 200

  return (
    <Card className="glass-card border-primary/20 relative overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Your Emotional Graph
        </CardTitle>
        <CardDescription>Last 7 days of mood tracking</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Graph */}
          <div className="relative" style={{ height: chartHeight }}>
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[10, 7.5, 5, 2.5, 0].map((value) => (
                <div key={value} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-6">{value}</span>
                  <div className="flex-1 h-px bg-border/30" />
                </div>
              ))}
            </div>

            {/* Bars */}
            <div className="absolute inset-0 flex items-end justify-around pl-8 gap-2">
              {moodData.map((data, index) => {
                const heightPercent = (data.score / maxScore) * 100
                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-2 group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Bar */}
                    <div className="w-full relative">
                      <div
                        className={cn(
                          "w-full rounded-t-lg transition-all duration-500 ease-out",
                          "hover:opacity-80 cursor-pointer relative overflow-hidden",
                          "bg-gradient-to-t",
                          getMoodGradient(data.score)
                        )}
                        style={{
                          height: `${heightPercent}%`,
                          minHeight: "4px",
                        }}
                      >
                        {/* Neon glow effect */}
                        <div
                          className={cn(
                            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity",
                            getMoodColor(data.score),
                            "blur-sm"
                          )}
                        />
                        
                        {/* Score tooltip */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold whitespace-nowrap shadow-lg border border-border">
                            {data.score.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Date label */}
                    <div className="text-xs text-muted-foreground text-center">
                      {new Date(data.date).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">High (7-10)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-muted-foreground">Medium (4-7)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Low (0-4)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

