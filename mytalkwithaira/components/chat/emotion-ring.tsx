"use client"

import { useEffect, useState } from "react"

interface EmotionRingProps {
  emotion: "calm" | "empathetic" | "supportive" | "reflective"
}

export function EmotionRing({ emotion }: EmotionRingProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => setIsVisible(false), 3000)
    return () => clearTimeout(timer)
  }, [emotion])

  const emotionConfig = {
    calm: {
      color: "from-primary to-primary/50",
      label: "Calm",
    },
    empathetic: {
      color: "from-accent to-accent/50",
      label: "Empathetic",
    },
    supportive: {
      color: "from-primary via-accent to-primary",
      label: "Supportive",
    },
    reflective: {
      color: "from-accent via-primary to-accent",
      label: "Reflective",
    },
  }

  const config = emotionConfig[emotion]

  return (
    <div
      className={`fixed bottom-32 right-8 transition-all duration-500 ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
      }`}
    >
      <div className="relative">
        {/* Pulsing Ring */}
        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${config.color} animate-pulse opacity-50 blur-xl`} />

        {/* Label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="glass-card px-3 py-1">
            <p className="text-xs font-medium">{config.label}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
