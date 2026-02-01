"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Zap } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { useEffect, useRef, useState, useCallback } from "react"
import { useGameLimit } from "@/hooks/use-game-limit"
import { GameLimitModal } from "@/components/games/game-limit-modal"
import { useAuth } from "@/lib/auth-context"

interface Distractor {
  id: number
  x: number
  y: number
  size: number
  color: string
  speedX: number
  speedY: number
}

export default function DistractionDodgePage() {
  const { user } = useAuth()
  const gameRef = useRef<HTMLDivElement>(null)
  const [gameState, setGameState] = useState<"idle" | "playing" | "ended">("idle")
  const [health, setHealth] = useState(100)
  const [timeOnTarget, setTimeOnTarget] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [isNewHighScore, setIsNewHighScore] = useState(false)
  const [speedLevel, setSpeedLevel] = useState(1)

  const targetRef = useRef({ x: 200, y: 200, vx: 2, vy: 1.5, baseSpeed: 2 })
  const pointerRef = useRef({ x: 0, y: 0, isOver: false })
  const distractorsRef = useRef<Distractor[]>([])
  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef(0)
  const offTargetTimeRef = useRef(0)
  const gameTimeRef = useRef(0)
  const distractorIdRef = useRef(0)

  const { canPlay, isPremium, recordPlay } = useGameLimit("distraction-dodge")

  useEffect(() => {
    const saved = localStorage.getItem("distractionDodgeHighScore")
    if (saved) setHighScore(parseInt(saved))
  }, [])

  const submitScoreToLeaderboard = useCallback(async (finalScore: number) => {
    if (!user?.id || finalScore <= 0) return

    try {
      const response = await fetch('/api/adhd-games/save-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          username: user.email?.split('@')[0] || `Player ${user.id.substring(0, 6)}`,
          game: 'distraction-dodge',
          score: finalScore,
        }),
      })

      const data = await response.json()
      if (data.success && data.isNewHighScore) {
        setIsNewHighScore(true)
      }
    } catch (error) {
      console.error('[Distraction Dodge] Error submitting score:', error)
    }
  }, [user])

  const checkPointerOnTarget = useCallback(() => {
    const target = targetRef.current
    const pointer = pointerRef.current
    const dx = pointer.x - target.x
    const dy = pointer.y - target.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance < 50 // Target radius
  }, [])

  const spawnDistractor = useCallback(() => {
    if (!gameRef.current) return
    const rect = gameRef.current.getBoundingClientRect()
    const colors = ["#f87171", "#fbbf24", "#a78bfa", "#60a5fa"]
    const distractor: Distractor = {
      id: distractorIdRef.current++,
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      size: 20 + Math.random() * 40,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: (Math.random() - 0.5) * 4,
      speedY: (Math.random() - 0.5) * 4,
    }
    distractorsRef.current.push(distractor)
    
    // Remove after some time
    setTimeout(() => {
      distractorsRef.current = distractorsRef.current.filter(d => d.id !== distractor.id)
    }, 3000 + Math.random() * 2000)
  }, [])

  const gameLoop = useCallback((timestamp: number) => {
    if (!gameRef.current) return
    const delta = timestamp - lastTimeRef.current
    lastTimeRef.current = timestamp

    const rect = gameRef.current.getBoundingClientRect()
    const target = targetRef.current

    // Increase speed over time (starts at baseSpeed, increases 5% per second, max 4x speed)
    const elapsedSeconds = gameTimeRef.current / 1000
    const speedMultiplier = Math.min(1 + elapsedSeconds * 0.05, 4)

    // Update speed level display (every 0.5x increase = new level)
    const newSpeedLevel = Math.floor(speedMultiplier * 2) // Level 2, 3, 4, 5, 6, 7, 8
    setSpeedLevel(newSpeedLevel)

    // Calculate current speed with direction preserved
    const currentSpeed = target.baseSpeed * speedMultiplier
    const vxSign = target.vx >= 0 ? 1 : -1
    const vySign = target.vy >= 0 ? 1 : -1

    // Move target with increasing speed
    target.x += vxSign * currentSpeed
    target.y += vySign * (currentSpeed * 0.75) // Slightly slower vertical movement

    // Bounce off walls (preserve new speed direction)
    if (target.x < 50 || target.x > rect.width - 50) target.vx *= -1
    if (target.y < 50 || target.y > rect.height - 50) target.vy *= -1

    // Keep in bounds
    target.x = Math.max(50, Math.min(rect.width - 50, target.x))
    target.y = Math.max(50, Math.min(rect.height - 50, target.y))

    // Update distractors (also speed up over time)
    const distractorSpeedMult = Math.min(1 + elapsedSeconds * 0.03, 2.5)
    distractorsRef.current.forEach(d => {
      d.x += d.speedX * distractorSpeedMult
      d.y += d.speedY * distractorSpeedMult
      if (d.x < 0 || d.x > rect.width) d.speedX *= -1
      if (d.y < 0 || d.y > rect.height) d.speedY *= -1
    })

    // Check if pointer is on target
    const isOnTarget = checkPointerOnTarget()
    gameTimeRef.current += delta

    if (isOnTarget) {
      offTargetTimeRef.current = 0
      setTimeOnTarget(prev => prev + delta)
    } else {
      offTargetTimeRef.current += delta
      if (offTargetTimeRef.current > 700) {
        // Lose health
        setHealth(prev => {
          const newHealth = Math.max(0, prev - delta * 0.03)
          if (newHealth <= 0) {
            endGame()
          }
          return newHealth
        })
      }
    }

    setTotalTime(gameTimeRef.current)

    // Continue loop
    animationRef.current = requestAnimationFrame(gameLoop)
  }, [checkPointerOnTarget])

  const startGame = useCallback(() => {
    // Check if user can play (free users: 1 per day)
    if (!canPlay) {
      setShowLimitModal(true)
      return
    }

    // Record the play for free users
    if (!isPremium) {
      recordPlay()
    }

    if (!gameRef.current) return
    const rect = gameRef.current.getBoundingClientRect()

    const baseSpeed = 2 + Math.random() * 0.5
    targetRef.current = {
      x: rect.width / 2,
      y: rect.height / 2,
      vx: baseSpeed,
      vy: baseSpeed * 0.75,
      baseSpeed: baseSpeed
    }
    distractorsRef.current = []
    offTargetTimeRef.current = 0
    gameTimeRef.current = 0
    distractorIdRef.current = 0

    setGameState("playing")
    setHealth(100)
    setTimeOnTarget(0)
    setTotalTime(0)
    setIsNewHighScore(false)
    setSpeedLevel(2)

    lastTimeRef.current = performance.now()
    animationRef.current = requestAnimationFrame(gameLoop)

    // Spawn distractors periodically
    const spawnInterval = setInterval(() => {
      if (gameState === "playing") {
        spawnDistractor()
      }
    }, 1500)

    return () => clearInterval(spawnInterval)
  }, [gameLoop, spawnDistractor, gameState, canPlay, isPremium, recordPlay])

  const endGame = useCallback(() => {
    setGameState("ended")
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    const score = totalTime > 0 ? Math.round((timeOnTarget / totalTime) * 100) : 0
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem("distractionDodgeHighScore", score.toString())
    }
    // Submit score to leaderboard
    submitScoreToLeaderboard(score)
  }, [totalTime, timeOnTarget, highScore, submitScoreToLeaderboard])

  const handlePointerMove = useCallback((e: React.PointerEvent | React.TouchEvent) => {
    if (!gameRef.current) return
    const rect = gameRef.current.getBoundingClientRect()

    let clientX, clientY
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    pointerRef.current.x = clientX - rect.left
    pointerRef.current.y = clientY - rect.top
  }, [])

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  const score = totalTime > 0 ? Math.round((timeOnTarget / totalTime) * 100) : 0

  return (
    <ProtectedRoute>
      {/* Game Limit Modal */}
      {showLimitModal && (
        <GameLimitModal
          gameName="Distraction Dodge"
          onClose={() => setShowLimitModal(false)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-orange-950/20 flex flex-col">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-20">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/adhd-games">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold font-heading">Distraction Dodge</h1>
            </div>
            <div className="flex items-center gap-4">
              {gameState === "playing" && (
                <div className="text-lg font-bold text-orange-400">Focus: {score}%</div>
              )}
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Health Bar + Speed Indicator */}
        {gameState === "playing" && (
          <div className="w-full flex items-center gap-2 px-2 py-1 bg-gray-900/80">
            <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-100"
                style={{ width: `${health}%` }}
              />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold">
              <span className="text-orange-400">⚡</span>
              <span className={`${speedLevel >= 6 ? 'text-red-400' : speedLevel >= 4 ? 'text-orange-400' : 'text-yellow-400'}`}>
                {(speedLevel / 2).toFixed(1)}x
              </span>
            </div>
          </div>
        )}

        {/* Game Area */}
        <main
          ref={gameRef}
          className="flex-1 relative overflow-hidden bg-gray-900/50 touch-none"
          onPointerMove={handlePointerMove}
          onTouchMove={handlePointerMove}
        >
          {/* Target */}
          {gameState === "playing" && (
            <div
              className="absolute w-[100px] h-[100px] rounded-full border-4 border-orange-500 bg-orange-500/20 transition-transform duration-75"
              style={{
                left: targetRef.current.x - 50,
                top: targetRef.current.y - 50,
                boxShadow: checkPointerOnTarget()
                  ? "0 0 30px rgba(251, 146, 60, 0.8), inset 0 0 30px rgba(251, 146, 60, 0.3)"
                  : "0 0 15px rgba(251, 146, 60, 0.4)"
              }}
            >
              <div className="absolute inset-4 rounded-full bg-orange-400/30 animate-pulse" />
            </div>
          )}

          {/* Distractors */}
          {gameState === "playing" && distractorsRef.current.map(d => (
            <div
              key={d.id}
              className="absolute rounded-full opacity-70 animate-pulse"
              style={{
                left: d.x - d.size / 2,
                top: d.y - d.size / 2,
                width: d.size,
                height: d.size,
                backgroundColor: d.color,
                boxShadow: `0 0 20px ${d.color}`,
              }}
            />
          ))}

          {/* Idle State */}
          {gameState === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-4">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-3">Distraction Dodge</h2>
                <p className="text-muted-foreground mb-4">
                  Keep your cursor/finger on the <span className="text-orange-400 font-bold">orange target</span> as it moves around.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Ignore the colorful distractors! Leaving the target for too long drains your health.
                </p>
                {highScore > 0 && (
                  <p className="text-lg text-yellow-400">🏆 Best Focus: {highScore}%</p>
                )}
              </div>
              <Button
                onClick={startGame}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-lg px-8 py-6"
              >
                Start Game
              </Button>
            </div>
          )}

          {/* End State */}
          {gameState === "ended" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-4 bg-black/60 backdrop-blur-sm">
              <div className="text-center max-w-md">
                <h2 className="text-4xl font-bold mb-3">Game Over!</h2>
                <p className="text-5xl font-bold text-orange-400 mb-2">{score}%</p>
                <p className="text-xl text-muted-foreground mb-4">focus accuracy</p>
                {score >= highScore && score > 0 && (
                  <p className="text-xl text-yellow-400 mb-4">🎉 New High Score!</p>
                )}
                <p className="text-muted-foreground">🏆 Best: {highScore}%</p>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={startGame}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold px-6"
                >
                  Play Again
                </Button>
                <Link href="/adhd-games">
                  <Button variant="outline" className="border-orange-500/30">
                    Back to Games
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}

