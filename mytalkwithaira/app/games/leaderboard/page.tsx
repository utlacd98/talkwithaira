"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy, Flame, Target } from "lucide-react"

interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  wins: number
  losses: number
  draws: number
  streak: number
  totalGames: number
  winRate: string
  lastPlayedAt?: string
}

interface LeaderboardResponse {
  success: boolean
  leaderboard: LeaderboardEntry[]
  total: number
  userRank?: number
  userStats?: {
    rank: number | null
    username: string
    wins: number
    losses: number
    draws: number
    streak: number
    totalGames: number
    winRate: string
  }
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userStats, setUserStats] = useState<LeaderboardResponse["userStats"]>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `/api/games/leaderboard?userId=${user?.id || ""}&limit=10`
        )

        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard")
        }

        const data: LeaderboardResponse = await response.json()

        if (data.success) {
          setLeaderboard(data.leaderboard)
          setUserStats(data.userStats)
          console.log("[Leaderboard] Loaded:", data.leaderboard.length, "users")
        } else {
          setError("Failed to load leaderboard")
        }
      } catch (err) {
        console.error("[Leaderboard] Error:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchLeaderboard()
    }
  }, [user?.id])

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "🥇"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return `#${rank}`
  }

  const getStreakColor = (streak: number) => {
    if (streak >= 5) return "text-red-500"
    if (streak >= 3) return "text-orange-500"
    if (streak > 0) return "text-yellow-500"
    return "text-gray-400"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/games">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
          </Button>
        </Link>

        <div className="flex items-center gap-4 mb-6">
          <Trophy className="w-8 h-8 text-accent" />
          <div>
            <h1 className="text-4xl font-bold text-white">Leaderboard</h1>
            <p className="text-slate-400">See how you rank against other players</p>
          </div>
        </div>
      </div>

      {/* Aira Message */}
      <Card className="glass-card mb-8 border-accent/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💚</div>
            <div>
              <p className="text-lg font-semibold text-white mb-2">Aira says...</p>
              <p className="text-slate-300">
                {userStats && userStats.rank && userStats.rank <= 3
                  ? "Wow! You're dominating lately! 🔥"
                  : userStats && userStats.streak >= 5
                    ? "Unstoppable energy today! Keep it up! 💪"
                    : "Here's how everyone's doing! You're climbing the board 💚"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Stats Summary */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass-card border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Your Rank</p>
                <p className="text-3xl font-bold text-primary">
                  {userStats.rank ? `#${userStats.rank}` : "—"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-green-500/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Wins</p>
                <p className="text-3xl font-bold text-green-500">{userStats.wins}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-red-500/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Losses</p>
                <p className="text-3xl font-bold text-red-500">{userStats.losses}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-accent/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Win Rate</p>
                <p className="text-3xl font-bold text-accent">{userStats.winRate}%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leaderboard Table */}
      <Card className="glass-card border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent" />
            Top Players
          </CardTitle>
          <CardDescription>
            {leaderboard.length} players ranked by wins and streak
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-400">Loading leaderboard...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Error: {error}</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">No players yet. Be the first to play!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Rank</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Player</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-semibold">Wins</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-semibold">Losses</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-semibold">Draws</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-semibold">Streak</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-semibold">Win Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => {
                    const isCurrentUser = entry.userId === user?.id
                    return (
                      <tr
                        key={entry.userId}
                        className={`border-b border-slate-700 transition-colors ${
                          isCurrentUser
                            ? "bg-primary/10 hover:bg-primary/20"
                            : "hover:bg-slate-700/50"
                        }`}
                      >
                        <td className="py-4 px-4">
                          <span className="text-lg font-bold">
                            {getRankBadge(entry.rank)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">
                              {entry.username}
                            </span>
                            {isCurrentUser && (
                              <span className="text-xs bg-primary/30 text-primary px-2 py-1 rounded">
                                You
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-green-500 font-semibold">
                            {entry.wins}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-red-500 font-semibold">
                            {entry.losses}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-slate-400">{entry.draws}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {entry.streak > 0 && (
                              <Flame className={`w-4 h-4 ${getStreakColor(entry.streak)}`} />
                            )}
                            <span className={`font-semibold ${getStreakColor(entry.streak)}`}>
                              {entry.streak}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-accent font-semibold">
                            {entry.winRate}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center">
        <Link href="/games">
          <Button className="bg-primary hover:bg-primary/90">
            <Target className="w-4 h-4 mr-2" />
            Play Now
          </Button>
        </Link>
      </div>
    </div>
  )
}

