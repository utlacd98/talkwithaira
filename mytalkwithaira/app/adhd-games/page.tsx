"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Brain, Target, Zap, Grid3X3, Type, Trophy } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

const games = [
  {
    id: "focus-bubbles",
    name: "Focus Bubbles",
    description: "Pop green bubbles, avoid red ones. Train your selective attention and impulse control.",
    icon: Target,
    color: "from-green-500 to-emerald-600",
    benefit: "Attention & Impulse Control",
  },
  {
    id: "pattern-chase",
    name: "Pattern Chase",
    description: "Remember and repeat glowing patterns. Strengthen your working memory.",
    icon: Grid3X3,
    color: "from-violet-500 to-purple-600",
    benefit: "Working Memory",
  },
  {
    id: "distraction-dodge",
    name: "Distraction Dodge",
    description: "Keep focus on a moving target while ignoring distractions. Build sustained attention.",
    icon: Zap,
    color: "from-orange-500 to-red-500",
    benefit: "Sustained Attention",
  },
  {
    id: "word-sort",
    name: "Word Sort",
    description: "Quickly categorize falling words. Improve processing speed and decision making.",
    icon: Type,
    color: "from-cyan-500 to-blue-600",
    benefit: "Processing Speed",
  },
]

export default function ADHDGamesPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-violet-950/20">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-10">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold font-heading">ADHD Cognitive Support Games</h1>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Welcome Section */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold font-heading mb-3 bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Train Your Focus
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These games are designed to help strengthen cognitive skills commonly challenged by ADHD.
              Play regularly for best results. Each game targets a specific skill.
            </p>
          </div>

          {/* Leaderboard Banner */}
          <Link href="/adhd-games/leaderboard">
            <Card className="glass-card mb-8 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20 hover:scale-[1.01] cursor-pointer border-yellow-500/30 hover:border-yellow-500/50">
              <div className="flex items-center justify-between p-4 md:p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <Trophy className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-yellow-400">Leaderboard</h3>
                    <p className="text-sm text-muted-foreground">Compete with others and climb the ranks!</p>
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90 text-white font-semibold hidden sm:flex">
                  View Rankings
                </Button>
                <ArrowLeft className="w-5 h-5 text-yellow-400 rotate-180 sm:hidden" />
              </div>
            </Card>
          </Link>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {games.map((game) => {
              const Icon = game.icon
              return (
                <Link key={game.id} href={`/adhd-games/${game.id}`}>
                  <Card className="glass-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/20 hover:scale-[1.02] cursor-pointer h-full border-violet-500/20 hover:border-violet-500/40">
                    {/* Gradient Background */}
                    <div className={`h-20 bg-gradient-to-r ${game.color} opacity-30`} />

                    <CardHeader className="relative -mt-10 pb-3">
                      <div className="flex items-start justify-between">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center shadow-lg`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <span className="px-3 py-1 rounded-full bg-violet-500/20 text-xs font-semibold text-violet-300 border border-violet-500/30">
                          {game.benefit}
                        </span>
                      </div>
                      <CardTitle className="mt-4 text-xl">{game.name}</CardTitle>
                      <CardDescription className="text-sm">{game.description}</CardDescription>
                    </CardHeader>

                    <CardContent>
                      <Button className={`w-full bg-gradient-to-r ${game.color} hover:opacity-90 text-white font-semibold`}>
                        Play Now
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>

          {/* Info Section */}
          <Card className="glass-card border-violet-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-violet-400" />
                About ADHD Cognitive Training
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                These games are based on cognitive training principles that can help improve focus, 
                working memory, and impulse control. While they&apos;re not a replacement for professional 
                treatment, regular practice may help strengthen these cognitive skills.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="font-semibold text-sm mb-1 text-green-400">🎯 Selective Attention</p>
                  <p className="text-xs text-muted-foreground">Focus on what matters, ignore distractions</p>
                </div>
                <div className="p-4 rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <p className="font-semibold text-sm mb-1 text-violet-400">🧠 Working Memory</p>
                  <p className="text-xs text-muted-foreground">Hold and manipulate information</p>
                </div>
                <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <p className="font-semibold text-sm mb-1 text-orange-400">⚡ Sustained Focus</p>
                  <p className="text-xs text-muted-foreground">Maintain attention over time</p>
                </div>
                <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <p className="font-semibold text-sm mb-1 text-cyan-400">🚀 Processing Speed</p>
                  <p className="text-xs text-muted-foreground">Quick decisions and reactions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back to Dashboard */}
          <div className="mt-8 text-center pb-8">
            <Link href="/dashboard">
              <Button variant="outline" className="border-violet-500/30 hover:border-violet-500/50">Back to Dashboard</Button>
            </Link>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

