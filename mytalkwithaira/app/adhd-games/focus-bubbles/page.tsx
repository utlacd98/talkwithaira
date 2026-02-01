"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Target } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { useEffect, useRef, useState, useCallback } from "react"
import { useGameLimit } from "@/hooks/use-game-limit"
import { GameLimitModal } from "@/components/games/game-limit-modal"
import { useAuth } from "@/lib/auth-context"

export default function FocusBubblesPage() {
  const { user } = useAuth()
  const gameRef = useRef<HTMLDivElement>(null)
  const [gameState, setGameState] = useState<"idle" | "playing" | "ended">("idle")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [highScore, setHighScore] = useState(0)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [isNewHighScore, setIsNewHighScore] = useState(false)
  const bubblesRef = useRef<Set<HTMLDivElement>>(new Set())
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const difficultyRef = useRef(1)
  const isPlayingRef = useRef(false)
  const popSoundRef = useRef<HTMLAudioElement | null>(null)

  // Initialize pop sound
  useEffect(() => {
    popSoundRef.current = new Audio('/pop-423717.mp3')
    popSoundRef.current.volume = 0.5
  }, [])

  const { canPlay, isPremium, recordPlay, playsRemaining } = useGameLimit("focus-bubbles")

  useEffect(() => {
    const saved = localStorage.getItem("focusBubblesHighScore")
    if (saved) setHighScore(parseInt(saved))
  }, [])

  const spawnBubble = useCallback(() => {
    if (!gameRef.current || !isPlayingRef.current) return
    const container = gameRef.current
    const bubble = document.createElement("div")
    const isGreen = Math.random() > 0.35
    // Larger bubbles on mobile for easier tapping
    const isMobile = window.innerWidth < 640
    const size = isMobile ? (50 + Math.random() * 35) : (40 + Math.random() * 30)

    bubble.className = `absolute rounded-full cursor-pointer transition-transform active:scale-90`
    bubble.style.width = `${size}px`
    bubble.style.height = `${size}px`
    bubble.style.left = `${Math.random() * (container.clientWidth - size)}px`
    bubble.style.top = `${Math.random() * (container.clientHeight - size)}px`
    bubble.style.background = isGreen
      ? "radial-gradient(circle at 30% 30%, #4ade80, #16a34a)"
      : "radial-gradient(circle at 30% 30%, #f87171, #dc2626)"
    bubble.style.boxShadow = isGreen
      ? "0 0 20px rgba(74, 222, 128, 0.6), inset 0 0 10px rgba(255,255,255,0.3)"
      : "0 0 20px rgba(248, 113, 113, 0.6), inset 0 0 10px rgba(255,255,255,0.3)"
    bubble.style.animation = `bubbleFade ${2.5 / difficultyRef.current}s forwards`
    bubble.style.zIndex = "10"
    bubble.dataset.type = isGreen ? "green" : "red"

    const handleClick = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      if (bubble.dataset.type === "green") {
        setScore(prev => prev + 1)
        bubble.style.transform = "scale(1.5)"
        bubble.style.opacity = "0"
        bubble.style.background = "radial-gradient(circle at 30% 30%, #86efac, #22c55e)"
        // Play pop sound
        if (popSoundRef.current) {
          popSoundRef.current.currentTime = 0
          popSoundRef.current.play().catch(() => {})
        }
      } else {
        setScore(prev => Math.max(0, prev - 1))
        bubble.style.transform = "scale(0.5)"
        bubble.style.background = "radial-gradient(circle at 30% 30%, #1f1f1f, #000)"
      }
      bubble.removeEventListener("click", handleClick)
      bubble.removeEventListener("touchstart", handleClick)
      setTimeout(() => {
        bubble.remove()
        bubblesRef.current.delete(bubble)
      }, 150)
    }

    bubble.addEventListener("click", handleClick)
    bubble.addEventListener("touchstart", handleClick, { passive: false })

    container.appendChild(bubble)
    bubblesRef.current.add(bubble)

    // Remove after fade
    const fadeTime = 2500 / difficultyRef.current
    setTimeout(() => {
      if (bubblesRef.current.has(bubble)) {
        bubble.remove()
        bubblesRef.current.delete(bubble)
      }
    }, fadeTime)
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
          game: 'focus-bubbles',
          score: finalScore,
        }),
      })

      const data = await response.json()
      if (data.success && data.isNewHighScore) {
        setIsNewHighScore(true)
      }
    } catch (error) {
      console.error('[Focus Bubbles] Error submitting score:', error)
    }
  }, [user])

  const endGame = useCallback(() => {
    isPlayingRef.current = false
    setGameState("ended")
    if (timerRef.current) clearInterval(timerRef.current)
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current)

    // Clear remaining bubbles
    bubblesRef.current.forEach(b => b.remove())
    bubblesRef.current.clear()

    setScore(current => {
      if (current > highScore) {
        setHighScore(current)
        localStorage.setItem("focusBubblesHighScore", current.toString())
      }
      // Submit score to leaderboard
      submitScoreToLeaderboard(current)
      return current
    })
  }, [highScore, submitScoreToLeaderboard])

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

    // Clear any existing intervals
    if (timerRef.current) clearInterval(timerRef.current)
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current)

    // Clear existing bubbles
    bubblesRef.current.forEach(b => b.remove())
    bubblesRef.current.clear()

    isPlayingRef.current = true
    setGameState("playing")
    setScore(0)
    setTimeLeft(60)
    setIsNewHighScore(false)
    difficultyRef.current = 1

    // Timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        // Increase difficulty every 10 seconds
        if ((60 - prev + 1) % 10 === 0) {
          difficultyRef.current = Math.min(difficultyRef.current + 0.3, 3)
        }
        return prev - 1
      })
    }, 1000)

    // Initial spawn
    setTimeout(() => spawnBubble(), 100)

    // Continuous spawning
    const runSpawnLoop = () => {
      if (!isPlayingRef.current) return

      const spawnCount = Math.floor(difficultyRef.current)
      for (let i = 0; i < spawnCount; i++) {
        setTimeout(() => {
          if (isPlayingRef.current) spawnBubble()
        }, i * 200)
      }

      spawnIntervalRef.current = setTimeout(runSpawnLoop, 1000 / difficultyRef.current)
    }

    setTimeout(runSpawnLoop, 500)
  }, [spawnBubble, endGame, canPlay, isPremium, recordPlay])

  useEffect(() => {
    return () => {
      isPlayingRef.current = false
      if (timerRef.current) clearInterval(timerRef.current)
      if (spawnIntervalRef.current) clearTimeout(spawnIntervalRef.current)
      bubblesRef.current.forEach(b => b.remove())
      bubblesRef.current.clear()
    }
  }, [])

  return (
    <ProtectedRoute>
      {/* Game Limit Modal */}
      {showLimitModal && (
        <GameLimitModal
          gameName="Focus Bubbles"
          onClose={() => setShowLimitModal(false)}
        />
      )}

      <div className="h-screen max-h-screen bg-gradient-to-br from-background via-background to-green-950/20 flex flex-col overflow-hidden">
        {/* Header - Compact on mobile */}
        <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-20 flex-shrink-0">
          <div className="container mx-auto px-2 sm:px-4 h-12 sm:h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/adhd-games">
                <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 px-2 sm:px-3">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              </Link>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Target className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <h1 className="text-base sm:text-xl font-bold font-heading">Focus Bubbles</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {gameState === "playing" && (
                <>
                  <div className="text-sm sm:text-lg font-bold text-green-400">{score}</div>
                  <div className="text-sm sm:text-lg font-bold text-orange-400">{timeLeft}s</div>
                </>
              )}
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Game Area - Full remaining height */}
        <main className="flex-1 relative overflow-hidden touch-none select-none" style={{ minHeight: 0 }}>
          {/* CSS for animations */}
          <style jsx global>{`
            @keyframes bubbleFade {
              0% { opacity: 1; transform: scale(1); }
              70% { opacity: 0.7; }
              100% { opacity: 0; transform: scale(0.3); }
            }
          `}</style>

          {/* Game Container */}
          <div
            ref={gameRef}
            className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-gray-950/80"
          >
            {/* Idle State */}
            {gameState === "idle" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 sm:gap-6 p-4 safe-area-inset">
                <div className="text-center max-w-md px-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <Target className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Focus Bubbles</h2>
                  <p className="text-sm sm:text-base text-muted-foreground mb-2">
                    Tap <span className="text-green-400 font-bold">GREEN</span> bubbles to score points.
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                    Avoid <span className="text-red-400 font-bold">RED</span> bubbles or lose points!
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Speed increases as you play. You have 60 seconds.
                  </p>
                  {highScore > 0 && (
                    <p className="mt-3 sm:mt-4 text-base sm:text-lg text-yellow-400">🏆 High Score: {highScore}</p>
                  )}
                </div>
                <Button
                  onClick={startGame}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-lg shadow-green-500/30"
                >
                  Start Game
                </Button>
              </div>
            )}

            {/* End State */}
            {gameState === "ended" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 sm:gap-6 p-4 bg-black/70 backdrop-blur-sm safe-area-inset">
                <div className="text-center max-w-md">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-3">Game Over!</h2>
                  <p className="text-4xl sm:text-5xl font-bold text-green-400 mb-1 sm:mb-2">{score}</p>
                  <p className="text-lg sm:text-xl text-muted-foreground mb-3 sm:mb-4">points</p>
                  {score >= highScore && score > 0 && (
                    <p className="text-lg sm:text-xl text-yellow-400 mb-3 sm:mb-4">🎉 New High Score!</p>
                  )}
                  <p className="text-muted-foreground">🏆 Best: {highScore}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-xs">
                  <Button
                    onClick={startGame}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-6 py-3 flex-1"
                  >
                    Play Again
                  </Button>
                  <Link href="/adhd-games" className="flex-1">
                    <Button variant="outline" className="border-green-500/30 w-full py-3">
                      Back to Games
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

