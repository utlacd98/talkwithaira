"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Type, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { useEffect, useRef, useState, useCallback } from "react"
import { useGameLimit } from "@/hooks/use-game-limit"
import { GameLimitModal } from "@/components/games/game-limit-modal"
import { useAuth } from "@/lib/auth-context"

interface FallingWord {
  id: number
  word: string
  category: "emotion" | "action"
  y: number
  x: number
}

// Easy words - clear distinction
const EASY_WORDS = [
  { word: "Happy", category: "emotion" },
  { word: "Running", category: "action" },
  { word: "Sad", category: "emotion" },
  { word: "Jumping", category: "action" },
  { word: "Excited", category: "emotion" },
  { word: "Swimming", category: "action" },
  { word: "Angry", category: "emotion" },
  { word: "Dancing", category: "action" },
  { word: "Calm", category: "emotion" },
  { word: "Walking", category: "action" },
  { word: "Scared", category: "emotion" },
  { word: "Cooking", category: "action" },
] as const

// Medium words - slightly trickier
const MEDIUM_WORDS = [
  { word: "Anxious", category: "emotion" },
  { word: "Writing", category: "action" },
  { word: "Peaceful", category: "emotion" },
  { word: "Reading", category: "action" },
  { word: "Hopeful", category: "emotion" },
  { word: "Climbing", category: "action" },
  { word: "Nervous", category: "emotion" },
  { word: "Painting", category: "action" },
  { word: "Grateful", category: "emotion" },
  { word: "Typing", category: "action" },
  { word: "Worried", category: "emotion" },
  { word: "Building", category: "action" },
  { word: "Content", category: "emotion" },
  { word: "Stretching", category: "action" },
  { word: "Proud", category: "emotion" },
  { word: "Driving", category: "action" },
] as const

// Hard words - ambiguous, could feel like both
const HARD_WORDS = [
  { word: "Longing", category: "emotion" },    // Could seem like action (longing for)
  { word: "Wondering", category: "action" },   // Could seem emotional
  { word: "Suffering", category: "emotion" },  // Has -ing ending like actions
  { word: "Dreaming", category: "action" },    // Feels emotional
  { word: "Yearning", category: "emotion" },   // -ing ending
  { word: "Reflecting", category: "action" },  // Feels emotional
  { word: "Despair", category: "emotion" },    // No -ing, clear but intense
  { word: "Pondering", category: "action" },   // Feels emotional
  { word: "Anguish", category: "emotion" },    // Intense emotion
  { word: "Meditating", category: "action" },  // Feels like a state
  { word: "Grief", category: "emotion" },      // Strong emotion
  { word: "Contemplating", category: "action" }, // Very mental
  { word: "Dread", category: "emotion" },      // No -ing
  { word: "Observing", category: "action" },   // Passive action
  { word: "Bliss", category: "emotion" },      // Pure emotion
  { word: "Hesitating", category: "action" },  // Feels emotional
  { word: "Melancholy", category: "emotion" }, // Complex emotion
  { word: "Anticipating", category: "action" }, // Feels like emotion
  { word: "Euphoria", category: "emotion" },   // Intense
  { word: "Procrastinating", category: "action" }, // ADHD relatable!
] as const

// All words combined for reference
const ALL_WORDS = [...EASY_WORDS, ...MEDIUM_WORDS, ...HARD_WORDS] as const

export default function WordSortPage() {
  const { user } = useAuth()
  const gameRef = useRef<HTMLDivElement>(null)
  const [gameState, setGameState] = useState<"idle" | "playing" | "ended">("idle")
  const [score, setScore] = useState(0)
  const [wordsProcessed, setWordsProcessed] = useState(0)
  const [currentWord, setCurrentWord] = useState<FallingWord | null>(null)
  const [timeLeft, setTimeLeft] = useState(60)
  const [highScore, setHighScore] = useState(0)
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [isNewHighScore, setIsNewHighScore] = useState(false)
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy")
  const [speedMultiplier, setSpeedMultiplier] = useState(1)

  const wordIndexRef = useRef(0)
  const animationRef = useRef<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const lastTimeRef = useRef(0)
  const gameStartTimeRef = useRef(0)
  const shuffledWordsRef = useRef<typeof ALL_WORDS[number][]>([])

  const { canPlay, isPremium, recordPlay } = useGameLimit("word-sort")

  useEffect(() => {
    const saved = localStorage.getItem("wordSortHighScore")
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
          game: 'word-sort',
          score: finalScore,
        }),
      })

      const data = await response.json()
      if (data.success && data.isNewHighScore) {
        setIsNewHighScore(true)
      }
    } catch (error) {
      console.error('[Word Sort] Error submitting score:', error)
    }
  }, [user])

  const getWordsForDifficulty = useCallback((diff: "easy" | "medium" | "hard") => {
    switch (diff) {
      case "easy":
        return [...EASY_WORDS].sort(() => Math.random() - 0.5)
      case "medium":
        // Mix of easy and medium words
        return [...EASY_WORDS, ...MEDIUM_WORDS].sort(() => Math.random() - 0.5)
      case "hard":
        // Mix of medium and hard words (no easy)
        return [...MEDIUM_WORDS, ...HARD_WORDS].sort(() => Math.random() - 0.5)
    }
  }, [])

  const shuffleWords = useCallback((diff: "easy" | "medium" | "hard" = "easy") => {
    shuffledWordsRef.current = getWordsForDifficulty(diff)
  }, [getWordsForDifficulty])

  const spawnWord = useCallback(() => {
    if (wordIndexRef.current >= shuffledWordsRef.current.length) {
      shuffleWords(difficulty)
      wordIndexRef.current = 0
    }

    const wordData = shuffledWordsRef.current[wordIndexRef.current]
    wordIndexRef.current++

    // Random horizontal position (20-80% to keep away from edges)
    const randomX = 20 + Math.random() * 60

    const word: FallingWord = {
      id: Date.now(),
      word: wordData.word,
      category: wordData.category,
      y: 0,
      x: randomX,
    }
    setCurrentWord(word)
  }, [shuffleWords, difficulty])

  const gameLoop = useCallback((timestamp: number) => {
    const delta = timestamp - lastTimeRef.current
    lastTimeRef.current = timestamp

    // Calculate elapsed time and update difficulty/speed
    const elapsedSeconds = (timestamp - gameStartTimeRef.current) / 1000

    // Speed increases: starts at 1x, increases 8% per second, max 3x
    const newSpeedMult = Math.min(1 + elapsedSeconds * 0.08, 3)
    setSpeedMultiplier(newSpeedMult)

    // Difficulty increases based on time
    // 0-15s: Easy, 15-35s: Medium, 35s+: Hard
    if (elapsedSeconds < 15) {
      setDifficulty("easy")
    } else if (elapsedSeconds < 35) {
      setDifficulty("medium")
    } else {
      setDifficulty("hard")
    }

    setCurrentWord(prev => {
      if (!prev) return prev
      // Base speed * multiplier (faster over time)
      const fallSpeed = 0.04 * newSpeedMult
      const newY = prev.y + delta * fallSpeed
      if (newY > 80) {
        // Word missed - count as wrong
        setScore(s => Math.max(0, s - 1))
        setWordsProcessed(w => w + 1)
        spawnWord()
        return null
      }
      return { ...prev, y: newY }
    })

    animationRef.current = requestAnimationFrame(gameLoop)
  }, [spawnWord])

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

    // Reset difficulty and speed
    setDifficulty("easy")
    setSpeedMultiplier(1)

    shuffleWords("easy")
    wordIndexRef.current = 0
    setGameState("playing")
    setScore(0)
    setWordsProcessed(0)
    setTimeLeft(60)
    setFeedback(null)
    setIsNewHighScore(false)

    spawnWord()
    const now = performance.now()
    lastTimeRef.current = now
    gameStartTimeRef.current = now
    animationRef.current = requestAnimationFrame(gameLoop)

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [shuffleWords, spawnWord, gameLoop, canPlay, isPremium, recordPlay])

  const endGame = useCallback(() => {
    setGameState("ended")
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    if (timerRef.current) clearInterval(timerRef.current)

    setScore(current => {
      if (current > highScore) {
        setHighScore(current)
        localStorage.setItem("wordSortHighScore", current.toString())
      }
      // Submit score to leaderboard
      submitScoreToLeaderboard(current)
      return current
    })
  }, [highScore, submitScoreToLeaderboard])

  const handleSort = useCallback((side: "left" | "right") => {
    if (!currentWord || gameState !== "playing") return
    
    const isCorrect = (side === "left" && currentWord.category === "emotion") ||
                      (side === "right" && currentWord.category === "action")
    
    if (isCorrect) {
      setScore(s => s + 1)
      setFeedback("correct")
    } else {
      setScore(s => Math.max(0, s - 1))
      setFeedback("wrong")
    }
    
    setWordsProcessed(w => {
      const newCount = w + 1
      if (newCount >= 30) {
        setTimeout(endGame, 100)
      }
      return newCount
    })
    
    setTimeout(() => setFeedback(null), 300)
    spawnWord()
  }, [currentWord, gameState, spawnWord, endGame])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing") return
      if (e.key === "ArrowLeft") handleSort("left")
      if (e.key === "ArrowRight") handleSort("right")
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [gameState, handleSort])

  // Touch swipe
  const touchStartRef = useRef<number | null>(null)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return
    const diff = e.changedTouches[0].clientX - touchStartRef.current
    if (Math.abs(diff) > 50) {
      handleSort(diff < 0 ? "left" : "right")
    }
    touchStartRef.current = null
  }

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return (
    <ProtectedRoute>
      {/* Game Limit Modal */}
      {showLimitModal && (
        <GameLimitModal
          gameName="Word Sort"
          onClose={() => setShowLimitModal(false)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-cyan-950/20 flex flex-col">
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Type className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold font-heading">Word Sort</h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              {gameState === "playing" && (
                <>
                  <div className="text-sm md:text-lg font-bold text-cyan-400">{score}</div>
                  <div className="text-sm md:text-lg font-bold text-orange-400">{timeLeft}s</div>
                  <div className={`px-2 py-0.5 rounded text-xs font-bold ${
                    difficulty === "easy" ? "bg-green-500/20 text-green-400" :
                    difficulty === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-red-500/20 text-red-400"
                  }`}>
                    {difficulty.toUpperCase()}
                  </div>
                  <div className="text-xs font-bold text-purple-400">
                    ⚡{speedMultiplier.toFixed(1)}x
                  </div>
                </>
              )}
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Game Area */}
        <main
          ref={gameRef}
          className="flex-1 relative overflow-hidden bg-gradient-to-b from-gray-900/30 to-gray-950/50"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Category Labels */}
          {gameState === "playing" && (
            <>
              <div className="absolute left-4 top-4 px-4 py-2 rounded-lg bg-pink-500/20 border border-pink-500/40">
                <span className="text-pink-400 font-bold">← EMOTIONS</span>
              </div>
              <div className="absolute right-4 top-4 px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/40">
                <span className="text-blue-400 font-bold">ACTIONS →</span>
              </div>
            </>
          )}

          {/* Falling Word */}
          {gameState === "playing" && currentWord && (
            <div
              className={`absolute left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl font-bold text-2xl transition-all duration-100
                ${feedback === "correct" ? "bg-green-500 scale-110" : feedback === "wrong" ? "bg-red-500 scale-90" : "bg-gradient-to-r from-cyan-500 to-blue-600"}
              `}
              style={{ top: `${currentWord.y}%` }}
            >
              {currentWord.word}
            </div>
          )}

          {/* Sort Buttons */}
          {gameState === "playing" && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 px-4">
              <Button
                onClick={() => handleSort("left")}
                className="h-20 w-32 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-lg"
              >
                <ChevronLeft className="w-8 h-8" />
                Emotion
              </Button>
              <Button
                onClick={() => handleSort("right")}
                className="h-20 w-32 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-lg"
              >
                Action
                <ChevronRight className="w-8 h-8" />
              </Button>
            </div>
          )}

          {/* Idle State */}
          {gameState === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-4">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Type className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-3">Word Sort</h2>
                <p className="text-muted-foreground mb-2">
                  Sort words into <span className="text-pink-400 font-bold">EMOTIONS</span> or <span className="text-blue-400 font-bold">ACTIONS</span>
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  Swipe, tap the buttons, or use arrow keys. Sort 30 words or survive 60 seconds!
                </p>
                <p className="text-xs text-yellow-400/80 mb-4">
                  ⚠️ Speed increases over time. Words get trickier as you progress!
                </p>
                {highScore > 0 && (
                  <p className="text-lg text-yellow-400">🏆 High Score: {highScore}</p>
                )}
              </div>
              <Button
                onClick={startGame}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-lg px-8 py-6"
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
                <p className="text-5xl font-bold text-cyan-400 mb-2">{score}</p>
                <p className="text-xl text-muted-foreground mb-4">points</p>
                <p className="text-muted-foreground mb-2">Words sorted: {wordsProcessed}/30</p>
                {score >= highScore && score > 0 && (
                  <p className="text-xl text-yellow-400 mb-4">🎉 New High Score!</p>
                )}
                <p className="text-muted-foreground">🏆 Best: {highScore}</p>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={startGame}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold px-6"
                >
                  Play Again
                </Button>
                <Link href="/adhd-games">
                  <Button variant="outline" className="border-cyan-500/30">
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

