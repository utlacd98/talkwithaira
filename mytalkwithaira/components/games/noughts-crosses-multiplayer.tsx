"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Trophy, Clock, X as XIcon, Circle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

interface GameSession {
  gameId: string
  gameType: string
  player1: { userId: string; username: string }
  player2: { userId: string; username: string }
  currentTurn: string
  board: string[]
  status: "waiting" | "active" | "finished"
  winner?: string
  createdAt: number
  lastMove: number
}

export function NoughtsCrossesMultiplayer() {
  const { user } = useAuth()
  const [isSearching, setIsSearching] = useState(false)
  const [game, setGame] = useState<GameSession | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  // Join matchmaking
  const joinMatchmaking = async () => {
    if (!user) return

    setIsSearching(true)
    setError(null)

    try {
      const response = await fetch("/api/games/matchmaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          username: user.name || user.email,
          gameType: "noughts-crosses",
        }),
      })

      const data = await response.json()

      if (data.matched) {
        // Matched immediately
        await loadGame()
      } else {
        // Start polling for match
        startPolling()
      }
    } catch (err) {
      console.error("Error joining matchmaking:", err)
      setError("Failed to join matchmaking")
      setIsSearching(false)
    }
  }

  // Leave matchmaking
  const leaveMatchmaking = async () => {
    if (!user) return

    try {
      await fetch("/api/games/matchmaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          username: user.name || user.email,
          gameType: "noughts-crosses",
          action: "leave",
        }),
      })
    } catch (err) {
      console.error("Error leaving matchmaking:", err)
    }

    setIsSearching(false)
    stopPolling()
  }

  // Load current game state
  const loadGame = useCallback(async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/games/matchmaking?userId=${user.id}`)
      const data = await response.json()

      if (data.game) {
        setGame(data.game)
        setIsSearching(false)
        
        // If game is active, start polling for updates
        if (data.game.status === "active") {
          startPolling()
        } else if (data.game.status === "finished") {
          stopPolling()
        }
      }
    } catch (err) {
      console.error("Error loading game:", err)
    }
  }, [user])

  // Make a move
  const makeMove = async (position: number) => {
    if (!game || !user || game.currentTurn !== user.id) return

    try {
      const response = await fetch("/api/games/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: game.gameId,
          userId: user.id,
          position,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setGame(data.game)
      } else {
        setError(data.error || "Failed to make move")
      }
    } catch (err) {
      console.error("Error making move:", err)
      setError("Failed to make move")
    }
  }

  // End game
  const endGame = async () => {
    if (!game) return

    try {
      await fetch("/api/games/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: game.gameId,
          userId: user?.id,
          action: "end",
        }),
      })

      setGame(null)
      stopPolling()
    } catch (err) {
      console.error("Error ending game:", err)
    }
  }

  // Polling for game updates
  const startPolling = () => {
    if (pollingInterval) return

    const interval = setInterval(async () => {
      await loadGame()
    }, 2000) // Poll every 2 seconds

    setPollingInterval(interval)
  }

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      setPollingInterval(null)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [])

  // Load game on mount
  useEffect(() => {
    if (user) {
      loadGame()
    }
  }, [user, loadGame])

  if (!user) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Noughts & Crosses - Multiplayer</CardTitle>
          <CardDescription>Please log in to play</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const isMyTurn = game && game.currentTurn === user.id
  const mySymbol = game && game.player1.userId === user.id ? "X" : "O"
  const opponent = game && (game.player1.userId === user.id ? game.player2 : game.player1)

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Noughts & Crosses - Multiplayer
        </CardTitle>
        <CardDescription>
          {game ? `Playing against ${opponent?.username}` : "Find an opponent and play!"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Searching for Match */}
        {isSearching && !game && (
          <div className="text-center space-y-4 py-8">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
            <div>
              <p className="font-semibold">Searching for opponent...</p>
              <p className="text-sm text-muted-foreground">This may take up to 1 minute</p>
            </div>
            <Button onClick={leaveMatchmaking} variant="outline">
              Cancel Search
            </Button>
          </div>
        )}

        {/* No Game - Show Join Button */}
        {!isSearching && !game && (
          <div className="text-center space-y-4 py-8">
            <Users className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <p className="font-semibold">Ready to play?</p>
              <p className="text-sm text-muted-foreground">
                We'll match you with another player
              </p>
            </div>
            <Button onClick={joinMatchmaking} className="w-full max-w-xs">
              <Users className="w-4 h-4 mr-2" />
              Find Opponent
            </Button>
          </div>
        )}

        {/* Active Game */}
        {game && (
          <>
            {/* Game Info */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold",
                  mySymbol === "X" ? "bg-blue-500 text-white" : "bg-red-500 text-white"
                )}>
                  {mySymbol}
                </div>
                <span className="font-semibold">You</span>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">VS</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{opponent?.username}</span>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold",
                  mySymbol === "O" ? "bg-blue-500 text-white" : "bg-red-500 text-white"
                )}>
                  {mySymbol === "X" ? "O" : "X"}
                </div>
              </div>
            </div>

            {/* Turn Indicator */}
            {game.status === "active" && (
              <div className={cn(
                "p-3 rounded-lg text-center font-semibold",
                isMyTurn 
                  ? "bg-green-500/10 border border-green-500/20 text-green-500"
                  : "bg-orange-500/10 border border-orange-500/20 text-orange-500"
              )}>
                {isMyTurn ? "Your Turn!" : `${opponent?.username}'s Turn`}
              </div>
            )}

            {/* Game Board */}
            <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
              {game.board.map((cell, index) => (
                <button
                  key={index}
                  onClick={() => makeMove(index)}
                  disabled={!isMyTurn || cell !== "" || game.status !== "active"}
                  className={cn(
                    "aspect-square rounded-lg border-2 flex items-center justify-center text-4xl font-bold transition-all",
                    "hover:bg-muted/50 disabled:cursor-not-allowed",
                    cell === "" && isMyTurn && game.status === "active" && "hover:border-primary",
                    cell === "X" && "text-blue-500 border-blue-500/30",
                    cell === "O" && "text-red-500 border-red-500/30",
                    cell === "" && "border-border"
                  )}
                >
                  {cell === "X" && <XIcon className="w-12 h-12" />}
                  {cell === "O" && <Circle className="w-12 h-12" />}
                </button>
              ))}
            </div>

            {/* Game Result */}
            {game.status === "finished" && (
              <div className="text-center space-y-4">
                <div className={cn(
                  "p-4 rounded-lg",
                  game.winner === user.id 
                    ? "bg-green-500/10 border border-green-500/20"
                    : game.winner === "draw"
                    ? "bg-blue-500/10 border border-blue-500/20"
                    : "bg-red-500/10 border border-red-500/20"
                )}>
                  <Trophy className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-xl font-bold">
                    {game.winner === user.id 
                      ? "You Won! 🎉"
                      : game.winner === "draw"
                      ? "It's a Draw!"
                      : "You Lost"}
                  </p>
                </div>
                <Button onClick={endGame} variant="outline" className="w-full">
                  Play Again
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

