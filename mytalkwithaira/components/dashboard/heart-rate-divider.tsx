"use client"

import { cn } from "@/lib/utils"

interface HeartRateDividerProps {
  className?: string
  color?: "primary" | "accent" | "secondary"
}

export function HeartRateDivider({ className = "", color = "primary" }: HeartRateDividerProps) {
  const colorClasses = {
    primary: "stroke-primary",
    accent: "stroke-accent",
    secondary: "stroke-secondary",
  }

  return (
    <div className={cn("w-full h-12 flex items-center justify-center my-8", className)}>
      <svg
        className="w-full h-full opacity-30"
        viewBox="0 0 1000 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,50 L200,50 L220,30 L240,70 L260,20 L280,80 L300,50 L500,50 L520,30 L540,70 L560,20 L580,80 L600,50 L800,50 L820,30 L840,70 L860,20 L880,80 L900,50 L1000,50"
          fill="none"
          className={cn(colorClasses[color], "animate-pulse")}
          strokeWidth="2"
          style={{ animationDuration: "2s" }}
        />
      </svg>
    </div>
  )
}

