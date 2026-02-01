"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Heart, TrendingUp, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { BreathingGlow } from "./animated-background"

interface MoodTrackerProps {
  userId: string
  currentMoodScore?: number
  onUpdate?: () => void
}

const moodEmojis = ["😢", "😟", "😕", "😐", "🙂", "😊", "😄", "😁", "🤩", "🥳", "🌟"]
const moodLabels = [
  "Very Low",
  "Low",
  "Somewhat Low",
  "Below Average",
  "Neutral",
  "Okay",
  "Good",
  "Great",
  "Excellent",
  "Amazing",
  "Outstanding",
]

// Dynamic messages based on mood
const moodMessages: Record<string, string> = {
  low: "Feeling low is okay — I'm here for you. 💙",
  medium: "Moderate — let's reflect together and find balance. 🌿",
  high: "High mood! Celebrate the small wins today. ✨",
}

const getMoodMessage = (score: number): string => {
  if (score < 4) return moodMessages.low
  if (score < 7) return moodMessages.medium
  return moodMessages.high
}

const getMoodColor = (score: number): "primary" | "accent" | "secondary" => {
  if (score < 4) return "accent"
  if (score < 7) return "secondary"
  return "primary"
}

export function MoodTracker({ userId, currentMoodScore = 5, onUpdate }: MoodTrackerProps) {
  const [score, setScore] = useState(currentMoodScore)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/mood?userId=${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score }),
      })

      if (response.ok) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
        onUpdate?.()
      } else {
        console.error("Failed to update mood score")
      }
    } catch (error) {
      console.error("Error updating mood:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const moodIndex = Math.round(score)
  const emoji = moodEmojis[moodIndex]
  const label = moodLabels[moodIndex]
  const moodColor = getMoodColor(score)
  const moodMessage = getMoodMessage(score)

  // Get background color based on mood
  const getBgColor = (score: number) => {
    if (score < 4) return "from-red-500/5 via-background to-background"
    if (score < 7) return "from-yellow-500/5 via-background to-background"
    return "from-green-500/5 via-background to-background"
  }

  return (
    <Card className={cn(
      "glass-card border-primary/20 relative overflow-hidden transition-all duration-500",
      "bg-gradient-to-br",
      getBgColor(score)
    )}>
      {/* Breathing glow based on mood */}
      <BreathingGlow color={moodColor} />

      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          How are you feeling today?
        </CardTitle>
        <CardDescription>Track your mood to see patterns over time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10">
        {/* Mood Display with animated emoji */}
        <div className="text-center space-y-2">
          <div
            className="text-7xl transition-all duration-300 hover:scale-110"
            key={moodIndex}
            style={{
              animation: "bounce 2s ease-in-out infinite"
            }}
          >
            {emoji}
          </div>
          <p className="text-3xl font-bold transition-colors duration-300">
            {score.toFixed(1)}/10
          </p>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
        </div>

        {/* Dynamic mood message */}
        <div className={cn(
          "p-4 rounded-lg border transition-all duration-300",
          "bg-gradient-to-r",
          score < 4 && "from-red-500/10 to-red-500/5 border-red-500/20",
          score >= 4 && score < 7 && "from-yellow-500/10 to-yellow-500/5 border-yellow-500/20",
          score >= 7 && "from-green-500/10 to-green-500/5 border-green-500/20"
        )}>
          <p className="text-sm text-center font-medium">
            {moodMessage}
          </p>
        </div>

        {/* Slider with gradient track */}
        <div className="space-y-4">
          <div className="relative">
            <Slider
              value={[score]}
              onValueChange={(value) => setScore(value[0])}
              min={0}
              max={10}
              step={0.5}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>😢 Low</span>
            <span>🙂 Medium</span>
            <span>🌟 High</span>
          </div>
        </div>

        {/* Update Button with enhanced feedback */}
        <Button
          onClick={handleUpdate}
          disabled={isUpdating || score === currentMoodScore}
          className={cn(
            "w-full transition-all duration-300",
            showSuccess && "bg-green-600 hover:bg-green-700 scale-105"
          )}
        >
          {isUpdating ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : showSuccess ? (
            <>
              <TrendingUp className="w-4 h-4 mr-2" />
              Mood Updated!
            </>
          ) : (
            "Update Mood"
          )}
        </Button>

        {/* Success message after update */}
        {showSuccess && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 animate-in slide-in-from-bottom duration-300">
            <p className="text-sm text-center font-medium">
              Thanks for checking in. I really appreciate you taking a moment for yourself. 💚
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

