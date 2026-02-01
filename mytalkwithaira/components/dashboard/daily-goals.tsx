"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Circle, Sparkles, Heart, MessageSquare, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface DailyGoalsProps {
  userId: string
  onGoalComplete?: () => void
}

interface Goal {
  id: string
  label: string
  description: string
  icon: typeof Heart
  completed: boolean
  action?: () => void
}

export function DailyGoals({ userId, onGoalComplete }: DailyGoalsProps) {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "mood",
      label: "Track Your Mood",
      description: "Reflect for 1 minute",
      icon: Heart,
      completed: false,
    },
    {
      id: "affirmation",
      label: "View Affirmation",
      description: "Read today's message",
      icon: Sparkles,
      completed: false,
    },
    {
      id: "chat",
      label: "Chat with Aira",
      description: "Share a thought",
      icon: MessageSquare,
      completed: false,
    },
  ])

  const [showBadge, setShowBadge] = useState(false)

  useEffect(() => {
    loadGoalProgress()
  }, [userId])

  useEffect(() => {
    const allCompleted = goals.every((goal) => goal.completed)
    if (allCompleted && !showBadge) {
      setShowBadge(true)
      onGoalComplete?.()
    }
  }, [goals])

  const loadGoalProgress = async () => {
    try {
      const response = await fetch(`/api/daily-goals?userId=${userId}`)
      const data = await response.json()
      
      if (data.success && data.goals) {
        setGoals((prev) =>
          prev.map((goal) => ({
            ...goal,
            completed: data.goals[goal.id] || false,
          }))
        )
      }
    } catch (error) {
      console.error("Error loading goal progress:", error)
    }
  }

  const toggleGoal = async (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return

    const newCompleted = !goal.completed

    // Optimistic update
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, completed: newCompleted } : g))
    )

    // Save to backend
    try {
      await fetch("/api/daily-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          goalId,
          completed: newCompleted,
        }),
      })
    } catch (error) {
      console.error("Error updating goal:", error)
      // Revert on error
      setGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, completed: !newCompleted } : g))
      )
    }
  }

  const completedCount = goals.filter((g) => g.completed).length
  const progress = (completedCount / goals.length) * 100

  return (
    <Card className="glass-card border-primary/20 relative overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Daily Goals
            </CardTitle>
            <CardDescription>
              Complete all 3 to earn today's bloom badge 🌸
            </CardDescription>
          </div>
          {showBadge && (
            <div className="animate-in zoom-in-50 duration-500">
              <div className="text-4xl">🌸</div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-primary">
              {completedCount}/{goals.length}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Goals List */}
        <div className="space-y-3">
          {goals.map((goal) => (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={cn(
                "w-full p-4 rounded-lg border transition-all duration-300",
                "hover:scale-102 hover:shadow-md group text-left",
                goal.completed
                  ? "bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30"
                  : "bg-card/50 border-border/50 hover:border-primary/30"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "transition-all duration-300",
                    goal.completed && "scale-110"
                  )}
                >
                  {goal.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  ) : (
                    <Circle className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={cn(
                      "font-medium transition-all duration-300",
                      goal.completed && "text-primary line-through"
                    )}
                  >
                    {goal.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{goal.description}</p>
                </div>
                <goal.icon
                  className={cn(
                    "w-5 h-5 transition-all duration-300",
                    goal.completed ? "text-primary" : "text-muted-foreground"
                  )}
                />
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

