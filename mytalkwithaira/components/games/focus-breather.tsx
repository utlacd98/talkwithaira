"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react"

type BreathPhase = "inhale" | "hold" | "exhale" | "rest"

interface BreathingPattern {
  name: string
  inhale: number
  hold: number
  exhale: number
  rest: number
  description: string
}

const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    name: "Box Breathing",
    inhale: 4,
    hold: 4,
    exhale: 4,
    rest: 4,
    description: "Equal timing for calm and focus",
  },
  {
    name: "4-7-8 Relaxation",
    inhale: 4,
    hold: 7,
    exhale: 8,
    rest: 0,
    description: "Deep relaxation technique",
  },
  {
    name: "Quick Calm",
    inhale: 3,
    hold: 3,
    exhale: 3,
    rest: 0,
    description: "Fast stress relief",
  },
]

// SoundHelix meditation tracks (these are free ambient music tracks)
const MEDITATION_SOUNDS = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
]

export function FocusBreather() {
  const [isActive, setIsActive] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<BreathPhase>("inhale")
  const [timeLeft, setTimeLeft] = useState(4)
  const [selectedPattern, setSelectedPattern] = useState(BREATHING_PATTERNS[0])
  const [cyclesCompleted, setCyclesCompleted] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [currentSound, setCurrentSound] = useState<string>("")
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Select random sound on mount
  useEffect(() => {
    const randomSound = MEDITATION_SOUNDS[Math.floor(Math.random() * MEDITATION_SOUNDS.length)]
    setCurrentSound(randomSound)
  }, [])

  // Initialize audio
  useEffect(() => {
    if (currentSound && !audioRef.current) {
      audioRef.current = new Audio(currentSound)
      audioRef.current.loop = true
      audioRef.current.volume = 0.3
    }
  }, [currentSound])

  // Handle breathing cycle
  useEffect(() => {
    if (!isActive) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Move to next phase
          switch (currentPhase) {
            case "inhale":
              if (selectedPattern.hold > 0) {
                setCurrentPhase("hold")
                return selectedPattern.hold
              } else {
                setCurrentPhase("exhale")
                return selectedPattern.exhale
              }
            case "hold":
              setCurrentPhase("exhale")
              return selectedPattern.exhale
            case "exhale":
              if (selectedPattern.rest > 0) {
                setCurrentPhase("rest")
                return selectedPattern.rest
              } else {
                setCurrentPhase("inhale")
                setCyclesCompleted((c) => c + 1)
                return selectedPattern.inhale
              }
            case "rest":
              setCurrentPhase("inhale")
              setCyclesCompleted((c) => c + 1)
              return selectedPattern.inhale
            default:
              return selectedPattern.inhale
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive, currentPhase, selectedPattern])

  const handleStart = () => {
    setIsActive(true)
    if (audioRef.current && !isMuted) {
      audioRef.current.play().catch((err) => console.log("Audio play failed:", err))
    }
  }

  const handlePause = () => {
    setIsActive(false)
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }

  const handleReset = () => {
    setIsActive(false)
    setCurrentPhase("inhale")
    setTimeLeft(selectedPattern.inhale)
    setCyclesCompleted(0)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const handlePatternChange = (pattern: BreathingPattern) => {
    setSelectedPattern(pattern)
    setCurrentPhase("inhale")
    setTimeLeft(pattern.inhale)
    setIsActive(false)
    setCyclesCompleted(0)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (audioRef.current) {
      if (!isMuted) {
        audioRef.current.pause()
      } else if (isActive) {
        audioRef.current.play().catch((err) => console.log("Audio play failed:", err))
      }
    }
  }

  const getPhaseColor = () => {
    switch (currentPhase) {
      case "inhale":
        return "from-blue-500 to-cyan-500"
      case "hold":
        return "from-purple-500 to-pink-500"
      case "exhale":
        return "from-green-500 to-emerald-500"
      case "rest":
        return "from-orange-500 to-yellow-500"
    }
  }

  const getPhaseInstruction = () => {
    switch (currentPhase) {
      case "inhale":
        return "Breathe In"
      case "hold":
        return "Hold"
      case "exhale":
        return "Breathe Out"
      case "rest":
        return "Rest"
    }
  }

  return (
    <div className="space-y-6">
      {/* Pattern Selection */}
      {!isActive && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Choose Your Pattern</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {BREATHING_PATTERNS.map((pattern) => (
              <button
                key={pattern.name}
                onClick={() => handlePatternChange(pattern)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedPattern.name === pattern.name
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="font-semibold">{pattern.name}</div>
                <div className="text-sm text-muted-foreground">{pattern.description}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {pattern.inhale}s in • {pattern.hold > 0 ? `${pattern.hold}s hold • ` : ""}
                  {pattern.exhale}s out{pattern.rest > 0 ? ` • ${pattern.rest}s rest` : ""}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Breathing Circle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-6">
            {/* Animated Circle */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${getPhaseColor()} transition-all duration-1000 ${
                  isActive
                    ? currentPhase === "inhale"
                      ? "scale-100 opacity-80"
                      : currentPhase === "hold"
                        ? "scale-100 opacity-90"
                        : currentPhase === "exhale"
                          ? "scale-75 opacity-60"
                          : "scale-75 opacity-50"
                    : "scale-75 opacity-50"
                }`}
              />
              <div className="relative z-10 text-center">
                <div className="text-6xl font-bold text-white mb-2">{timeLeft}</div>
                <div className="text-xl font-semibold text-white">{getPhaseInstruction()}</div>
              </div>
            </div>

            {/* Stats */}
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Cycles Completed</div>
              <div className="text-3xl font-bold text-primary">{cyclesCompleted}</div>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              {!isActive ? (
                <Button onClick={handleStart} size="lg" className="gap-2">
                  <Play className="w-5 h-5" />
                  Start
                </Button>
              ) : (
                <Button onClick={handlePause} size="lg" variant="secondary" className="gap-2">
                  <Pause className="w-5 h-5" />
                  Pause
                </Button>
              )}
              <Button onClick={handleReset} size="lg" variant="outline" className="gap-2">
                <RotateCcw className="w-5 h-5" />
                Reset
              </Button>
              <Button onClick={toggleMute} size="lg" variant="outline" className="gap-2">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            </div>

            {/* Pattern Info */}
            {isActive && (
              <div className="text-center p-3 rounded-lg bg-muted">
                <div className="text-sm font-semibold">{selectedPattern.name}</div>
                <div className="text-xs text-muted-foreground">{selectedPattern.description}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

