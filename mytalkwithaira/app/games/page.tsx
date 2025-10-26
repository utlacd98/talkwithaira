"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TicTacToe } from "@/components/games/TicTacToe"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeft, Gamepad2, Zap, Heart, Brain, Trophy, Flame } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { ThemeToggle } from "@/components/theme-toggle"

type GameType = "tictactoe" | null

interface UserStats {
  wins: number
  losses: number
  draws: number
  streak: number
}

export default function GamesPage() {
  const { user } = useAuth()
  const [selectedGame, setSelectedGame] = useState<GameType>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  // Fetch user stats
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user?.id) return

      try {
        setLoadingStats(true)
        const response = await fetch(`/api/games/leaderboard?userId=${user.id}`)
        const data = await response.json()

        if (data.success && data.userStats) {
          setUserStats({
            wins: data.userStats.wins,
            losses: data.userStats.losses,
            draws: data.userStats.draws,
            streak: data.userStats.streak,
          })
        }
      } catch (error) {
        console.error("[Games] Error fetching user stats:", error)
      } finally {
        setLoadingStats(false)
      }
    }

    fetchUserStats()
  }, [user?.id])

  const games = [
    {
      id: "tictactoe",
      name: "Noughts & Crosses",
      description: "Classic Tic-Tac-Toe with AI opponent",
      icon: Gamepad2,
      color: "from-primary to-accent",
      status: "available",
    },
    {
      id: "breathing",
      name: "Focus Breather",
      description: "Guided breathing rhythm timing",
      icon: Zap,
      color: "from-secondary to-primary",
      status: "coming-soon",
    },
    {
      id: "mood",
      name: "Mood Matcher",
      description: "Emoji reflection game",
      icon: Heart,
      color: "from-accent to-secondary",
      status: "coming-soon",
    },
    {
      id: "memory",
      name: "Memory Challenge",
      description: "Test your memory with Aira",
      icon: Brain,
      color: "from-primary to-secondary",
      status: "coming-soon",
    },
  ]

  if (selectedGame === "tictactoe") {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
          {/* Header */}
          <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-10">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedGame(null)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Games
              </Button>
              <ThemeToggle />
            </div>
          </header>

          {/* Game Content */}
          <main className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold font-heading mb-2">Noughts & Crosses</h1>
              <p className="text-muted-foreground">
                Challenge Aira to a game of Tic-Tac-Toe. Can you outsmart the AI?
              </p>
            </div>

            <TicTacToe />
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-10">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Gamepad2 className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold font-heading">Mini Games</h1>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Navigation Tabs */}
          <div className="flex gap-4 mb-8">
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Gamepad2 className="w-4 h-4" />
              Play Games
            </Button>
            <Link href="/games/leaderboard">
              <Button variant="outline" className="gap-2">
                <Trophy className="w-4 h-4" />
                Leaderboard
              </Button>
            </Link>
          </div>

          {/* User Stats Summary */}
          {userStats && !loadingStats && (
            <Card className="glass-card mb-8 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">📊</div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Your Record</p>
                      <p className="text-lg font-semibold">
                        {userStats.wins} Wins • {userStats.losses} Losses • {userStats.draws} Draws
                        {userStats.streak > 0 && (
                          <span className="ml-2 inline-flex items-center gap-1 text-orange-500">
                            <Flame className="w-4 h-4" />
                            Streak {userStats.streak}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Link href="/games/leaderboard">
                    <Button variant="ghost" className="gap-2">
                      <Trophy className="w-4 h-4" />
                      View Rank
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold font-heading mb-2">Play with Aira</h2>
            <p className="text-muted-foreground">
              Take a break from your day and enjoy some fun games with Aira. Challenge your mind, relax, and have a
              good time!
            </p>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {games.map((game) => {
              const Icon = game.icon
              const isAvailable = game.status === "available"

              return (
                <Card
                  key={game.id}
                  className={`glass-card overflow-hidden transition-all duration-300 ${
                    isAvailable ? "hover:shadow-lg hover:scale-105 cursor-pointer" : "opacity-60"
                  }`}
                  onClick={() => isAvailable && setSelectedGame(game.id as GameType)}
                >
                  {/* Gradient Background */}
                  <div className={`h-24 bg-gradient-to-r ${game.color} opacity-20`} />

                  <CardHeader className="relative -mt-12 pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${game.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {!isAvailable && (
                        <span className="px-3 py-1 rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <CardTitle className="mt-4">{game.name}</CardTitle>
                    <CardDescription>{game.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    {isAvailable ? (
                      <Button className="w-full">Play Now</Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        Coming Soon
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Info Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>🎮 About Mini Games</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Mini Games are designed to help you take a mental break while having fun with Aira. Each game is
                crafted to be engaging, relaxing, and rewarding.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="font-semibold text-sm mb-1">🧠 Mental Wellness</p>
                  <p className="text-xs text-muted-foreground">Games designed to boost focus and creativity</p>
                </div>
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="font-semibold text-sm mb-1">💚 Aira Interaction</p>
                  <p className="text-xs text-muted-foreground">Enjoy witty dialogue and encouragement from Aira</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                  <p className="font-semibold text-sm mb-1">📊 Track Progress</p>
                  <p className="text-xs text-muted-foreground">Monitor your game stats and improvements</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back to Dashboard */}
          <div className="mt-8 text-center pb-8">
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

