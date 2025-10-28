"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RotateCcw, Trophy, Clock } from "lucide-react"

interface MoodCard {
  id: number
  emoji: string
  mood: string
  color: string
  isFlipped: boolean
  isMatched: boolean
}

const MOODS = [
  { emoji: "😊", mood: "Happy", color: "from-yellow-400 to-orange-400" },
  { emoji: "😢", mood: "Sad", color: "from-blue-400 to-cyan-400" },
  { emoji: "😡", mood: "Angry", color: "from-red-400 to-pink-400" },
  { emoji: "😰", mood: "Anxious", color: "from-purple-400 to-indigo-400" },
  { emoji: "😌", mood: "Calm", color: "from-green-400 to-emerald-400" },
  { emoji: "😴", mood: "Tired", color: "from-slate-400 to-gray-400" },
  { emoji: "🤗", mood: "Loved", color: "from-pink-400 to-rose-400" },
  { emoji: "😎", mood: "Confident", color: "from-orange-400 to-amber-400" },
]

export function MoodMatcher() {
  const [cards, setCards] = useState<MoodCard[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [matches, setMatches] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [time, setTime] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  // Initialize game
  const initializeGame = () => {
    // Create pairs of cards
    const moodPairs = MOODS.map((mood, index) => [
      {
        id: index * 2,
        emoji: mood.emoji,
        mood: mood.mood,
        color: mood.color,
        isFlipped: false,
        isMatched: false,
      },
      {
        id: index * 2 + 1,
        emoji: mood.emoji,
        mood: mood.mood,
        color: mood.color,
        isFlipped: false,
        isMatched: false,
      },
    ]).flat()

    // Shuffle cards
    const shuffled = moodPairs.sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setFlippedCards([])
    setMoves(0)
    setMatches(0)
    setGameStarted(true)
    setGameComplete(false)
    setTime(0)
    setIsTimerRunning(true)
  }

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && !gameComplete) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, gameComplete])

  // Handle card click
  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2) return
    if (flippedCards.includes(cardId)) return
    if (cards.find((c) => c.id === cardId)?.isMatched) return

    const newFlipped = [...flippedCards, cardId]
    setFlippedCards(newFlipped)

    // Update card state
    setCards((prev) =>
      prev.map((card) => (card.id === cardId ? { ...card, isFlipped: true } : card))
    )

    // Check for match when 2 cards are flipped
    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1)
      const [first, second] = newFlipped
      const firstCard = cards.find((c) => c.id === first)
      const secondCard = cards.find((c) => c.id === second)

      if (firstCard && secondCard && firstCard.mood === secondCard.mood) {
        // Match found!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second ? { ...card, isMatched: true } : card
            )
          )
          setFlippedCards([])
          setMatches((prev) => {
            const newMatches = prev + 1
            if (newMatches === MOODS.length) {
              setGameComplete(true)
              setIsTimerRunning(false)
            }
            return newMatches
          })
        }, 500)
      } else {
        // No match - flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second ? { ...card, isFlipped: false } : card
            )
          )
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const calculateScore = () => {
    // Score based on moves and time (lower is better)
    const baseScore = 1000
    const movePenalty = moves * 10
    const timePenalty = time * 2
    return Math.max(0, baseScore - movePenalty - timePenalty)
  }

  if (!gameStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mood Matcher</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="text-6xl">🎭</div>
            <p className="text-muted-foreground">
              Match pairs of mood cards to complete the game. Test your memory and learn about different
              emotions!
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="p-3 rounded-lg bg-muted">
                <div className="font-semibold">8 Mood Pairs</div>
                <div className="text-xs">16 cards to match</div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="font-semibold">Memory Challenge</div>
                <div className="text-xs">Find all matches</div>
              </div>
            </div>
            <Button onClick={initializeGame} size="lg" className="w-full">
              Start Game
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (gameComplete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Congratulations!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <p className="text-lg font-semibold">You matched all the moods!</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-lg bg-primary/10">
                <div className="text-2xl font-bold text-primary">{moves}</div>
                <div className="text-xs text-muted-foreground">Moves</div>
              </div>
              <div className="p-4 rounded-lg bg-primary/10">
                <div className="text-2xl font-bold text-primary">{formatTime(time)}</div>
                <div className="text-xs text-muted-foreground">Time</div>
              </div>
              <div className="p-4 rounded-lg bg-primary/10">
                <div className="text-2xl font-bold text-primary">{calculateScore()}</div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
            </div>
            <Button onClick={initializeGame} size="lg" className="w-full gap-2">
              <RotateCcw className="w-4 h-4" />
              Play Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold">{moves}</div>
            <div className="text-xs text-muted-foreground">Moves</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold">{matches}/{MOODS.length}</div>
            <div className="text-xs text-muted-foreground">Matches</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold flex items-center justify-center gap-1">
              <Clock className="w-4 h-4" />
              {formatTime(time)}
            </div>
            <div className="text-xs text-muted-foreground">Time</div>
          </CardContent>
        </Card>
      </div>

      {/* Game Board */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-4 gap-3">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={card.isMatched || card.isFlipped}
                className={`aspect-square rounded-lg transition-all duration-300 transform ${
                  card.isFlipped || card.isMatched
                    ? `bg-gradient-to-br ${card.color} scale-100`
                    : "bg-gradient-to-br from-muted to-muted/50 hover:scale-105"
                } ${card.isMatched ? "opacity-50" : ""}`}
              >
                <div className="w-full h-full flex items-center justify-center">
                  {card.isFlipped || card.isMatched ? (
                    <div className="text-center">
                      <div className="text-3xl mb-1">{card.emoji}</div>
                      <div className="text-xs font-semibold text-white">{card.mood}</div>
                    </div>
                  ) : (
                    <div className="text-4xl">🎭</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reset Button */}
      <Button onClick={initializeGame} variant="outline" className="w-full gap-2">
        <RotateCcw className="w-4 h-4" />
        Restart Game
      </Button>
    </div>
  )
}

