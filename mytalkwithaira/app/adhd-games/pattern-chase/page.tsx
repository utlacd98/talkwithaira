"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Grid3X3 } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { useEffect, useRef, useState, useCallback } from "react"
import { useGameLimit } from "@/hooks/use-game-limit"
import { GameLimitModal } from "@/components/games/game-limit-modal"
import { useAuth } from "@/lib/auth-context"

const PAD_COLORS = [
  { base: "from-violet-600 to-purple-700", active: "from-violet-400 to-purple-500", glow: "violet" },
  { base: "from-cyan-600 to-blue-700", active: "from-cyan-400 to-blue-500", glow: "cyan" },
  { base: "from-green-600 to-emerald-700", active: "from-green-400 to-emerald-500", glow: "green" },
  { base: "from-orange-600 to-red-700", active: "from-orange-400 to-red-500", glow: "orange" },
]

export default function PatternChasePage() {
  const { user } = useAuth()
  const [gameState, setGameState] = useState<"idle" | "showing" | "input" | "success" | "failed">("idle")
  const [sequence, setSequence] = useState<number[]>([])
  const [playerIndex, setPlayerIndex] = useState(0)
  const [activePad, setActivePad] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [message, setMessage] = useState("")
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [isNewHighScore, setIsNewHighScore] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { canPlay, isPremium, recordPlay } = useGameLimit("pattern-chase")

  useEffect(() => {
    const saved = localStorage.getItem("patternChaseHighScore")
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
          game: 'pattern-chase',
          score: finalScore,
        }),
      })

      const data = await response.json()
      if (data.success && data.isNewHighScore) {
        setIsNewHighScore(true)
      }
    } catch (error) {
      console.error('[Pattern Chase] Error submitting score:', error)
    }
  }, [user])

  const flashPad = useCallback((index: number, duration = 400) => {
    setActivePad(index)
    return new Promise<void>(resolve => {
      setTimeout(() => {
        setActivePad(null)
        setTimeout(resolve, 150)
      }, duration)
    })
  }, [])

  const playSequence = useCallback(async (seq: number[]) => {
    setGameState("showing")
    setMessage("Watch the pattern...")
    await new Promise(r => setTimeout(r, 500))
    
    for (const padIndex of seq) {
      await flashPad(padIndex)
    }
    
    setGameState("input")
    setMessage("Your turn! Repeat the pattern")
    setPlayerIndex(0)
  }, [flashPad])

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

    const firstPad = Math.floor(Math.random() * 4)
    setSequence([firstPad])
    setScore(0)
    setPlayerIndex(0)
    setIsNewHighScore(false)
    playSequence([firstPad])
  }, [playSequence, canPlay, isPremium, recordPlay])

  const nextRound = useCallback(() => {
    const newPad = Math.floor(Math.random() * 4)
    const newSequence = [...sequence, newPad]
    setSequence(newSequence)
    setPlayerIndex(0)
    playSequence(newSequence)
  }, [sequence, playSequence])

  const handlePadClick = useCallback(async (index: number) => {
    if (gameState !== "input") return

    await flashPad(index, 200)

    if (index === sequence[playerIndex]) {
      // Correct
      if (playerIndex === sequence.length - 1) {
        // Completed sequence
        const newScore = sequence.length
        setScore(newScore)
        if (newScore > highScore) {
          setHighScore(newScore)
          localStorage.setItem("patternChaseHighScore", newScore.toString())
        }
        setGameState("success")
        setMessage("Correct! Get ready for the next round...")
        timeoutRef.current = setTimeout(nextRound, 1500)
      } else {
        setPlayerIndex(playerIndex + 1)
      }
    } else {
      // Wrong - submit final score before ending
      const finalScore = sequence.length - 1 // Score is the last completed sequence length
      if (finalScore > 0) {
        submitScoreToLeaderboard(finalScore)
      }
      setGameState("failed")
      setMessage("Wrong! Try again.")
    }
  }, [gameState, sequence, playerIndex, highScore, nextRound, flashPad, submitScoreToLeaderboard])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <ProtectedRoute>
      {/* Game Limit Modal */}
      {showLimitModal && (
        <GameLimitModal
          gameName="Pattern Chase"
          onClose={() => setShowLimitModal(false)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-violet-950/20 flex flex-col">
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Grid3X3 className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold font-heading">Pattern Chase</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-lg font-bold text-violet-400">Level: {score}</div>
              <div className="text-sm text-yellow-400">🏆 Best: {highScore}</div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Game Area */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
          {/* Message */}
          <div className="text-center mb-4">
            <p className="text-lg text-muted-foreground">{message || "Test your memory!"}</p>
          </div>

          {/* Game Grid */}
          <div className="grid grid-cols-2 gap-4 max-w-xs w-full">
            {PAD_COLORS.map((color, index) => (
              <button
                key={index}
                onClick={() => handlePadClick(index)}
                disabled={gameState !== "input"}
                className={`
                  aspect-square rounded-2xl transition-all duration-200
                  bg-gradient-to-br ${activePad === index ? color.active : color.base}
                  ${activePad === index ? `shadow-[0_0_40px_rgba(var(--${color.glow}),0.6)]` : ""}
                  ${gameState === "input" ? "cursor-pointer hover:scale-105 active:scale-95" : "cursor-default"}
                  border-2 border-white/10
                `}
                style={{
                  boxShadow: activePad === index
                    ? `0 0 60px 10px rgba(${color.glow === 'violet' ? '139,92,246' : color.glow === 'cyan' ? '34,211,238' : color.glow === 'green' ? '74,222,128' : '251,146,60'}, 0.5)`
                    : undefined
                }}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-4 mt-6">
            {gameState === "idle" && (
              <div className="text-center">
                <p className="text-muted-foreground mb-4 max-w-sm">
                  Watch the glowing pads and repeat the pattern. Each round adds one more to remember!
                </p>
                <Button
                  onClick={startGame}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold text-lg px-8 py-6"
                >
                  Start Game
                </Button>
              </div>
            )}

            {gameState === "failed" && (
              <div className="text-center">
                <p className="text-3xl font-bold mb-2">Game Over!</p>
                <p className="text-xl text-violet-400 mb-4">You reached level {score}</p>
                {score >= highScore && score > 0 && (
                  <p className="text-yellow-400 mb-4">🎉 New High Score!</p>
                )}
                <div className="flex gap-4">
                  <Button
                    onClick={startGame}
                    className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold px-6"
                  >
                    Try Again
                  </Button>
                  <Link href="/adhd-games">
                    <Button variant="outline" className="border-violet-500/30">
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

