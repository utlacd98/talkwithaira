"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getRandomReaction } from "@/lib/airaReactions"
import { useAuth } from "@/lib/auth-context"
import { RotateCcw, Volume2 } from "lucide-react"

type BoardValue = "X" | "O" | null
type GameStatus = "playing" | "won" | "lost" | "draw"
type Difficulty = "easy" | "hard"

interface GameStats {
  wins: number
  losses: number
  draws: number
}

export function TicTacToe() {
  const { user } = useAuth()
  const [board, setBoard] = useState<BoardValue[]>(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(false) // O is human, X is AI
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing")
  const [stats, setStats] = useState<GameStats>({ wins: 0, losses: 0, draws: 0 })
  const [airaMessage, setAiraMessage] = useState(getRandomReaction("start"))
  const [gameStarted, setGameStarted] = useState(false)
  const [moveCount, setMoveCount] = useState(0)
  const [isSavingStats, setIsSavingStats] = useState(false)
  const [difficulty, setDifficulty] = useState<Difficulty>("easy")

  // Save game stats to Redis
  const saveGameStats = async (result: "win" | "loss" | "draw") => {
    if (!user?.id || isSavingStats) return

    try {
      setIsSavingStats(true)
      const response = await fetch("/api/games/save-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          game: "tictactoe",
          result,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        console.error("[TicTacToe] Failed to save stats:", response.statusText)
      } else {
        console.log("[TicTacToe] Stats saved successfully for result:", result)
      }
    } catch (error) {
      console.error("[TicTacToe] Error saving stats:", error)
    } finally {
      setIsSavingStats(false)
    }
  }

  // Calculate winner
  const calculateWinner = (squares: BoardValue[]): BoardValue => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]
    for (let line of lines) {
      const [a, b, c] = line
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }
    return null
  }

  // Minimax AI
  const minimax = (squares: BoardValue[], depth: number, isMaximizing: boolean): number => {
    const winner = calculateWinner(squares)
    if (winner === "X") return 10 - depth
    if (winner === "O") return depth - 10
    if (squares.every((s) => s !== null)) return 0

    if (isMaximizing) {
      let bestScore = -Infinity
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = "X"
          const score = minimax(squares, depth + 1, false)
          squares[i] = null
          bestScore = Math.max(score, bestScore)
        }
      }
      return bestScore
    } else {
      let bestScore = Infinity
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = "O"
          const score = minimax(squares, depth + 1, true)
          squares[i] = null
          bestScore = Math.min(score, bestScore)
        }
      }
      return bestScore
    }
  }

  // Get best move for AI
  const getBestMove = (squares: BoardValue[]): number => {
    // Easy mode: 50% chance to make a random move instead of optimal
    if (difficulty === "easy" && Math.random() < 0.5) {
      const availableMoves = squares
        .map((val, idx) => (val === null ? idx : null))
        .filter((val) => val !== null) as number[]
      return availableMoves[Math.floor(Math.random() * availableMoves.length)]
    }

    // Hard mode: Always use minimax for optimal play
    let bestScore = -Infinity
    let bestMove = 0
    for (let i = 0; i < 9; i++) {
      if (squares[i] === null) {
        squares[i] = "X"
        const score = minimax(squares, 0, false)
        squares[i] = null
        if (score > bestScore) {
          bestScore = score
          bestMove = i
        }
      }
    }
    return bestMove
  }

  // Handle player move
  const handleClick = (index: number) => {
    if (board[index] || gameStatus !== "playing" || isXNext) return

    const newBoard = [...board]
    newBoard[index] = "O"
    setBoard(newBoard)
    setMoveCount((prev) => prev + 1)

    const winner = calculateWinner(newBoard)
    if (winner === "O") {
      setGameStatus("won")
      setAiraMessage(getRandomReaction("win"))
      setStats((prev) => ({ ...prev, wins: prev.wins + 1 }))
      saveGameStats("win")
      return
    }

    if (newBoard.every((s) => s !== null)) {
      setGameStatus("draw")
      setAiraMessage(getRandomReaction("draw"))
      setStats((prev) => ({ ...prev, draws: prev.draws + 1 }))
      saveGameStats("draw")
      return
    }

    setAiraMessage(getRandomReaction("move"))
    setIsXNext(true)
  }

  // AI move effect
  useEffect(() => {
    if (!isXNext || gameStatus !== "playing" || !gameStarted) return

    const timer = setTimeout(() => {
      const newBoard = [...board]
      const bestMove = getBestMove(newBoard)
      newBoard[bestMove] = "X"
      setBoard(newBoard)

      const winner = calculateWinner(newBoard)
      if (winner === "X") {
        setGameStatus("lost")
        setAiraMessage(getRandomReaction("lose"))
        setStats((prev) => ({ ...prev, losses: prev.losses + 1 }))
        saveGameStats("loss")
        setIsXNext(false)
        return
      }

      if (newBoard.every((s) => s !== null)) {
        setGameStatus("draw")
        setAiraMessage(getRandomReaction("draw"))
        setStats((prev) => ({ ...prev, draws: prev.draws + 1 }))
        saveGameStats("draw")
        setIsXNext(false)
        return
      }

      setIsXNext(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [isXNext, board, gameStatus, gameStarted])

  // Start new game
  const startNewGame = () => {
    setBoard(Array(9).fill(null))
    setIsXNext(false)
    setGameStatus("playing")
    setAiraMessage(getRandomReaction("start"))
    setGameStarted(true)
    setMoveCount(0)
  }

  const renderSquare = (index: number) => {
    const value = board[index]
    return (
      <button
        onClick={() => handleClick(index)}
        className={`w-20 h-20 rounded-lg font-bold text-2xl transition-all duration-200 ${
          value === "O"
            ? "bg-primary/20 text-primary border-2 border-primary"
            : value === "X"
              ? "bg-secondary/20 text-secondary border-2 border-secondary"
              : "bg-muted hover:bg-muted/80 border-2 border-border"
        } ${!value && gameStatus === "playing" && !isXNext ? "cursor-pointer hover:scale-105" : ""}`}
        disabled={!!value || gameStatus !== "playing" || isXNext}
      >
        {value}
      </button>
    )
  }

  return (
    <div className="space-y-6">
      {/* Aira's Message */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">A</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-muted-foreground mb-1">Aira says…</p>
              <p className="text-lg font-medium">{airaMessage}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Board */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Noughts & Crosses</span>
            <span className="text-sm font-normal text-muted-foreground">
              {gameStatus === "playing" ? (isXNext ? "Aira's turn..." : "Your turn") : "Game Over"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Difficulty Selector */}
          {!gameStarted && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground">Select Difficulty:</p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={difficulty === "easy" ? "default" : "outline"}
                  onClick={() => setDifficulty("easy")}
                  className="gap-2"
                >
                  😊 Easy
                </Button>
                <Button
                  variant={difficulty === "hard" ? "default" : "outline"}
                  onClick={() => setDifficulty("hard")}
                  className="gap-2"
                >
                  🔥 Hard
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {difficulty === "easy"
                  ? "Aira will make some mistakes - perfect for beginners!"
                  : "Aira plays optimally - can you beat the AI?"}
              </p>
            </div>
          )}

          {gameStarted && (
            <div className="text-center">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-sm font-medium">
                {difficulty === "easy" ? "😊 Easy Mode" : "🔥 Hard Mode"}
              </span>
            </div>
          )}
          {/* Board */}
          <div className="flex justify-center">
            <div className="grid grid-cols-3 gap-2 bg-muted p-4 rounded-lg">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => renderSquare(i))}
            </div>
          </div>

          {/* Status */}
          {gameStatus !== "playing" && (
            <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/30">
              <p className="text-lg font-semibold">
                {gameStatus === "won"
                  ? "🎉 You Won!"
                  : gameStatus === "lost"
                    ? "Aira Won!"
                    : "It's a Draw!"}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-primary/10">
              <p className="text-2xl font-bold text-primary">{stats.wins}</p>
              <p className="text-xs text-muted-foreground">Wins</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/10">
              <p className="text-2xl font-bold text-secondary">{stats.losses}</p>
              <p className="text-xs text-muted-foreground">Losses</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-accent/10">
              <p className="text-2xl font-bold text-accent">{stats.draws}</p>
              <p className="text-xs text-muted-foreground">Draws</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button onClick={startNewGame} className="flex-1 gap-2">
              <RotateCcw className="w-4 h-4" />
              {gameStarted ? "Play Again" : "Start Game"}
            </Button>
            <Button variant="outline" className="gap-2">
              <Volume2 className="w-4 h-4" />
              Sound
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

