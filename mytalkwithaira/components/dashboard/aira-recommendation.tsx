"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Wind, BookOpen, Headphones, MessageSquare, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface AiraRecommendationProps {
  userId: string
  moodScore?: number
}

interface Recommendation {
  type: "breathing" | "prompt" | "soundscape" | "conversation"
  title: string
  description: string
  content: string
  icon: typeof Wind
  color: string
  action?: string
}

const recommendations: Record<string, Recommendation[]> = {
  breathing: [
    {
      type: "breathing",
      title: "4-7-8 Breathing",
      description: "Calm your nervous system",
      content: "Breathe in for 4 counts, hold for 7, exhale for 8. Repeat 4 times.",
      icon: Wind,
      color: "from-blue-500/20 to-blue-500/5",
      action: "Start Exercise",
    },
    {
      type: "breathing",
      title: "Box Breathing",
      description: "Find your center",
      content: "Breathe in for 4, hold for 4, out for 4, hold for 4. Repeat 5 times.",
      icon: Wind,
      color: "from-blue-500/20 to-blue-500/5",
      action: "Start Exercise",
    },
  ],
  prompt: [
    {
      type: "prompt",
      title: "Gratitude Reflection",
      description: "What brought you joy today?",
      content: "Take a moment to write down three things you're grateful for today, no matter how small.",
      icon: BookOpen,
      color: "from-purple-500/20 to-purple-500/5",
      action: "Start Journaling",
    },
    {
      type: "prompt",
      title: "Self-Compassion",
      description: "Be kind to yourself",
      content: "What would you say to a friend going through what you're experiencing right now?",
      icon: BookOpen,
      color: "from-purple-500/20 to-purple-500/5",
      action: "Reflect",
    },
  ],
  soundscape: [
    {
      type: "soundscape",
      title: "Ocean Waves",
      description: "Peaceful coastal sounds",
      content: "Let the rhythmic sound of waves wash away your stress and bring calm.",
      icon: Headphones,
      color: "from-teal-500/20 to-teal-500/5",
      action: "Listen Now",
    },
    {
      type: "soundscape",
      title: "Forest Rain",
      description: "Gentle rainfall in nature",
      content: "Immerse yourself in the soothing sounds of rain falling through the trees.",
      icon: Headphones,
      color: "from-teal-500/20 to-teal-500/5",
      action: "Listen Now",
    },
  ],
  conversation: [
    {
      type: "conversation",
      title: "How are you really feeling?",
      description: "Let's talk about it",
      content: "Sometimes we need to dig deeper. I'm here to listen without judgment.",
      icon: MessageSquare,
      color: "from-primary/20 to-primary/5",
      action: "Start Chat",
    },
    {
      type: "conversation",
      title: "What's on your mind?",
      description: "Share your thoughts",
      content: "Your thoughts matter. Let's explore what's been weighing on you.",
      icon: MessageSquare,
      color: "from-primary/20 to-primary/5",
      action: "Start Chat",
    },
  ],
}

export function AiraRecommendation({ userId, moodScore = 5 }: AiraRecommendationProps) {
  const router = useRouter()
  const [currentRec, setCurrentRec] = useState<Recommendation | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    selectRecommendation()
  }, [moodScore])

  const selectRecommendation = () => {
    // Select recommendation type based on mood
    let type: keyof typeof recommendations
    
    if (moodScore < 4) {
      // Low mood - breathing or conversation
      type = Math.random() > 0.5 ? "breathing" : "conversation"
    } else if (moodScore < 7) {
      // Medium mood - any type
      const types = Object.keys(recommendations) as Array<keyof typeof recommendations>
      type = types[Math.floor(Math.random() * types.length)]
    } else {
      // High mood - prompt or soundscape
      type = Math.random() > 0.5 ? "prompt" : "soundscape"
    }

    const recs = recommendations[type]
    const rec = recs[Math.floor(Math.random() * recs.length)]
    setCurrentRec(rec)
  }

  const refreshRecommendation = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      selectRecommendation()
      setIsRefreshing(false)
    }, 300)
  }

  const handleActionClick = () => {
    if (!currentRec) return

    switch (currentRec.type) {
      case "breathing":
      case "soundscape":
        // Navigate to games page which has Focus Breather with calming sounds
        router.push("/games")
        break
      case "prompt":
      case "conversation":
        // Navigate to chat to discuss with Aira
        router.push("/chat")
        break
      default:
        break
    }
  }

  if (!currentRec) return null

  return (
    <Card className="glass-card border-primary/20 relative overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Aira's Recommendation
            </CardTitle>
            <CardDescription>Personalized for you today</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshRecommendation}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "p-6 rounded-lg bg-gradient-to-br border border-border/50",
            "transition-all duration-300",
            currentRec.color,
            isRefreshing && "opacity-50"
          )}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-background/50 flex items-center justify-center flex-shrink-0">
              <currentRec.icon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h4 className="font-semibold text-lg">{currentRec.title}</h4>
                <p className="text-sm text-muted-foreground">{currentRec.description}</p>
              </div>
              <p className="text-sm leading-relaxed">{currentRec.content}</p>
              {currentRec.action && (
                <Button size="sm" className="mt-2" onClick={handleActionClick}>
                  {currentRec.action}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

