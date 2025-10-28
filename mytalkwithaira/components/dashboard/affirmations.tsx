"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, RefreshCw, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

interface AffirmationsProps {
  userId: string
  moodScore?: number
}

const affirmationsByMood = {
  low: [
    "You are stronger than you know, and this moment doesn't define you.",
    "It's okay to not be okay. You're doing your best, and that's enough.",
    "Every small step forward is progress. You're moving in the right direction.",
    "Your feelings are valid, and you deserve compassion—especially from yourself.",
    "This difficult moment will pass. You've overcome challenges before.",
    "You are worthy of love, care, and support, exactly as you are right now.",
    "Taking time to rest and heal is not weakness—it's wisdom.",
    "You don't have to be perfect. You just have to be you.",
  ],
  medium: [
    "You're doing better than you think. Keep going.",
    "Your progress may be quiet, but it's real and it matters.",
    "You have the strength to handle whatever comes your way.",
    "Every day you show up for yourself is a victory worth celebrating.",
    "You're growing, learning, and becoming more resilient.",
    "Your journey is unique, and you're exactly where you need to be.",
    "You deserve to feel proud of how far you've come.",
    "Trust yourself. You know more than you think you do.",
  ],
  high: [
    "Your positive energy is a gift to yourself and those around you.",
    "You're radiating strength and confidence. Keep shining!",
    "This is your moment. Embrace the joy you're feeling.",
    "You're creating beautiful moments and memories today.",
    "Your happiness is contagious. Share it with the world!",
    "You're proof that things can and do get better.",
    "Celebrate yourself today—you've earned this feeling.",
    "You're thriving, and it's wonderful to see.",
  ],
}

export function Affirmations({ userId, moodScore = 5 }: AffirmationsProps) {
  const [affirmation, setAffirmation] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showPersonalized, setShowPersonalized] = useState(false)
  const [personalizedAffirmation, setPersonalizedAffirmation] = useState("")
  const [isLoadingPersonalized, setIsLoadingPersonalized] = useState(false)

  const getMoodCategory = (score: number): "low" | "medium" | "high" => {
    if (score < 4) return "low"
    if (score < 7) return "medium"
    return "high"
  }

  const getRandomAffirmation = () => {
    const category = getMoodCategory(moodScore)
    const affirmations = affirmationsByMood[category]
    return affirmations[Math.floor(Math.random() * affirmations.length)]
  }

  const refreshAffirmation = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setAffirmation(getRandomAffirmation())
      setIsRefreshing(false)
    }, 300)
  }

  const generatePersonalizedAffirmation = async () => {
    setIsLoadingPersonalized(true)
    try {
      const response = await fetch(`/api/affirmations?userId=${userId}`)
      const data = await response.json()
      
      if (data.success && data.affirmation) {
        setPersonalizedAffirmation(data.affirmation)
        setShowPersonalized(true)
      }
    } catch (error) {
      console.error("Error generating personalized affirmation:", error)
    } finally {
      setIsLoadingPersonalized(false)
    }
  }

  useEffect(() => {
    setAffirmation(getRandomAffirmation())
  }, [moodScore])

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          Daily Affirmation
        </CardTitle>
        <CardDescription>
          {showPersonalized ? "AI-personalized just for you" : "A message of encouragement for you today"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Affirmation Display */}
        <div className="relative">
          <div
            className={cn(
              "p-6 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20",
              "min-h-[120px] flex items-center justify-center text-center",
              isRefreshing && "opacity-50"
            )}
          >
            <p className="text-lg font-medium leading-relaxed">
              {showPersonalized ? personalizedAffirmation : affirmation}
            </p>
          </div>
          
          {/* Sparkle decoration */}
          <div className="absolute -top-2 -right-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!showPersonalized ? (
            <>
              <Button
                variant="outline"
                onClick={refreshAffirmation}
                disabled={isRefreshing}
                className="flex-1"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
                New Affirmation
              </Button>
              <Button
                onClick={generatePersonalizedAffirmation}
                disabled={isLoadingPersonalized}
                className="flex-1 bg-gradient-to-r from-primary to-accent"
              >
                <Sparkles className={cn("w-4 h-4 mr-2", isLoadingPersonalized && "animate-spin")} />
                {isLoadingPersonalized ? "Generating..." : "Personalize"}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                setShowPersonalized(false)
                refreshAffirmation()
              }}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Back to Daily Affirmations
            </Button>
          )}
        </div>

        {/* Premium Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="w-3 h-3" />
          <span>Personalized affirmations powered by AI</span>
        </div>
      </CardContent>
    </Card>
  )
}

