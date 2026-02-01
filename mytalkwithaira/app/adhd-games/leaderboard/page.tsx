"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy, Brain, Zap, Target, Eye, Type } from "lucide-react"

interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  focusBubbles: number
  patternChase: number
  distractionDodge: number
  wordSort: number
  totalScore: number
  lastPlayedAt?: string
}

interface LeaderboardResponse {
  success: boolean
  leaderboard: LeaderboardEntry[]
  total: number
  userRank?: number | null
  userStats?: {
    rank: number | null
    username: string
    focusBubbles: number
    patternChase: number
    distractionDodge: number
    wordSort: number
    totalScore: number
  } | null
}

export default function ADHDLeaderboardPage() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userStats, setUserStats] = useState<LeaderboardResponse["userStats"]>(null)
  const [userRank, setUserRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `/api/adhd-games/leaderboard?userId=${user?.id || ""}&limit=20`
        )

        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard")
        }

        const data: LeaderboardResponse = await response.json()

        if (data.success) {
          setLeaderboard(data.leaderboard)
          setUserStats(data.userStats)
          setUserRank(data.userRank ?? null)
        } else {
          setError("Failed to load leaderboard")
        }
      } catch (err) {
        console.error("[ADHD Leaderboard] Error:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [user?.id])

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "🥇"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return `#${rank}`
  }

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50"
    if (rank === 2) return "bg-gradient-to-r from-slate-400/20 to-slate-500/20 border-slate-400/50"
    if (rank === 3) return "bg-gradient-to-r from-orange-600/20 to-amber-700/20 border-orange-600/50"
    return ""
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-violet-950/20 p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/adhd-games">
            <Button variant="ghost" className="mb-4 text-violet-400 hover:text-violet-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to ADHD Games
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-violet-500/20">
              <Trophy className="w-8 h-8 text-violet-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">ADHD Games Leaderboard</h1>
              <p className="text-muted-foreground">Compete with others and train your brain!</p>
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        <Card className="glass-card mb-8 border-violet-500/30 bg-violet-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🧠</div>
              <div>
                <p className="text-lg font-semibold text-white mb-2">Brain Training Progress</p>
                <p className="text-muted-foreground">
                  {userStats && userRank && userRank <= 3
                    ? "You're in the top 3! Your focus is incredible! 🔥"
                    : userStats && userStats.totalScore > 100
                      ? "Great progress! Keep training to climb the ranks! 💪"
                      : "Play games to see your name on the leaderboard! Every point trains your brain 💜"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Stats Summary */}
        {userStats && userStats.totalScore > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-8">
            <Card className="glass-card border-violet-500/30">
              <CardContent className="pt-4 pb-4">
                <div className="text-center">
                  <p className="text-muted-foreground text-xs mb-1">Your Rank</p>
                  <p className="text-2xl font-bold text-violet-400">
                    {userRank ? getRankBadge(userRank) : "—"}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-emerald-500/30">
              <CardContent className="pt-4 pb-4">
                <div className="text-center">
                  <Target className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                  <p className="text-lg font-bold text-emerald-400">{userStats.focusBubbles}</p>
                  <p className="text-muted-foreground text-xs">Bubbles</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-purple-500/30">
              <CardContent className="pt-4 pb-4">
                <div className="text-center">
                  <Brain className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                  <p className="text-lg font-bold text-purple-400">{userStats.patternChase}</p>
                  <p className="text-muted-foreground text-xs">Pattern</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-orange-500/30">
              <CardContent className="pt-4 pb-4">
                <div className="text-center">
                  <Eye className="w-4 h-4 mx-auto mb-1 text-orange-400" />
                  <p className="text-lg font-bold text-orange-400">{userStats.distractionDodge}</p>
                  <p className="text-muted-foreground text-xs">Dodge</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-cyan-500/30">
              <CardContent className="pt-4 pb-4">
                <div className="text-center">
                  <Type className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
                  <p className="text-lg font-bold text-cyan-400">{userStats.wordSort}</p>
                  <p className="text-muted-foreground text-xs">Words</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Leaderboard Table */}
        <Card className="glass-card border-violet-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-violet-400" />
              Top Brain Trainers
            </CardTitle>
            <CardDescription>
              {leaderboard.length} players ranked by total score
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Loading leaderboard...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">Error: {error}</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No players yet. Be the first!</p>
                <Link href="/adhd-games">
                  <Button className="bg-violet-600 hover:bg-violet-700">
                    <Zap className="w-4 h-4 mr-2" />
                    Start Playing
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-2 md:px-4 text-muted-foreground font-semibold text-sm">Rank</th>
                      <th className="text-left py-3 px-2 md:px-4 text-muted-foreground font-semibold text-sm">Player</th>
                      <th className="text-center py-3 px-1 md:px-4 text-muted-foreground font-semibold text-sm hidden md:table-cell">
                        <Target className="w-4 h-4 inline text-emerald-400" />
                      </th>
                      <th className="text-center py-3 px-1 md:px-4 text-muted-foreground font-semibold text-sm hidden md:table-cell">
                        <Brain className="w-4 h-4 inline text-purple-400" />
                      </th>
                      <th className="text-center py-3 px-1 md:px-4 text-muted-foreground font-semibold text-sm hidden md:table-cell">
                        <Eye className="w-4 h-4 inline text-orange-400" />
                      </th>
                      <th className="text-center py-3 px-1 md:px-4 text-muted-foreground font-semibold text-sm hidden md:table-cell">
                        <Type className="w-4 h-4 inline text-cyan-400" />
                      </th>
                      <th className="text-center py-3 px-2 md:px-4 text-muted-foreground font-semibold text-sm">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry) => {
                      const isCurrentUser = entry.userId === user?.id
                      return (
                        <tr
                          key={entry.userId}
                          className={`border-b border-border/30 transition-colors ${
                            isCurrentUser
                              ? "bg-violet-500/10 hover:bg-violet-500/20"
                              : entry.rank <= 3
                                ? getRankStyle(entry.rank)
                                : "hover:bg-muted/30"
                          }`}
                        >
                          <td className="py-3 px-2 md:px-4">
                            <span className="text-lg font-bold">{getRankBadge(entry.rank)}</span>
                          </td>
                          <td className="py-3 px-2 md:px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white truncate max-w-[100px] md:max-w-none">
                                {entry.username}
                              </span>
                              {isCurrentUser && (
                                <span className="text-xs bg-violet-500/30 text-violet-300 px-2 py-0.5 rounded">
                                  You
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-1 md:px-4 text-center hidden md:table-cell">
                            <span className="text-emerald-400">{entry.focusBubbles}</span>
                          </td>
                          <td className="py-3 px-1 md:px-4 text-center hidden md:table-cell">
                            <span className="text-purple-400">{entry.patternChase}</span>
                          </td>
                          <td className="py-3 px-1 md:px-4 text-center hidden md:table-cell">
                            <span className="text-orange-400">{entry.distractionDodge}</span>
                          </td>
                          <td className="py-3 px-1 md:px-4 text-center hidden md:table-cell">
                            <span className="text-cyan-400">{entry.wordSort}</span>
                          </td>
                          <td className="py-3 px-2 md:px-4 text-center">
                            <span className="text-violet-400 font-bold text-lg">{entry.totalScore}</span>
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
          <Link href="/adhd-games">
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Zap className="w-4 h-4 mr-2" />
              Play Games
            </Button>
          </Link>
        </div>

        {/* Future Leagues Teaser */}
        <Card className="glass-card border-violet-500/20 mt-8 bg-gradient-to-r from-violet-950/30 to-purple-950/30">
          <CardContent className="pt-6 text-center">
            <p className="text-violet-400 font-semibold mb-2">🌍 Coming Soon: Continental Leagues!</p>
            <p className="text-muted-foreground text-sm">
              Compete in your continent's league. Top 3 advance to the World Championship!
            </p>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}

