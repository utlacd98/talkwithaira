"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Heart, TrendingUp, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

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

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          How are you feeling today?
        </CardTitle>
        <CardDescription>Track your mood to see patterns over time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood Display */}
        <div className="text-center space-y-2">
          <div className="text-6xl animate-in zoom-in-50 duration-300" key={moodIndex}>
            {emoji}
          </div>
          <p className="text-2xl font-bold">{score.toFixed(1)}/10</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>

        {/* Slider */}
        <div className="space-y-4">
          <Slider
            value={[score]}
            onValueChange={(value) => setScore(value[0])}
            min={0}
            max={10}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>😢 Low</span>
            <span>🌟 High</span>
          </div>
        </div>

        {/* Update Button */}
        <Button
          onClick={handleUpdate}
          disabled={isUpdating || score === currentMoodScore}
          className={cn(
            "w-full",
            showSuccess && "bg-green-600 hover:bg-green-700"
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

        {/* Helpful Tip */}
        {score < 5 && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-muted-foreground">
              💙 Remember, it's okay to not feel okay. Consider talking to Aira or reaching out to support resources.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

