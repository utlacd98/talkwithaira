"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Trophy, Clock, RotateCcw, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface MemoryCard {
  id: number
  symbol: string
  isFlipped: boolean
  isMatched: boolean
}

const CARD_SYMBOLS = ["🌟", "🎨", "🎭", "🎪", "🎯", "🎲", "🎸", "🎹"]
const DIFFICULTY_LEVELS = {
  easy: { pairs: 6, name: "Easy" },
  medium: { pairs: 8, name: "Medium" },
  hard: { pairs: 10, name: "Hard" },
}

export function MemoryChallenge() {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [cards, setCards] = useState<MemoryCard[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [moves, setMoves] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [bestScore, setBestScore] = useState<number | null>(null)

  // Initialize game
  const initializeGame = (level: "easy" | "medium" | "hard") => {
    const numPairs = DIFFICULTY_LEVELS[level].pairs
    const symbols = CARD_SYMBOLS.slice(0, numPairs)
    
    // Create pairs and shuffle
    const cardPairs = [...symbols, ...symbols]
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5)

    setCards(cardPairs)
    setFlippedCards([])
    setMatchedPairs(0)
    setMoves(0)
    setTimeElapsed(0)
    setIsPlaying(true)
    setGameWon(false)
    setDifficulty(level)
  }

  // Handle card click
  const handleCardClick = (cardId: number) => {
    if (!isPlaying || gameWon) return
    
    const card = cards.find(c => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched) return
    
    // Can't flip more than 2 cards
    if (flippedCards.length >= 2) return

    // Flip the card
    const newCards = cards.map(c =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    )
    setCards(newCards)
    
    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)

    // Check for match when 2 cards are flipped
    if (newFlippedCards.length === 2) {
      setMoves(moves + 1)
      
      const [firstId, secondId] = newFlippedCards
      const firstCard = newCards.find(c => c.id === firstId)
      const secondCard = newCards.find(c => c.id === secondId)

      if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
        // Match found!
        setTimeout(() => {
          const matchedCards = newCards.map(c =>
            c.id === firstId || c.id === secondId
              ? { ...c, isMatched: true }
              : c
          )
          setCards(matchedCards)
          setFlippedCards([])
          setMatchedPairs(matchedPairs + 1)

          // Check if game is won
          if (matchedPairs + 1 === DIFFICULTY_LEVELS[difficulty].pairs) {
            setGameWon(true)
            setIsPlaying(false)
            
            // Update best score
            const score = calculateScore()
            if (!bestScore || score > bestScore) {
              setBestScore(score)
              localStorage.setItem(`memory-best-${difficulty}`, score.toString())
            }
          }
        }, 500)
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          const unflippedCards = newCards.map(c =>
            c.id === firstId || c.id === secondId
              ? { ...c, isFlipped: false }
              : c
          )
          setCards(unflippedCards)
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  // Calculate score (higher is better)
  const calculateScore = () => {
    const timePenalty = Math.floor(timeElapsed / 10)
    const movePenalty = moves * 5
    const baseScore = 1000
    return Math.max(0, baseScore - timePenalty - movePenalty)
  }

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isPlaying && !gameWon) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, gameWon])

  // Load best score on mount
  useEffect(() => {
    const saved = localStorage.getItem(`memory-best-${difficulty}`)
    if (saved) {
      setBestScore(parseInt(saved))
    }
  }, [difficulty])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Memory Challenge
        </CardTitle>
        <CardDescription>
          Match all the pairs to win! Test your memory skills.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Difficulty Selection */}
        {!isPlaying && !gameWon && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold mb-2">Choose Difficulty:</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(DIFFICULTY_LEVELS).map(([key, { name, pairs }]) => (
                  <Button
                    key={key}
                    onClick={() => initializeGame(key as "easy" | "medium" | "hard")}
                    variant={difficulty === key ? "default" : "outline"}
                    className="flex flex-col h-auto py-3"
                  >
                    <span className="font-bold">{name}</span>
                    <span className="text-xs">{pairs} pairs</span>
                  </Button>
                ))}
              </div>
            </div>

            {bestScore !== null && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
                <Star className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-sm font-semibold">Best Score: {bestScore}</p>
              </div>
            )}
          </div>
        )}

        {/* Game Stats */}
        {isPlaying && (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <Clock className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm font-semibold">{formatTime(timeElapsed)}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <Trophy className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm font-semibold">{matchedPairs}/{DIFFICULTY_LEVELS[difficulty].pairs}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <RotateCcw className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm font-semibold">{moves} moves</p>
            </div>
          </div>
        )}

        {/* Game Board */}
        {isPlaying && (
          <div className={cn(
            "grid gap-2 mx-auto",
            difficulty === "easy" && "grid-cols-4 max-w-md",
            difficulty === "medium" && "grid-cols-4 max-w-md",
            difficulty === "hard" && "grid-cols-5 max-w-lg"
          )}>
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={card.isMatched || card.isFlipped}
                className={cn(
                  "aspect-square rounded-lg border-2 flex items-center justify-center text-4xl transition-all",
                  "hover:scale-105 active:scale-95",
                  card.isFlipped || card.isMatched
                    ? "bg-primary/20 border-primary/40"
                    : "bg-muted/50 border-border hover:border-primary/50",
                  card.isMatched && "opacity-50"
                )}
              >
                {(card.isFlipped || card.isMatched) ? card.symbol : "?"}
              </button>
            ))}
          </div>
        )}

        {/* Game Won */}
        {gameWon && (
          <div className="text-center space-y-4 py-4">
            <div className="p-6 rounded-lg bg-green-500/10 border border-green-500/20">
              <Trophy className="w-16 h-16 mx-auto mb-3 text-green-500" />
              <p className="text-2xl font-bold mb-2">Congratulations! 🎉</p>
              <p className="text-muted-foreground mb-4">
                You completed the {DIFFICULTY_LEVELS[difficulty].name} level!
              </p>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">Time:</span> {formatTime(timeElapsed)}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Moves:</span> {moves}
                </p>
                <p className="text-lg font-bold text-primary">
                  Score: {calculateScore()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => initializeGame(difficulty)} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              <Button onClick={() => setIsPlaying(false)} variant="outline" className="flex-1">
                Change Difficulty
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

