"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, MessageSquare, Sparkles, Trophy, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface EmotionalJourneyProps {
  userId: string
}

interface JourneyEvent {
  id: string
  type: "mood" | "chat" | "affirmation" | "badge" | "milestone"
  title: string
  description: string
  timestamp: Date
  value?: number
  icon: typeof Heart
  color: string
}

export function EmotionalJourney({ userId }: EmotionalJourneyProps) {
  const [events, setEvents] = useState<JourneyEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadJourneyEvents()
  }, [userId])

  const loadJourneyEvents = async () => {
    try {
      const response = await fetch(`/api/journey?userId=${userId}`)
      const data = await response.json()
      
      if (data.success && data.events) {
        setEvents(data.events.map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp),
          icon: getIconForType(event.type),
        })))
      }
    } catch (error) {
      console.error("Error loading journey events:", error)
    } finally {
      setLoading(false)
    }
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case "mood":
        return Heart
      case "chat":
        return MessageSquare
      case "affirmation":
        return Sparkles
      case "badge":
        return Trophy
      case "milestone":
        return TrendingUp
      default:
        return Heart
    }
  }

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

  if (events.length === 0) {
    return (
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Your Emotional Journey
          </CardTitle>
          <CardDescription>Your story unfolds here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-3">
            <div className="text-6xl">🌱</div>
            <p className="text-lg font-semibold">Your journey starts today</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Track your mood, chat with Aira, and collect affirmations to see your emotional journey come to life.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card border-primary/20 relative overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Your Emotional Journey
        </CardTitle>
        <CardDescription>A timeline of your growth and moments</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Horizontal Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20" />

          {/* Timeline Events */}
          <div className="flex overflow-x-auto pb-4 gap-6 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            {events.map((event, index) => (
              <div
                key={event.id}
                className="flex-shrink-0 w-48 relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Event Node */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center",
                      "bg-gradient-to-br border-2 border-background shadow-lg",
                      "transition-all duration-300 hover:scale-110 hover:shadow-xl",
                      "relative z-10",
                      event.color
                    )}
                  >
                    <event.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Event Details */}
                  <div className="mt-4 text-center space-y-1">
                    <p className="font-semibold text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                    {event.value !== undefined && (
                      <p className="text-xs font-bold text-primary">
                        {event.value}/10
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(event.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function formatTimestamp(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

