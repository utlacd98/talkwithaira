"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, BookOpen, MessageSquare, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface StreakSystemProps {
  userId: string
}

interface StreakData {
  moodStreak: number
  journalStreak: number
  chatStreak: number
  longestStreak: number
}

export function StreakSystem({ userId }: StreakSystemProps) {
  const [streaks, setStreaks] = useState<StreakData>({
    moodStreak: 0,
    journalStreak: 0,
    chatStreak: 0,
    longestStreak: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStreaks()
  }, [userId])

  const loadStreaks = async () => {
    try {
      const response = await fetch(`/api/streaks?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setStreaks(data.streaks)
      }
    } catch (error) {
      console.error("Error loading streaks:", error)
    } finally {
      setLoading(false)
    }
  }

  const streakItems = [
    {
      label: "Mood Streak",
      value: streaks.moodStreak,
      icon: Flame,
      color: "text-orange-500",
      bgColor: "from-orange-500/20 to-orange-500/5",
      description: "Days tracking mood",
    },
    {
      label: "Journal Streak",
      value: streaks.journalStreak,
      icon: BookOpen,
      color: "text-blue-500",
      bgColor: "from-blue-500/20 to-blue-500/5",
      description: "Days journaling",
    },
    {
      label: "Chat Streak",
      value: streaks.chatStreak,
      icon: MessageSquare,
      color: "text-primary",
      bgColor: "from-primary/20 to-primary/5",
      description: "Days chatting",
    },
  ]

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card border-primary/20 relative overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Your Streaks
        </CardTitle>
        <CardDescription>Keep the momentum going!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Streak Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {streakItems.map((item) => (
            <div
              key={item.label}
              className={cn(
                "relative p-4 rounded-lg bg-gradient-to-br border border-border/50",
                "transition-all duration-300 hover:scale-105 hover:shadow-lg group",
                item.bgColor
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full bg-background/50 flex items-center justify-center",
                    "transition-transform duration-300 group-hover:rotate-12"
                  )}
                >
                  <item.icon className={cn("w-6 h-6", item.color)} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-bold">{item.value}</p>
                    <span className="text-xs text-muted-foreground">days</span>
                  </div>
                </div>
              </div>

              {/* Fire animation for active streaks */}
              {item.value > 0 && (
                <div className="absolute top-2 right-2">
                  <Flame className={cn("w-4 h-4 animate-pulse", item.color)} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Longest Streak Achievement */}
        {streaks.longestStreak > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border border-primary/20">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-primary animate-pulse" />
              <div>
                <p className="text-sm font-semibold">Personal Best</p>
                <p className="text-xs text-muted-foreground">
                  Your longest streak: <span className="font-bold text-primary">{streaks.longestStreak} days</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Encouragement message */}
        {streaks.moodStreak === 0 && streaks.journalStreak === 0 && streaks.chatStreak === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Start your journey today! Track your mood, journal, or chat with Aira to begin your first streak. 🌱
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

