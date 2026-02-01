"use client"

import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { BreathingGlow } from "./animated-background"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface EmotionTileProps {
  label: string
  value: string | number
  icon: LucideIcon
  color: "primary" | "accent" | "secondary"
  trend?: "up" | "down" | "neutral"
  isAnimating?: boolean
  moodScore?: number
}

export function EmotionTile({
  label,
  value,
  icon: Icon,
  color,
  trend,
  isAnimating = false,
  moodScore,
}: EmotionTileProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (value !== displayValue) {
      setIsUpdating(true)
      setTimeout(() => {
        setDisplayValue(value)
        setIsUpdating(false)
      }, 300)
    }
  }, [value])

  // Get color classes based on mood score for mood tile
  const getMoodColor = (score?: number) => {
    if (!score) return color
    if (score < 4) return "destructive"
    if (score < 7) return "accent"
    return "primary"
  }

  const actualColor = label === "Mood Score" && moodScore ? getMoodColor(moodScore) : color

  const colorClasses = {
    primary: {
      bg: "from-primary/20 to-primary/5",
      text: "text-primary",
      glow: "shadow-primary/50",
      border: "border-primary/30",
    },
    accent: {
      bg: "from-accent/20 to-accent/5",
      text: "text-accent",
      glow: "shadow-accent/50",
      border: "border-accent/30",
    },
    secondary: {
      bg: "from-secondary/20 to-secondary/5",
      text: "text-secondary",
      glow: "shadow-secondary/50",
      border: "border-secondary/30",
    },
    destructive: {
      bg: "from-destructive/20 to-destructive/5",
      text: "text-destructive",
      glow: "shadow-destructive/50",
      border: "border-destructive/30",
    },
  }

  const colors = colorClasses[actualColor as keyof typeof colorClasses]

  return (
    <Card
      className={cn(
        "relative overflow-hidden backdrop-blur-md bg-card/50 border transition-all duration-300",
        "hover:scale-105 hover:shadow-lg group cursor-pointer",
        colors.border,
        isAnimating && "animate-pulse"
      )}
    >
      {/* Breathing glow effect */}
      <BreathingGlow color={actualColor as "primary" | "accent" | "secondary"} />

      {/* Neon border glow on hover */}
      <div
        className={cn(
          "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          "shadow-lg",
          colors.glow
        )}
        style={{ boxShadow: `0 0 20px var(--${actualColor})` }}
      />

      <CardContent className="pt-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <div className="flex items-baseline gap-2">
              <p
                className={cn(
                  "text-4xl font-bold transition-all duration-300",
                  isUpdating && "scale-110 opacity-50"
                )}
              >
                {displayValue}
              </p>
              {trend && (
                <span
                  className={cn(
                    "text-xs font-semibold",
                    trend === "up" && "text-primary",
                    trend === "down" && "text-destructive",
                    trend === "neutral" && "text-muted-foreground"
                  )}
                >
                  {trend === "up" && "↑"}
                  {trend === "down" && "↓"}
                  {trend === "neutral" && "→"}
                </span>
              )}
            </div>
          </div>

          {/* Animated icon */}
          <div
            className={cn(
              "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center",
              "transition-all duration-300 group-hover:scale-110 group-hover:rotate-6",
              colors.bg,
              isAnimating && "animate-bounce"
            )}
          >
            <Icon className={cn("w-8 h-8", colors.text)} />
          </div>
        </div>

        {/* Subtle shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </CardContent>
    </Card>
  )
}

